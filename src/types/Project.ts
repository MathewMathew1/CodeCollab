export type Folder = {
    id: number;
    name: string;
    projectId: number;
    parentId: number|null;
}

export type File = {
    id: number;
    name: string;
    content: string;
    projectId: number;
    folderId: number | null;
}

export type FileInProject = {
    name: string;
    content: string;
    path: string
    id: number
    folderId: number | null;
  }
  
export type FolderInProject = {
    name: string;
    path: string
    id: number
}