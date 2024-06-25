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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const useContextMenu_1 = require("../contexts/useContextMenu");
const _id_1 = require("../pages/project/[id]");
const ContextMenu = () => {
    const { mouseX, mouseY, fileContextMenu, folderContextMenu, handleNewFile, handleNewFolder, handleCloseContextMenu, } = (0, useContextMenu_1.useContextMenu)();
    const { setDeleteModalInfo, setDeleteFolderModalInfo } = (0, _id_1.useProject)();
    (0, react_1.useEffect)(() => {
        const handleClick = (e) => {
            handleCloseContextMenu();
        };
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);
    return (<>
      <div className="fixed z-10 w-[250px] border-gray-300 bg-[#000000] p-2 py-3 text-white shadow" style={{
            top: mouseY,
            left: mouseX,
        }}>
        <div onClick={() => handleNewFile()} className="select-none pl-3 hover:bg-blue-600">
          New File
        </div>
        <div onClick={() => handleNewFolder()} className="select-none pl-3 hover:bg-blue-600">
          New Folder
        </div>
        {fileContextMenu ? (<div onClick={() => setDeleteModalInfo(fileContextMenu)} className="select-none pl-3 hover:bg-blue-600">
            Delete
          </div>) : null}
        {folderContextMenu ? (<div onClick={() => setDeleteFolderModalInfo(folderContextMenu)} className="select-none pl-3 hover:bg-blue-600">
            Delete
          </div>) : null}
      </div>
    </>);
};
exports.default = ContextMenu;
