"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _id_1 = require("../pages/project/[id]");
const FileInStructure_1 = __importDefault(require("./FileInStructure"));
const FolderInStructure_1 = __importDefault(require("./FolderInStructure"));
const ContextMenu_1 = __importDefault(require("./ContextMenu"));
const useContextMenu_1 = require("../contexts/useContextMenu");
const TemporaryFile_1 = __importDefault(require("./TemporaryFile"));
const TemporaryFolder_1 = __importDefault(require("./TemporaryFolder"));
const DeleteFileModal_1 = __importDefault(require("./Modals/DeleteFileModal"));
const DeleteFolderModal_1 = __importDefault(require("./Modals/DeleteFolderModal"));
const SidebarProjectSolution = () => {
    const { firstRowFiles, firstRowFolders, deleteFileModalInfo, setDeleteModalInfo, moveFileFunction, deleteFolderModalInfo, setDeleteFolderModalInfo, moveFolderFunction, } = (0, _id_1.useProject)();
    const { contextMenuOpen, folderContextMenu, fileContextMenu, creatingFile, creatingFolder, handleContextMenu, } = (0, useContextMenu_1.useContextMenu)();
    const newFileInRoot = !(folderContextMenu === null || folderContextMenu === void 0 ? void 0 : folderContextMenu.id) && !(fileContextMenu === null || fileContextMenu === void 0 ? void 0 : fileContextMenu.folderId);
    const handleDrop = (e) => {
        e.preventDefault();
        const draggedFolderId = e.dataTransfer.getData("text/plain");
        const type = e.dataTransfer.getData("itemType");
        if (type === "folder") {
            console.log(draggedFolderId);
            moveFolderFunction(parseInt(draggedFolderId), undefined);
            return;
        }
        console.log(draggedFolderId);
        moveFileFunction(parseInt(draggedFolderId), undefined);
    };
    const handleDragOver = (e) => {
        console.log(e.dataTransfer.getData("text/plain"));
        e.preventDefault();
    };
    return (<div onContextMenu={(e) => handleContextMenu(e, null, null)} className="relative flex h-[100%] w-[200px] flex-col items-center justify-center bg-[#262624] pt-3 " onDragOver={(e) => handleDragOver(e)} onDrop={(e) => handleDrop(e)}>
      <div className="flex h-full w-full flex-col text-white">
        <div className="mb-3 text-center text-white">Project Solution</div>
        <div className="scrollbar overflow-auto text-[14px]">
          <div className="flex  flex-col">
            {creatingFile && newFileInRoot ? (<TemporaryFile_1.default stackLevel={1}/>) : null}
            {firstRowFolders.map((folder) => (<FolderInStructure_1.default stackLevel={1} key={`${folder.id} folder`} folder={folder}/>))}
            {creatingFolder && newFileInRoot ? (<TemporaryFolder_1.default stackLevel={1}/>) : null}
            {firstRowFiles.map((file) => (<FileInStructure_1.default stackLevel={1} key={`${file.id} file`} file={file}/>))}
          </div>
        </div>
      </div>
      {contextMenuOpen ? <ContextMenu_1.default /> : null}
      <DeleteFileModal_1.default isOpen={deleteFileModalInfo !== null} handleClose={() => setDeleteModalInfo(null)} file={deleteFileModalInfo}/>
      <DeleteFolderModal_1.default isOpen={deleteFolderModalInfo !== null} handleClose={() => setDeleteFolderModalInfo(null)} folder={deleteFolderModalInfo}/>
    </div>);
};
exports.default = SidebarProjectSolution;
