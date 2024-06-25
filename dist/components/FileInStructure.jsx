"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useContextMenu_1 = require("../contexts/useContextMenu");
const _id_1 = require("../pages/project/[id]");
const ExtensionIcon_1 = __importDefault(require("../utilis/ExtensionIcon"));
const FileInStructure = ({ file, stackLevel }) => {
    const [editing, setEditing] = (0, react_1.useState)(false);
    const [fileName, setFileName] = (0, react_1.useState)(file.name);
    const { handleContextMenu } = (0, useContextMenu_1.useContextMenu)();
    const { setSelectedFile, selectedFile, renameFileFunction, setDeleteModalInfo } = (0, _id_1.useProject)();
    const handleEnter = (e) => {
        if (e.code === 'Enter') {
            if ((selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id) {
                renameFileFunction(file.id, fileName);
                setFileName(fileName);
                setEditing(false);
            }
        }
    };
    (0, react_1.useEffect)(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'F2') {
                // Perform your action here
                if ((selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id) {
                    setEditing(true);
                }
            }
            if (e.code === 'Delete') {
                // Perform your action here
                if ((selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id) {
                    setDeleteModalInfo(file);
                }
            }
        };
        document.addEventListener('keydown', (e) => handleKeyPress(e));
        // Clean up the event listener when the component is unmounted
        return () => {
            document.removeEventListener('keydown', (e) => handleKeyPress(e));
        };
    }, [selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id]);
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', file.id.toString());
        e.dataTransfer.setData('itemType', "file");
    };
    return (<div className={`w-[100%]`}>
        <div className={`flex items-center `} draggable="true" onDragStart={(e) => handleDragStart(e)} onContextMenu={(e) => handleContextMenu(e, file, null)} style={{ backgroundColor: `${(selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id ? "grey" : "transparent"}`, paddingLeft: `${6 * stackLevel}px` }}>
            <ExtensionIcon_1.default fileName={fileName}/>
            {editing ? (<input className="text-white p-1 flex-1 bg-[#404142] w-[1px] outline-none" type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} onKeyDown={(e) => handleEnter(e)} autoFocus onBlur={() => { setFileName(file.name); setEditing(false); }}/>) : (<div className="text-white p-1 flex-1" onClick={() => setSelectedFile(file.id)}>
                  {file.name}
              </div>)}
        </div>
      </div>);
};
exports.default = FileInStructure;
