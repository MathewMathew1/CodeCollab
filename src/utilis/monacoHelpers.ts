import { Monaco } from "@monaco-editor/react";
import { getRelativePath } from "./ProjectPath";
import { editor } from "monaco-editor";
import { getExtensionFromFilename } from "./dockerodeHelper";

export const createCompletionProviderJavascript = (monaco: Monaco, editor: editor.IStandaloneCodeEditor) => {
    return {
      provideCompletionItems: (
        model: {
          getValueInRange: (arg0: {
            startLineNumber: number;
            startColumn: number;
            endLineNumber: number;
            endColumn: number;
          }) => string;
        },
        position: { lineNumber: number; column: number },
        context: any,
        token: any,
      ) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
  
        const currentModel = editor.getModel();

        if (!currentModel) {
          return { suggestions: [] };
        }
  
        const currentFilePath = currentModel.uri.path;
 
        const importPattern = /(([\s|\n]+from\s+)|(\brequire\b\s*\())["|'][^'^"]*$/;
        if (importPattern.test(textUntilPosition)) {
          if (textUntilPosition.endsWith(".") || textUntilPosition.endsWith("/")) {
            const suggestions = monaco.editor
              .getModels()
              .filter(file => {
                const extension = getExtensionFromFilename(file.uri.path)
                
                if(extension !=="ts" && extension !== "js"){
                  return false
                }
                return file.uri.path !== currentFilePath
              })
              .map(file => {
                let filename = getRelativePath(currentFilePath, file.uri.path)
                  .replace(/\.(js|ts)$/, "");

                const match =
                  /(([\s|\n]+from\s+)|(\brequire\b\s*\())["|']([^'^"]*)$/.exec(
                    textUntilPosition,
                  );

                const typedText = match![4]!;
                const fileToSuggest = filename.slice(typedText!.length);
  
                return {
                  label: filename,
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                  insertText: fileToSuggest,
                  kind: monaco.languages.CompletionItemKind.File,
                };
              })
              .filter(Boolean);
  
            return { suggestions };
          } else {
            return { suggestions: [] };
          }
        }
  
        return { suggestions: [] };
      },
    };
  }