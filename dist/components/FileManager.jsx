"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diff_match_patch_1 = __importDefault(require("diff-match-patch"));
const router_1 = require("next/router");
const react_1 = __importStar(require("react"));
const Console_1 = __importDefault(require("../components/Console"));
const MonacoEditor_1 = __importDefault(require("../components/MonacoEditor"));
const SidebarProjectSolution_1 = __importDefault(require("../components/SidebarProjectSolution"));
const _id_1 = require("../pages/project/[id]");
const api_1 = require("../utils/api");
const Tab_1 = __importDefault(require("./Tab"));
const uuid_1 = require("uuid");
const ProjectPath_1 = require("../utilis/ProjectPath");
const Events_1 = require("../utilis/Events");
const useArray_1 = __importDefault(require("../hooks/useArray"));
const Chat_1 = __importDefault(require("./Chat"));
const dockerodeHelper_1 = require("../utilis/dockerodeHelper");
const monacoHelpers_1 = require("../utilis/monacoHelpers");
const react_2 = require("next-auth/react");
const ProjectSettings_1 = __importDefault(require("./ProjectSettings"));
const ProjectInfo_1 = __importDefault(require("./ProjectInfo"));
const requestId = (0, uuid_1.v4)();
const FileManager = () => {
    var _a, _b, _c;
    const [editor, setEditor] = (0, react_1.useState)(null);
    const [monaco, setMonaco] = (0, react_1.useState)(null);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)("console");
    const [unreadChatMessages, setUnreadChatMessages] = (0, react_1.useState)(0);
    const filesWithUriPath = (0, useArray_1.default)([]);
    const foldersWithUriPath = (0, useArray_1.default)([]);
    const [connectedFile, setConnectedFile] = (0, react_1.useState)(null);
    const router = (0, router_1.useRouter)();
    const { id } = router.query;
    const { data: session } = (0, react_2.useSession)();
    const project = (0, _id_1.useProject)();
    const idOfProject = typeof id === "string" ? id : "1";
    api_1.trpc.file.onFileUpdate.useSubscription({ channelId: parseInt(idOfProject), requestIdSubscription: requestId }, {
        onData(data) {
            var _a;
            const fileId = data.fileId;
            const change = data.change;
            if (((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id) === data.fileId && connectedFile) {
                connectedFile.applyRemoteChange(change, connectedFile.editor);
            }
            else {
                applyRemoteChange(change, fileId);
            }
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    const applyRemoteChange = async (diffs, fileId) => {
        const dmp = new diff_match_patch_1.default();
        const text = project.getFileContent(fileId) || "";
        const patch = dmp.patch_make(text, diffs);
        const [newText] = dmp.patch_apply(patch, text);
        project.setFileContent(fileId, newText);
        const file = filesWithUriPath.array.find((file) => file.id === fileId);
        if (file) {
            const model = monaco.editor.getModels().find((model) => {
                return model.uri.path === file.path;
            });
            if (!model)
                return;
            model.setValue(newText);
        }
    };
    const closeTab = (fileId) => {
        project.closeFile(fileId);
    };
    const openFile = (fileId) => {
        project.setSelectedFile(fileId);
    };
    const connectToChanges = (applyRemoteChange, idOfFile, editor) => {
        setConnectedFile({ applyRemoteChange, fileId: idOfFile, editor });
    };
    const disconnectFromChanges = () => {
        setConnectedFile(null);
    };
    (0, react_1.useEffect)(() => {
        if (!monaco || !editor)
            return;
        const file = filesWithUriPath.array.find((file) => { var _a; return file.id === ((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id); });
        if (!file)
            return;
        const model = monaco.editor.getModel(monaco.Uri.file(file.path));
        editor.setModel(model);
    }, [(_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id, monaco, editor, filesWithUriPath]);
    const setMonacoAtStart = (editor, monaco) => {
        setEditor(editor);
        setMonaco(monaco);
        const files = project.files;
        const folders = project.folders;
        const foldersWithPath = (0, ProjectPath_1.getFoldersWithPaths)(folders);
        const filesWithPath = (0, ProjectPath_1.getFilesPaths)(files, foldersWithPath);
        filesWithUriPath.set(filesWithPath);
        foldersWithUriPath.set(foldersWithPath);
        monaco.editor.getModels().map((file) => {
            if (file.uri.scheme === "inmemory") {
                file.dispose();
            }
        });
        filesWithPath.forEach((file) => {
            var _a;
            try {
                const extension = (0, dockerodeHelper_1.getExtensionFromFilename)(file.name);
                const language = (0, dockerodeHelper_1.getLanguageFromExtension)(extension);
                const model = monaco.editor.createModel(file.content, language, monaco.Uri.file(file.path));
                if (file.id === ((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id)) {
                    editor.setModel(model);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        monaco.languages.registerCompletionItemProvider("typescript", {
            triggerCharacters: ["'", '"', ".", "/"],
            provideCompletionItems: (0, monacoHelpers_1.createCompletionProviderJavascript)(monaco, editor).provideCompletionItems,
        });
        monaco.languages.registerCompletionItemProvider("javascript", {
            triggerCharacters: ["'", '"', ".", "/"],
            provideCompletionItems: (0, monacoHelpers_1.createCompletionProviderJavascript)(monaco, editor).provideCompletionItems,
        });
    };
    (0, react_1.useEffect)(() => {
        if (!monaco || !editor)
            return;
        const onRenameFile = project.subscribeToEvent(Events_1.EVENTS.FILE_RENAME, (data) => {
            var _a;
            const index = filesWithUriPath.array.findIndex((file) => file.id === data.id);
            const file = filesWithUriPath.array[index];
            if (!file)
                return;
            const oldPath = file.path;
            const directoryPath = oldPath.substring(0, oldPath.lastIndexOf("/") + 1);
            const newPath = `${directoryPath}${data.name}`;
            filesWithUriPath.updateObjectByIndex(index, [
                { field: "path", fieldValue: newPath },
                { field: "name", fieldValue: data.name },
            ]);
            const newModel = renameModel(oldPath, newPath);
            if (data.id === ((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id) && newModel) {
                editor.setModel(newModel);
            }
        });
        const onDeleteFile = project.subscribeToEvent(Events_1.EVENTS.FILE_DELETED, (data) => {
            const index = filesWithUriPath.array.findIndex((file) => file.id === data.id);
            const file = filesWithUriPath.array[index];
            if (!file)
                return;
            const oldModel = monaco.editor.getModel(monaco.Uri.file(file.path));
            oldModel === null || oldModel === void 0 ? void 0 : oldModel.dispose();
            filesWithUriPath.removeValueByIndex(index);
        });
        const onMoveFile = project.subscribeToEvent(Events_1.EVENTS.FILE_MOVE, (data) => {
            var _a;
            const index = filesWithUriPath.array.findIndex((file) => file.id === data.id);
            const file = filesWithUriPath.array[index];
            const folder = foldersWithUriPath.array.find((folder) => folder.id === data.folderId);
            if (!file || !folder)
                return;
            const oldPath = file.path;
            const fileName = oldPath.substring(oldPath.lastIndexOf("/"), oldPath.length);
            const newPath = `${folder.path}${fileName}`;
            filesWithUriPath.updateObjectByIndex(index, [
                { field: "path", fieldValue: newPath },
                { field: "name", fieldValue: data.name },
            ]);
            const newModel = renameModel(oldPath, newPath);
            if (data.id === ((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id) && newModel) {
                editor.setModel(newModel);
            }
        });
        const onDeleteFolder = project.subscribeToEvent(Events_1.EVENTS.FOLDER_DELETED, (data) => {
            const folder = foldersWithUriPath.array.find((folder) => folder.id === data.folderId);
            if (!folder)
                return;
            const files = filesWithUriPath.array.filter((file) => {
                if (file.path.startsWith(folder.path)) {
                    const oldModel = monaco.editor.getModel(monaco.Uri.file(file.path));
                    oldModel === null || oldModel === void 0 ? void 0 : oldModel.dispose();
                    return false;
                }
                return true;
            });
            filesWithUriPath.set(files);
            foldersWithUriPath.removeByKey("id", data.folderId);
        });
        const onFolderRename = project.subscribeToEvent(Events_1.EVENTS.FOLDER_RENAME, (data) => {
            const folder = foldersWithUriPath.array.find((folder) => folder.id === data.folderId);
            if (!folder)
                return;
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
                if (folderInLoop.path.startsWith(folder.path) &&
                    folder.id !== data.folderId) {
                    const oldPath = folderInLoop.path;
                    const restOfPath = oldPath.substring(folderInLoop.path.length);
                    const newPath = `${newFolderPath}${restOfPath}`;
                    folderInLoop.path = newPath;
                }
                return folderInLoop;
            });
            filesWithUriPath.set(filesUpdated);
            foldersWithUriPath.set(folderUpdated);
        });
        const onFolderMove = project.subscribeToEvent(Events_1.EVENTS.FOLDER_MOVE, (data) => {
            const folder = foldersWithUriPath.array.find((folder) => folder.id === data.folderId);
            const newFolder = foldersWithUriPath.array.find((folder) => folder.id === data.newFolderId);
            //update after here
            if (!folder)
                return;
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
                if (folderInLoop.path.startsWith(folder.path) &&
                    folder.path !== "./") {
                    const restOfPath = folder.path.substring(folderInLoop.path.length);
                    const newPath = `${newFolderPath}${restOfPath}`;
                    folderInLoop.path = newPath;
                }
                return folderInLoop;
            });
            filesWithUriPath.set(filesUpdated);
            foldersWithUriPath.set(folderUpdated);
        });
        const onFileCreated = project.subscribeToEvent(Events_1.EVENTS.FILE_CREATED, (data) => {
            const file = (0, ProjectPath_1.getFilesPaths)([data.file], foldersWithUriPath.array)[0];
            const extension = (0, dockerodeHelper_1.getExtensionFromFilename)(data.file.name);
            const language = (0, dockerodeHelper_1.getLanguageFromExtension)(extension);
            monaco.editor.createModel(file.content, language, monaco.Uri.file(file.path));
            filesWithUriPath.push(file);
        });
        const onFolderCreated = project.subscribeToEvent(Events_1.EVENTS.FOLDER_CREATED, (data) => {
            const folder = data.folder.parentId
                ? foldersWithUriPath.array.find((folder) => folder.id === data.folder.parentId)
                : null;
            const path = folder ? folder.path : "./";
            const folderWithUri = {
                name: data.folder.name,
                path: path + "/" + data.folder.name,
                id: data.folder.id,
            };
            foldersWithUriPath.push(folderWithUri);
        });
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
    const renameModel = (oldPath, newPath) => {
        const oldModel = monaco.editor.getModel(monaco.Uri.file(oldPath));
        if (!oldModel) {
            console.error(`Model with URI ${oldPath.toString()} not found`);
            return;
        }
        const content = oldModel.getValue();
        const extension = (0, dockerodeHelper_1.getExtensionFromFilename)(newPath);
        const language = (0, dockerodeHelper_1.getLanguageFromExtension)(extension);
        const newModel = monaco.editor.createModel(content, language, monaco.Uri.file(newPath));
        oldModel.dispose();
        return newModel;
    };
    return (<>
      <SidebarProjectSolution_1.default />
      <div className="flex h-[100%] w-full flex-1 flex-col items-center justify-center">
        <div className="flex h-[100%] w-full flex-col bg-slate-900 text-white">
          {project.openedFiles.length > 0 ? (<div className="scrollbar flex h-[32px] w-full overflow-auto">
              {project.openedFiles.map((fileId, index) => {
                var _a;
                const file = project.getFileById(fileId);
                if (!file) {
                    closeTab(fileId);
                    return;
                }
                return (<Tab_1.default key={`tabFile ${index}`} active={((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id) === file.id} title={file.name} onClick={openFile} onClose={closeTab} fileId={file.id}/>);
            })}
            </div>) : (<div className="p-3">No Files opened</div>)}

          {((_b = project.selectedFile) === null || _b === void 0 ? void 0 : _b.id) ? (<MonacoEditor_1.default monaco={monaco} editor={editor} requestId={requestId} initialValue={project.selectedFile.content} idOfFile={(_c = project.selectedFile) === null || _c === void 0 ? void 0 : _c.id} setMonacoAtStart={setMonacoAtStart} connectToChanges={connectToChanges} disconnectFromChanges={disconnectFromChanges}/>) : (<div className={`m-w-[600px] w-full flex-1 bg-[#262624] p-4`}>
              Open a file to start coding
            </div>)}
        </div>
      </div>
      <div className="mb-5 flex h-full w-[400px] flex-col gap-4 bg-slate-900 px-5 pb-5 pt-6">
        <div className="flex w-full flex-row">
          <div className="glass flex w-full flex-row space-x-4 rounded-none">
            <button className={`border-b-2 px-4 py-2 ${selectedTab === "console"
            ? "border-blue-500 text-blue-500"
            : "border-transparent"}`} onClick={() => setSelectedTab("console")}>
              Console
            </button>
            <div className="relative">
              <button className={`border-b-2 px-4 py-2 ${selectedTab === "chat"
            ? "border-blue-500 text-blue-500"
            : "border-transparent"}`} onClick={() => setSelectedTab("chat")}>
                Chat
              </button>
              {unreadChatMessages > 0 && (<span className="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100">
                  {unreadChatMessages}
                </span>)}
            </div>
            {project.projectInfo.authorId === (session === null || session === void 0 ? void 0 : session.user.id) ? (<button className={`border-b-2 px-4 py-2 ${selectedTab === "project"
                ? "border-blue-500 text-blue-500"
                : "border-transparent"}`} onClick={() => setSelectedTab("project")}>
                Project settings
              </button>) : (<button className={`border-b-2 px-4 py-2 ${selectedTab === "projectInfo"
                ? "border-blue-500 text-blue-500"
                : "border-transparent"}`} onClick={() => setSelectedTab("projectInfo")}>
                Project settings
              </button>)}
          </div>
        </div>
        <Console_1.default visibility={selectedTab === "console"}/>

        <Chat_1.default setUnreadChatMessages={setUnreadChatMessages} visibility={selectedTab === "chat"}/>

        <ProjectSettings_1.default visibility={selectedTab === "project"}/>

        <ProjectInfo_1.default visibility={selectedTab === "projectInfo"}/>
      </div>
    </>);
};
exports.default = FileManager;
