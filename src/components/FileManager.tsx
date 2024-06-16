import diffMatchPatch from "diff-match-patch";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import Console from "~/components/Console";
import CodeEditor from "~/components/MonacoEditor";
import SidebarProjectSolution from "~/components/SidebarProjectSolution";
import { useProject } from "~/pages/project/[id]";
import { trpc } from "~/utils/api";
import Tab from "./Tab";
import { editor } from "monaco-editor";
import { v4 as uuidv4 } from "uuid";
import { Monaco } from "@monaco-editor/react";
import { getFilesPaths, getFoldersWithPaths } from "~/utilis/ProjectPath";
import { FileInProject, FolderInProject } from "~/types/Project";
import { EVENTS } from "~/utilis/Events";
import useArray from "~/hooks/useArray";
import Button from "./Button";
import Chat from "./Chat";
import {
  getExtensionFromFilename,
  getLanguageFromExtension,
} from "~/utilis/dockerodeHelper";
import { createCompletionProviderJavascript } from "~/utilis/monacoHelpers";
import { useSession } from "next-auth/react";
import ProjectSettings from "./ProjectSettings";
import ProjectInfo from "./ProjectInfo";

type ConnectedFile = {
  fileId: number;
  applyRemoteChange: (
    diffs: any,
    editor: editor.IStandaloneCodeEditor,
  ) => Promise<void>;
  editor: editor.IStandaloneCodeEditor;
};

const requestId = uuidv4();

const FileManager = (): JSX.Element => {
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const [selectedTab, setSelectedTab] = useState("console");
  const [unreadChatMessages, setUnreadChatMessages] = useState(0);
  const filesWithUriPath = useArray<FileInProject>([]);
  const foldersWithUriPath = useArray<FolderInProject>([]);
  const [connectedFile, setConnectedFile] = useState<ConnectedFile | null>(
    null,
  );
  const router = useRouter();
  const { id } = router.query;

  const { data: session } = useSession();

  const project = useProject();

  const idOfProject = typeof id === "string" ? id : "1";

  trpc.file.onFileUpdate.useSubscription(
    { channelId: parseInt(idOfProject), requestIdSubscription: requestId },
    {
      onData(data) {
        const fileId: number = data.fileId;
        const change = data.change;

        if (project.selectedFile?.id === data.fileId && connectedFile) {
          connectedFile.applyRemoteChange(change, connectedFile.editor);
        } else {
          applyRemoteChange(change, fileId);
        }
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  const applyRemoteChange = async (diffs: any, fileId: number) => {
    const dmp = new diffMatchPatch();
    const text = project.getFileContent(fileId) || "";

    const patch = dmp.patch_make(text, diffs);
    const [newText] = dmp.patch_apply(patch, text);

    project.setFileContent(fileId, newText);

    const file = filesWithUriPath.array.find((file) => file.id === fileId);

    if (file) {
      const model = monaco!.editor.getModels().find((model) => {
        return model.uri.path === file.path;
      });

      if (!model) return;

      model.setValue(newText);
    }
  };

  const closeTab = (fileId: number) => {
    project.closeFile(fileId);
  };

  const openFile = (fileId: number) => {
    project.setSelectedFile(fileId);
  };

  const connectToChanges = (
    applyRemoteChange: (
      diffs: any,
      editor: editor.IStandaloneCodeEditor,
    ) => Promise<void>,
    idOfFile: number,
    editor: editor.IStandaloneCodeEditor,
  ) => {
    setConnectedFile({ applyRemoteChange, fileId: idOfFile, editor });
  };

  const disconnectFromChanges = () => {
    setConnectedFile(null);
  };

  useEffect(() => {
    if (!monaco || !editor) return;

    const file = filesWithUriPath.array.find(
      (file) => file.id === project.selectedFile?.id!,
    );
    if (!file) return;

    const model = monaco!.editor.getModel(monaco!.Uri.file(file.path));

    editor.setModel(model);
  }, [project.selectedFile?.id!, monaco, editor, filesWithUriPath]);

  const setMonacoAtStart = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    setEditor(editor);
    setMonaco(monaco);

    const files = project.files;
    const folders = project.folders;
    const foldersWithPath = getFoldersWithPaths(folders);

    const filesWithPath = getFilesPaths(files, foldersWithPath);
    filesWithUriPath.set(filesWithPath);
    foldersWithUriPath.set(foldersWithPath);

    monaco!.editor.getModels().map((file) => {
      if (file.uri.scheme === "inmemory") {
        file.dispose();
      }
    });

    filesWithPath.forEach((file) => {
      try {
        const extension = getExtensionFromFilename(file.name);
        const language = getLanguageFromExtension(extension);
        const model = monaco!.editor.createModel(
          file.content,
          language,
          monaco!.Uri.file(file.path),
        );
        if (file.id === project.selectedFile?.id) {
          editor.setModel(model);
        }
      } catch (e) {
        console.log(e);
      }
    });

    monaco!.languages.registerCompletionItemProvider("typescript", {
      triggerCharacters: ["'", '"', ".", "/"],
      provideCompletionItems: createCompletionProviderJavascript(
        monaco!,
        editor!,
      ).provideCompletionItems,
    });
    monaco!.languages.registerCompletionItemProvider("javascript", {
      triggerCharacters: ["'", '"', ".", "/"],
      provideCompletionItems: createCompletionProviderJavascript(
        monaco!,
        editor,
      ).provideCompletionItems,
    });
  };

  useEffect(() => {
    if (!monaco || !editor) return;

    const onRenameFile = project.subscribeToEvent(
      EVENTS.FILE_RENAME,
      (data) => {
        const index = filesWithUriPath.array.findIndex(
          (file) => file.id === data.id,
        );
        const file = filesWithUriPath.array[index];

        if (!file) return;

        const oldPath = file.path;
        const directoryPath = oldPath.substring(
          0,
          oldPath.lastIndexOf("/") + 1,
        );
        const newPath = `${directoryPath}${data.name}`;

        filesWithUriPath.updateObjectByIndex(index, [
          { field: "path", fieldValue: newPath },
          { field: "name", fieldValue: data.name },
        ]);
        const newModel = renameModel(oldPath, newPath);

        if (data.id === project.selectedFile?.id && newModel) {
          editor.setModel(newModel);
        }
      },
    );

    const onDeleteFile = project.subscribeToEvent(
      EVENTS.FILE_DELETED,
      (data) => {
        const index = filesWithUriPath.array.findIndex(
          (file) => file.id === data.id,
        );
        const file = filesWithUriPath.array[index];

        if (!file) return;

        const oldModel = monaco!.editor.getModel(monaco!.Uri.file(file.path));
        oldModel?.dispose();

        filesWithUriPath.removeValueByIndex(index);
      },
    );

    const onMoveFile = project.subscribeToEvent(EVENTS.FILE_MOVE, (data) => {
      const index = filesWithUriPath.array.findIndex(
        (file) => file.id === data.id,
      );
      const file = filesWithUriPath.array[index];
      const folder = foldersWithUriPath.array.find(
        (folder) => folder.id === data.folderId,
      );

      if (!file || !folder) return;

      const oldPath = file.path;
      const fileName = oldPath.substring(
        oldPath.lastIndexOf("/"),
        oldPath.length,
      );
      const newPath = `${folder.path}${fileName}`;

      filesWithUriPath.updateObjectByIndex(index, [
        { field: "path", fieldValue: newPath },
        { field: "name", fieldValue: data.name },
      ]);
      const newModel = renameModel(oldPath, newPath);

      if (data.id === project.selectedFile?.id && newModel) {
        editor.setModel(newModel);
      }
    });

    const onDeleteFolder = project.subscribeToEvent(
      EVENTS.FOLDER_DELETED,
      (data) => {
        const folder = foldersWithUriPath.array.find(
          (folder) => folder.id === data.folderId,
        );

        if (!folder) return;

        const files = filesWithUriPath.array.filter((file) => {
          if (file.path.startsWith(folder.path)) {
            const oldModel = monaco!.editor.getModel(
              monaco!.Uri.file(file.path),
            );
            oldModel?.dispose();
            return false;
          }
          return true;
        });
        filesWithUriPath.set(files);

        foldersWithUriPath.removeByKey("id", data.folderId);
      },
    );

    const onFolderRename = project.subscribeToEvent(
      EVENTS.FOLDER_RENAME,
      (data) => {
        const folder = foldersWithUriPath.array.find(
          (folder) => folder.id === data.folderId,
        );

        if (!folder) return;
        const newFolderPath = `${folder.path.substring(0, folder.path.lastIndexOf("/") + 1)}${data.name}/`;

        const filesUpdated = filesWithUriPath.array.map((file) => {
          if (file.path.startsWith(folder.path)) {
            const oldPath = file.path;
            const restOfPath = oldPath.substring(folder.path.length + 1);
            const newPath = `${newFolderPath}${restOfPath}`;
            renameModel(file.path, newPath);

            file.path = newPath;
          }
          return file;
        });

        const folderUpdated = foldersWithUriPath.array.map((folderInLoop) => {
          if (
            folderInLoop.path.startsWith(folder.path) &&
            folder.id !== data.folderId
          ) {
            const oldPath = folderInLoop.path;
            const restOfPath = oldPath.substring(folderInLoop.path.length);
            const newPath = `${newFolderPath}${restOfPath}`;
            folderInLoop.path = newPath;
          }
          return folderInLoop;
        });
        filesWithUriPath.set(filesUpdated);

        foldersWithUriPath.set(folderUpdated);
      },
    );

    const onFolderMove = project.subscribeToEvent(
      EVENTS.FOLDER_MOVE,
      (data) => {
        const folder = foldersWithUriPath.array.find(
          (folder) => folder.id === data.folderId,
        );

        const newFolder = foldersWithUriPath.array.find(
          (folder) => folder.id === data.newFolderId,
        );
        //update after here
        if (!folder) return;
        const newFolderPath = newFolder
          ? `${newFolder.path}/${folder.name}`
          : `./${folder.name}`;

        const filesUpdated = filesWithUriPath.array.map((file) => {
          if (file.path.startsWith(folder.path)) {
            const restOfPath = file.path.substring(folder.path.length);
            const newPath = `${newFolderPath}${restOfPath}`;
            renameModel(file.path, newPath);

            file.path = newPath;
          }
          return file;
        });

        const folderUpdated = foldersWithUriPath.array.map((folderInLoop) => {
          if (
            folderInLoop.path.startsWith(folder.path) &&
            folder.path !== "./"
          ) {
            const restOfPath = folder.path.substring(folderInLoop.path.length);
            const newPath = `${newFolderPath}${restOfPath}`;
            folderInLoop.path = newPath;
          }
          return folderInLoop;
        });
        filesWithUriPath.set(filesUpdated);

        foldersWithUriPath.set(folderUpdated);
      },
    );

    const onFileCreated = project.subscribeToEvent(
      EVENTS.FILE_CREATED,
      (data) => {
        const file = getFilesPaths([data.file], foldersWithUriPath.array)[0]!;

        const extension = getExtensionFromFilename(data.file.name);
        const language = getLanguageFromExtension(extension);

        monaco!.editor.createModel(
          file.content,
          language,
          monaco!.Uri.file(file.path),
        );
        filesWithUriPath.push(file);
      },
    );

    const onFolderCreated = project.subscribeToEvent(
      EVENTS.FOLDER_CREATED,
      (data) => {
        const folder = data.folder.parentId
          ? foldersWithUriPath.array.find(
              (folder) => folder.id === data.folder.parentId,
            )
          : null;
        const path = folder ? folder.path : "./";
        const folderWithUri: FolderInProject = {
          name: data.folder.name,
          path: path + "/" + data.folder.name,
          id: data.folder.id,
        };
        foldersWithUriPath.push(folderWithUri);
      },
    );

    return () => {
      onRenameFile.unsubscribe();
      onDeleteFile.unsubscribe();
      onMoveFile.unsubscribe();
      onFileCreated.unsubscribe();
      onDeleteFolder.unsubscribe();
      onFolderRename.unsubscribe();
      onFolderMove.unsubscribe();
      onFolderCreated.unsubscribe();
    };
  }, [monaco, editor, filesWithUriPath.array, foldersWithUriPath.array]);

  const renameModel = (oldPath: string, newPath: string) => {
    const oldModel = monaco!.editor.getModel(monaco!.Uri.file(oldPath));
    if (!oldModel) {
      console.error(`Model with URI ${oldPath.toString()} not found`);
      return;
    }

    const content = oldModel.getValue();
    const extension = getExtensionFromFilename(newPath);
    const language = getLanguageFromExtension(extension);
    const newModel = monaco!.editor.createModel(
      content,
      language,
      monaco!.Uri.file(newPath),
    );

    oldModel.dispose();

    return newModel;
  };
  return (
    <>
      <SidebarProjectSolution />
      <div className="flex h-[100%] w-full flex-1 flex-col items-center justify-center">
        <div className="flex h-[100%] w-full flex-col bg-slate-900 text-white">
          {project.openedFiles.length > 0 ? (
            <div className="scrollbar flex h-[32px] w-full overflow-auto">
              {project.openedFiles.map((fileId, index) => {
                const file = project.getFileById(fileId);
                if (!file) {
                  closeTab(fileId);
                  return;
                }

                return (
                  <Tab
                    key={`tabFile ${index}`}
                    active={project.selectedFile?.id === file.id}
                    title={file.name}
                    onClick={openFile}
                    onClose={closeTab}
                    fileId={file.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-3">No Files opened</div>
          )}

          {project.selectedFile?.id ? (
            <CodeEditor
              monaco={monaco}
              editor={editor}
              requestId={requestId}
              initialValue={project.selectedFile.content}
              idOfFile={project.selectedFile?.id!}
              setMonacoAtStart={setMonacoAtStart}
              connectToChanges={connectToChanges}
              disconnectFromChanges={disconnectFromChanges}
            />
          ) : (
            <div className={`m-w-[600px] w-full flex-1 bg-[#262624] p-4`}>
              Open a file to start coding
            </div>
          )}
        </div>
      </div>
      <div className="mb-5 flex h-full w-[400px] flex-col gap-4 bg-slate-900 px-5 pb-5 pt-6">
        <div className="flex w-full flex-row">
          <div className="glass flex w-full flex-row space-x-4 rounded-none">
            <button
              className={`border-b-2 px-4 py-2 ${
                selectedTab === "console"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedTab("console")}
            >
              Console
            </button>
            <div className="relative">
              <button
                className={`border-b-2 px-4 py-2 ${
                  selectedTab === "chat"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedTab("chat")}
              >
                Chat
              </button>
              {unreadChatMessages > 0 && (
                <span className="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100">
                  {unreadChatMessages}
                </span>
              )}
            </div>
            {project.projectInfo.authorId === session?.user.id ? (
              <button
                className={`border-b-2 px-4 py-2 ${
                  selectedTab === "project"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedTab("project")}
              >
                Project settings
              </button>
            ) : (
              <button
                className={`border-b-2 px-4 py-2 ${
                  selectedTab === "projectInfo"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedTab("projectInfo")}
              >
                Project settings
              </button>
            )}
          </div>
        </div>
        <Console visibility={selectedTab === "console"} />

        <Chat
          setUnreadChatMessages={setUnreadChatMessages}
          visibility={selectedTab === "chat"}
        />

        <ProjectSettings visibility={selectedTab === "project"} />

        <ProjectInfo visibility={selectedTab === "projectInfo"} />
      </div>
    </>
  );
};

export default FileManager;
