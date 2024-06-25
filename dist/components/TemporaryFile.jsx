"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useContextMenu_1 = require("../contexts/useContextMenu");
const _id_1 = require("../pages/project/[id]");
const ExtensionIcon_1 = __importDefault(require("../utilis/ExtensionIcon"));
const TemporaryFile = ({ stackLevel }) => {
    const [name, setName] = (0, react_1.useState)("");
    const { createFileFunction } = (0, _id_1.useProject)();
    const { closeAddingNewThing, fileContextMenu, folderContextMenu } = (0, useContextMenu_1.useContextMenu)();
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const idOfParentFolder = (fileContextMenu === null || fileContextMenu === void 0 ? void 0 : fileContextMenu.folderId) || (folderContextMenu === null || folderContextMenu === void 0 ? void 0 : folderContextMenu.id) || undefined;
            createFileFunction(name, idOfParentFolder);
            closeAddingNewThing();
        }
    };
    return (<div className={`flex items-center `} style={{ paddingLeft: `${stackLevel * 6}px` }}>
      <ExtensionIcon_1.default fileName={name}/>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." autoFocus onKeyDown={(e) => handleKeyDown(e)} className="w-[100%] flex-1 bg-[#404142] p-1 text-white outline-none" onBlur={() => closeAddingNewThing()}/>
    </div>);
};
exports.default = TemporaryFile;
