import path from "path";
import { Folder, FolderInProject, File } from "../types/Project";

function getFoldersWithPaths(
  folders: Folder[],
  parentId: number | null = null,
  parentPath = "",
) {
  const result: FolderInProject[] = [];

  // Filter folders with matching parentId
  const matchingFolders = folders.filter(
    (folder) => folder.parentId === parentId,
  );

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

const getFilesPaths = (files: File[], folders: FolderInProject[]) => {
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

function getRelativePath(file1: string, file2: string): string {
  const relativePath = path.relative(path.dirname(file1), file2);
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

export { getFilesPaths, getFoldersWithPaths, getRelativePath };
