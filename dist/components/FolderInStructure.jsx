"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// FolderInStructure.js
const _id_1 = require("../pages/project/[id]");
const FileInStructure_1 = __importDefault(require("./FileInStructure"));
const useContextMenu_1 = require("../contexts/useContextMenu");
const TemporaryFile_1 = __importDefault(require("./TemporaryFile"));
const ai_1 = require("react-icons/ai");
const TemporaryFolder_1 = __importDefault(require("./TemporaryFolder"));
const react_1 = require("react");
const md_1 = require("react-icons/md");
const FolderInStructure = ({ folder, stackLevel }) => {
    const [showContent, setShowContent] = (0, react_1.useState)(true);
    const [editing, setEditing] = (0, react_1.useState)(false);
    const { currentOpenedFolder, getSubFoldersAndFiles, setSelectedFolder, moveFolderFunction, moveFileFunction, renameFolderFunction, setDeleteFolderModalInfo } = (0, _id_1.useProject)();
    const foldersAndFiles = getSubFoldersAndFiles(folder.id);
    const [folderName, setFolderName] = (0, react_1.useState)(folder.name);
    const { handleContextMenu, creatingFile, creatingFolder, fileContextMenu, folderContextMenu } = (0, useContextMenu_1.useContextMenu)();
    const folderIdOfContextMenu = (folderContextMenu === null || folderContextMenu === void 0 ? void 0 : folderContextMenu.id) === folder.id || (fileContextMenu === null || fileContextMenu === void 0 ? void 0 : fileContextMenu.folderId) === folder.id;
    const handleEnter = (e) => {
        if (e.code === 'Enter') {
            if ((currentOpenedFolder === null || currentOpenedFolder === void 0 ? void 0 : currentOpenedFolder.id) === folder.id) {
                renameFolderFunction(folder.id, folderName);
                setEditing(false);
            }
        }
    };
    (0, react_1.useEffect)(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'F2') {
                if ((currentOpenedFolder === null || currentOpenedFolder === void 0 ? void 0 : currentOpenedFolder.id) === folder.id) {
                    setEditing(true);
                }
            }
            if (e.code === 'Delete') {
                if ((currentOpenedFolder === null || currentOpenedFolder === void 0 ? void 0 : currentOpenedFolder.id) === folder.id) {
                    setDeleteFolderModalInfo(folder);
                }
            }
        };
        document.addEventListener('keydown', (e) => handleKeyPress(e));
        // Clean up the event listener when the component is unmounted
        return () => {
            document.removeEventListener('keydown', (e) => handleKeyPress(e));
        };
    }, [currentOpenedFolder === null || currentOpenedFolder === void 0 ? void 0 : currentOpenedFolder.id]);
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', folder.id.toString());
        e.dataTransfer.setData('itemType', "folder");
    };
    const handleDragOver = (e) => {
        console.log(e.dataTransfer.getData('text/plain'));
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedFolderId = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('itemType');
        if (type === "folder") {
            console.log(folder.id);
            moveFolderFunction(parseInt(draggedFolderId), folder.id);
            return;
        }
        moveFileFunction(parseInt(draggedFolderId), folder.id);
    };
    const handleClickOnFolder = () => {
        setSelectedFolder(folder.id);
        setShowContent(!showContent);
    };
    return (<div className="flex flex-col text-white" onDrop={(e) => handleDrop(e)}>
            <div draggable="true" onDragStart={(e) => handleDragStart(e)} onDragOver={(e) => handleDragOver(e)} onClick={() => handleClickOnFolder()} style={{ backgroundColor: `${(currentOpenedFolder === null || currentOpenedFolder === void 0 ? void 0 : currentOpenedFolder.id) === folder.id ? "grey" : "transparent"}`, paddingLeft: `${stackLevel * 6}px` }} className="flex items-center w-[100%]" onContextMenu={(e) => handleContextMenu(e, null, folder)}>
                <div className="w-[1rem] h-[100%] "><ai_1.AiFillFolder fill={"orange"}/></div>
                {showContent ?
            <md_1.MdKeyboardArrowDown />
            :
                <md_1.MdKeyboardArrowRight />}
                {editing ? (<input className="text-white p-1 flex-1 bg-[#404142] w-[1px] outline-none" type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} onKeyDown={(e) => handleEnter(e)} autoFocus onBlur={() => setEditing(false)}/>) : (<div className="p-1 rounded flex-1">{folder.name}</div>)}
                
            </div>
            {showContent ?
            <div className="flex flex-col">
                    {creatingFile && folderIdOfContextMenu ?
                    <TemporaryFile_1.default stackLevel={stackLevel + 1}/>
                    :
                        null}
                    {foldersAndFiles.subFolders.map((subFolder) => (<FolderInStructure key={`${subFolder.id} folder`} folder={subFolder} stackLevel={stackLevel + 1}/>))}
                    {creatingFolder && folderIdOfContextMenu ?
                    <TemporaryFolder_1.default stackLevel={stackLevel + 1}/>
                    :
                        null}
                    {foldersAndFiles.subFiles.map((subFile) => (<FileInStructure_1.default stackLevel={stackLevel + 1} key={`${subFile.id} file`} file={subFile}/>))}
                </div>
            :
                null}
        </div>);
};
exports.default = FolderInStructure;
