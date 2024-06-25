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
exports.ContextMenuProvider = exports.useContextMenu = void 0;
const react_1 = __importStar(require("react"));
const ContextMenuContext = (0, react_1.createContext)({});
function useContextMenu() {
    return (0, react_1.useContext)(ContextMenuContext);
}
exports.useContextMenu = useContextMenu;
const ContextMenuProvider = ({ children }) => {
    const [contextMenuOpen, setContextMenuOpen] = (0, react_1.useState)(false);
    const [mouseX, setMouseX] = (0, react_1.useState)(0);
    const [mouseY, setMouseY] = (0, react_1.useState)(0);
    const [fileContextMenu, setFileContextMenu] = (0, react_1.useState)(null);
    const [folderContextMenu, setFolderContextMenu] = (0, react_1.useState)(null);
    const [creatingFile, setCreatingFile] = (0, react_1.useState)(false);
    const [creatingFolder, setCreatingFolder] = (0, react_1.useState)(false);
    const closeAddingNewThing = () => {
        setCreatingFolder(false);
        setCreatingFile(false);
    };
    const handleNewFile = () => {
        setCreatingFolder(false);
        setCreatingFile(true);
    };
    const handleNewFolder = () => {
        setCreatingFile(false);
        setCreatingFolder(true);
    };
    const handleContextMenu = (e, file, folder) => {
        e.preventDefault();
        e.stopPropagation();
        const menuWidth = 150;
        const menuHeight = 150;
        const padding = 10;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let mouseX = e.clientX;
        let mouseY = e.clientY;
        if (mouseX + menuWidth + padding > viewportWidth) {
            mouseX = viewportWidth - menuWidth - padding;
        }
        if (mouseY + menuHeight + padding > viewportHeight) {
            mouseY = viewportHeight - menuHeight - padding;
        }
        setMouseX(mouseX);
        setMouseY(mouseY);
        setFileContextMenu(file);
        setFolderContextMenu(folder);
        setContextMenuOpen(true);
    };
    const handleCloseContextMenu = () => {
        setContextMenuOpen(false);
    };
    return (<ContextMenuContext.Provider value={{
            contextMenuOpen,
            closeAddingNewThing,
            mouseX,
            mouseY,
            fileContextMenu,
            folderContextMenu,
            handleContextMenu,
            handleCloseContextMenu,
            creatingFile,
            creatingFolder,
            handleNewFile,
            handleNewFolder
        }}>
      {children}
    </ContextMenuContext.Provider>);
};
exports.ContextMenuProvider = ContextMenuProvider;
