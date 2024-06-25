import React, { useState, useEffect, useRef, useMemo } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { trpc } from "../utils/api";
import { useRouter } from "next/router";
import diffMatchPatch from "diff-match-patch";
import { editor } from "monaco-editor";
import { useProject } from "../pages/project/[id]";
import {
  getExtensionFromFilename,
  getLanguageFromExtension,
} from "../utilis/dockerodeHelper";

const LENGTH_OF_LINE_BREAK = 2;

const CodeEditor = ({
  setMonacoAtStart,
  initialValue,
  idOfFile,
  connectToChanges,
  disconnectFromChanges,
  requestId,
  monaco,
  editor,
}: {
  initialValue: string;
  editor: editor.IStandaloneCodeEditor | null;
  monaco: Monaco | null;
  idOfFile: number;
  requestId: string;
  setMonacoAtStart: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => void;
  connectToChanges: (
    applyRemoteChange: (
      diffs: any,
      editor: editor.IStandaloneCodeEditor,
    ) => Promise<void>,
    idOfFile: number,
    editor: editor.IStandaloneCodeEditor,
  ) => void;
  disconnectFromChanges: () => void;
}) => {
  const [language, setLanguage] = useState("javascript");

  const currentCode = useRef(initialValue);
  const preventSendingMessage = useRef(false);
  const router = useRouter();
  const { id } = router.query;

  const project = useProject();

  const updateFile = trpc.file.update.useMutation();

  useEffect(() => {
    if (!project.selectedFile) return;

    const extension = getExtensionFromFilename(project.selectedFile?.name);
    const languageOfFile = getLanguageFromExtension(extension);
    setLanguage(languageOfFile);
  }, [project.selectedFile?.name]);

  useEffect(() => {
    if (editor) {
      connectToChanges(applyRemoteChange, idOfFile, editor);
    }

    return () => {
      disconnectFromChanges();
    };
  }, [editor]);

  const applyRemoteChange = async (
    diffs: any,
    editor: editor.IStandaloneCodeEditor,
  ) => {
    const dmp = new diffMatchPatch();

    const newSelection = getNewSelection(diffs);
    const model = editor!.getModel()!;

    const patch = dmp.patch_make(model.getValue(), diffs);
    const [newText] = dmp.patch_apply(patch, model.getValue());

    currentCode.current = newText;
    preventSendingMessage.current = true;

    model.pushEditOperations(
      [],
      [
        {
          text: newText,
          range: {
            endColumn: model.getLineMaxColumn(model.getLineCount()),
            endLineNumber: model.getLineCount(),
            startColumn: 1,
            startLineNumber: 1,
          },
        },
      ],
      () => [],
    );

    project.setFileContent(idOfFile, newText);
    editor!.setSelection(newSelection);
  };

  const getNewSelection = (diffs: any) => {
    const currentSelectionStart = editor!.getSelection()?.startColumn || 1;
    const currentSelectionEnd = editor!.getSelection()?.endColumn || 1;
    let newSelectionStart = currentSelectionStart;
    let newSelectionEnd = currentSelectionEnd;
    let charactersInsideText = 0;
    let changesInStartColumn = 0;
    let changesInEndColumn = 0;
    let currentColumnBeforeChanges = 1;
    let currentTextBeforeChanges = 1;
    let columnOfSelectionStart = editor!.getSelection()!.startLineNumber || 1;
    let columnOfSelectionEnd = editor!.getSelection()!.endLineNumber || 1;

    for (let i = 0; i < diffs.length; i++) {
      charactersInsideText = charactersInsideText + diffs[i][1].length;
      const lineBreaks = [0, ...getHowManyLineBreaksAreInString(diffs[i][1])];

      lineBreaks.forEach((lineBreak, index) => {
        const endOfLine = lineBreaks[index + 1] || diffs[i][1].length;
        const textTillEndOfLine = endOfLine - lineBreak;

        if (diffs[i][0] === 1) {
          if (
            currentColumnBeforeChanges <= columnOfSelectionStart &&
            index !== 0 &&
            currentTextBeforeChanges <= currentSelectionStart
          ) {
            changesInStartColumn = changesInStartColumn + 1;
          }

          if (
            currentColumnBeforeChanges <= columnOfSelectionEnd &&
            index !== 0 &&
            currentTextBeforeChanges <= currentSelectionStart
          ) {
            changesInEndColumn = changesInEndColumn + 1;
          }

          if (currentColumnBeforeChanges === columnOfSelectionStart) {
            if (currentTextBeforeChanges > currentSelectionStart) {
              return;
            } else {
              if (index === 0) {
                newSelectionStart = newSelectionStart + textTillEndOfLine;
              } else {
                newSelectionStart =
                  newSelectionStart - currentTextBeforeChanges - 1;
              }
            }
          }

          if (currentColumnBeforeChanges === columnOfSelectionEnd) {
            if (currentTextBeforeChanges > currentSelectionEnd) {
              return;
            } else {
              if (index === 0) {
                newSelectionEnd = newSelectionEnd + textTillEndOfLine;
              } else {
                newSelectionEnd =
                  newSelectionEnd - currentTextBeforeChanges - 1;
              }
            }
          }
        }

        if (diffs[i][0] === 0) {
          if (currentColumnBeforeChanges === columnOfSelectionStart) {
            currentTextBeforeChanges =
              currentTextBeforeChanges + textTillEndOfLine;
          }

          if (index !== 0) {
            currentColumnBeforeChanges = currentColumnBeforeChanges + 1;
          }
        }

        if (diffs[i][0] === -1) {
          if (
            currentColumnBeforeChanges <= columnOfSelectionStart &&
            index !== 0 &&
            currentTextBeforeChanges <= currentSelectionStart
          ) {
            changesInStartColumn = changesInStartColumn - 1;
          }

          if (
            currentColumnBeforeChanges <= columnOfSelectionEnd &&
            index !== 0 &&
            currentTextBeforeChanges <= currentSelectionEnd
          ) {
            changesInEndColumn = changesInEndColumn - 1;
          }

          if (currentColumnBeforeChanges === columnOfSelectionStart) {
            if (currentTextBeforeChanges >= currentSelectionStart) {
              return;
            } else {
              if (index === 0) {
                newSelectionStart = newSelectionStart - textTillEndOfLine;
              } else {
                let amountOfTextSinceLastLineBreak = 0;
                if (index > 1) {
                  amountOfTextSinceLastLineBreak =
                    lineBreak - lineBreaks[index - 1]!;
                } else {
                  amountOfTextSinceLastLineBreak =
                    getLengthOfTextSinceLastLineBreak(diffs, i) + lineBreak;
                }
                newSelectionStart =
                  newSelectionStart + amountOfTextSinceLastLineBreak;
              }
            }
          }

          if (currentColumnBeforeChanges === columnOfSelectionEnd) {
            if (currentTextBeforeChanges >= currentSelectionEnd) {
              return;
            } else {
              if (index === 0) {
                newSelectionEnd = newSelectionEnd - textTillEndOfLine;
              } else {
                let amountOfTextSinceLastLineBreak = 0;
                if (index > 1) {
                  amountOfTextSinceLastLineBreak =
                    lineBreak - lineBreaks[index - 1]!;
                } else {
                  amountOfTextSinceLastLineBreak =
                    getLengthOfTextSinceLastLineBreak(diffs, i) + lineBreak;
                }
                newSelectionEnd =
                  newSelectionEnd + amountOfTextSinceLastLineBreak;
              }
            }
          }

          currentColumnBeforeChanges = currentColumnBeforeChanges + 1;
        }
      });
      if (currentColumnBeforeChanges > columnOfSelectionStart) continue;
    }

    return new monaco!.Selection(
      columnOfSelectionStart + changesInStartColumn,
      newSelectionStart,
      columnOfSelectionEnd + changesInEndColumn,
      newSelectionEnd,
    );
  };

  const getLengthOfTextSinceLastLineBreak = (diffs: any, i: number) => {
    let amountOfTextSinceLastLineBreak = 0;
    for (let a = i - 1; a >= 0; a--) {
      const lineBreaks = getHowManyLineBreaksAreInString(diffs[a][1]);

      if (lineBreaks.length === 0) {
        amountOfTextSinceLastLineBreak =
          amountOfTextSinceLastLineBreak + diffs[a][1].length;
      } else {
        amountOfTextSinceLastLineBreak =
          amountOfTextSinceLastLineBreak +
          (diffs[a][1].length - lineBreaks[lineBreaks.length - 1]!) -
          LENGTH_OF_LINE_BREAK;
        break;
      }
    }

    return amountOfTextSinceLastLineBreak;
  };

  const handleEditorChange = async (newCode: string | undefined) => {
    if (newCode === currentCode.current) {
      return;
    }
    if (preventSendingMessage.current === true) {
      preventSendingMessage.current = false;
      return;
    }
    if (newCode !== undefined) {
      const dmp = new diffMatchPatch();

      const diff = dmp.diff_main(currentCode.current, newCode);
      currentCode.current = newCode;
      project.setFileContent(idOfFile, newCode);
      await updateFile.mutateAsync({
        fileId: idOfFile,
        change: diff,
        requestId,
      });
    }
  };

  useEffect(() => {
    if (typeof id === "string") {
    }
  }, [id]);

  useEffect(() => {
    if (project.selectedFile !== undefined) {
      currentCode.current = project.selectedFile?.content;
    }
  }, [project.selectedFile?.id]);

  const getHowManyLineBreaksAreInString = (text: string) => {
    const lineBreaks = text.match(/\r\n|\r|\n/g);

    //Determine the positions of line breaks
    const lineBreakPositions: number[] = [];
    let currentPosition = 0;

    if (lineBreaks) {
      lineBreaks.forEach((lineBreak) => {
        const position = text.indexOf(lineBreak, currentPosition);
        if (position !== -1) {
          lineBreakPositions.push(position);
          currentPosition = position + lineBreak.length;
        }
      });
    }

    return lineBreakPositions;
  };

  const change = () => {
    const a = editor!.getModel()!;
    a.pushEditOperations(
      [],
      [
        {
          text: "newText",
          range: {
            endColumn: 1,
            endLineNumber: 1,
            startColumn: 1,
            startLineNumber: 1,
          },
        },
      ],
      // CHANGE THIS
      // () => null,
      () => null,
    );
  };

  console.log(language);

  return (
    <div className="flex-1 overflow-hidden w-full">
      <Editor
        onMount={(e, a) => setMonacoAtStart(e, a)}
        className={`scrollbar min-h-full overflow-auto w-full`}
        language={language}
        theme="vs-dark"
        value={""}
        onChange={(e) => handleEditorChange(e)}
      />
      <button onClick={() => change()}>as</button>
    </div>
  );
};

export default CodeEditor;
