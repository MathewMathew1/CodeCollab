"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativePath = exports.getFoldersWithPaths = exports.getFilesPaths = void 0;
const path_1 = __importDefault(require("path"));
function getFoldersWithPaths(folders, parentId = null, parentPath = "") {
    const result = [];
    // Filter folders with matching parentId
    const matchingFolders = folders.filter((folder) => folder.parentId === parentId);
    // Iterate over matching folders
    for (const folder of matchingFolders) {
        const fullPath = parentPath
            ? `${parentPath}/${folder.name}`
            : `/${folder.name}`;
        result.push({ name: folder.name, path: fullPath, id: folder.id });
        // Recursively call the function for subfolders
        const subFolders = getFoldersWithPaths(folders, folder.id, fullPath);
        result.push(...subFolders);
    }
    return result;
}
exports.getFoldersWithPaths = getFoldersWithPaths;
const getFilesPaths = (files, folders) => {
    const filesModified = files.map((file) => {
        const fileModified = {
            content: file.content,
            name: file.name,
            path: file.name,
            id: file.id,
            folderId: file.folderId,
        };
        if (file.folderId) {
            const folder = folders.find((folder) => folder.id === file.folderId);
            if (folder) {
                const path = folder.path + "/" + file.name;
                fileModified.path = path;
            }
        }
        return fileModified;
    });
    return filesModified;
};
exports.getFilesPaths = getFilesPaths;
function getRelativePath(file1, file2) {
    const relativePath = path_1.default.relative(path_1.default.dirname(file1), file2);
    return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}
exports.getRelativePath = getRelativePath;
