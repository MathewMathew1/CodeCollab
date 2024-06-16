import { useRouter } from "next/router";
import { createContext, useContext, useMemo, useState } from "react";
import FileManager from "~/components/FileManager";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { ContextMenuProvider } from "~/contexts/useContextMenu";
import useArray from "~/hooks/useArray";
import { Folder, File } from "~/types/Project";
import { EventEmitter, EventHandler, EventKeys, EVENTS } from "~/utilis/Events";
import { trpc } from "~/utils/api";

const eventEmitter = new EventEmitter();

type projectPermission = ({
  user: {
      id: string;
      name: string;
      username: string | null;
      email: string | null;
      emailVerified: Date | null;
      image: string | null;
      createdAt: Date;
  };
} & {
  id: number;
  projectId: number;
  userId: string;
})

type ProjectInfo = {
  name: string,
  isPrivate: boolean,
  description: string|null,
  authorId: string
}

type ProjectContextProps = {
  getSubFoldersAndFiles: (parentId: number) => {
    subFiles: File[];
    subFolders: Folder[];
  };
  projectPermissions: projectPermission[]
  projectInfo: ProjectInfo
  files: File[];
  folders: Folder[];
  openedFiles: number[];
  openedFolders: Folder[];
  deleteFileModalInfo: File | null;
  deleteFolderModalInfo: Folder | null;
  firstRowFolders: Folder[];
  firstRowFiles: File[];
  selectedFile: undefined | File;
  currentOpenedFolder: Folder | undefined;
  idOfProject: string;
  getFileById: (fileId: number) => File | undefined;
  getFileContent: (fileId: number) => string | undefined;
  setFileContent: (fileId: number, newContent: string) => void;
  setSelectedFile: (fileId: number) => void;
  setSelectedFolder: (folderId: number) => void;
  renameFileFunction: (fileId: number, filename: string) => Promise<void>;
  createFileFunction: (
    filename: string,
    folderId: number | undefined,
  ) => Promise<void>;
  createFolderFunction: (
    foldername: string,
    folderId: number | undefined,
  ) => Promise<void>;
  renameFolderFunction: (folderId: number, foldername: string) => Promise<void>;
  deleteFileFunction: (fileId: number) => Promise<void>;
  setDeleteModalInfo: React.Dispatch<React.SetStateAction<File | null>>;
  deleteFolderFunction: (folderId: number) => Promise<void>;
  setDeleteFolderModalInfo: React.Dispatch<React.SetStateAction<Folder | null>>;
  moveFolderFunction: (
    folderId: number,
    newFolderId: number | undefined,
  ) => Promise<void>;
  moveFileFunction: (
    fileId: number,
    newFolderId: number | undefined,
  ) => Promise<void>;
  closeFile: (fileId: number) => void;
  subscribeToEvent: (
    event: EventKeys,
    handler: EventHandler,
  ) => {
    unsubscribe: () => void;
  };
  unsubscribeFromEvent: (subscription: { unsubscribe: () => void }) => void;
};

const ProjectContext = createContext({} as ProjectContextProps);

export function useProject() {
  return useContext(ProjectContext);
}

const Code = () => {
  const router = useRouter();
  const { id } = router.query;

  const idOfProject = typeof id === "string" ? id : "1";
  const { data: project, isLoading } = trpc.project.getById.useQuery({
    projectId: parseInt(idOfProject),
  });



  const [currentOpenedFile, setCurrentOpenedFile] = useState<
    undefined | File
  >();
  const openedFiles = useArray<number>([]);
  const openedFolders = useArray<Folder>([]);
  const [currentOpenedFolder, setCurrentOpenedFolder] = useState<
    undefined | Folder
  >();
  const [deleteFileModalInfo, setDeleteModalInfo] = useState<null | File>(null);
  const [deleteFolderModalInfo, setDeleteFolderModalInfo] =
    useState<null | Folder>(null);

  const renameFile = trpc.file.rename.useMutation();
  const renameFolder = trpc.folder.rename.useMutation();
  const createFile = trpc.file.create.useMutation();
  const createFolder = trpc.folder.create.useMutation();
  const deleteFile = trpc.file.delete.useMutation();
  const deleteFolder = trpc.folder.delete.useMutation();
  const moveFolder = trpc.folder.move.useMutation();
  const moveFile = trpc.file.move.useMutation();

  const trpcUtils = trpc.useContext();

  const filesAndFoldersGrouped = useMemo(() => {
    const groupFile: { [key: string]: File[] } = {};
    const groupFolder: { [key: string]: Folder[] } = {};

    const foldersFirstRow: Folder[] = [];
    const filesFirstRow: File[] = [];
    if (project == null)
      return { groupFile, groupFolder, foldersFirstRow, filesFirstRow };

    project.files.forEach((file) => {
      if (file.folderId == null) {
        filesFirstRow.push(file);
        return;
      }
      //ignoring warning since group is always created before adding
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      groupFile[file.folderId] ||= [];
      groupFile[file.folderId]!.push(file);
    });

    project.folders.forEach((folder) => {
      if (folder.parentId == null) {
        foldersFirstRow.push(folder);
        return;
      }
      //ignoring warning since group is always created before adding
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      groupFolder[folder.parentId] ||= [];
      groupFolder[folder.parentId]!.push(folder);
    });

    return { groupFile, groupFolder, foldersFirstRow, filesFirstRow };
  }, [project]);

  const sortedFilesAndFoldersGrouped = useMemo(() => {
    const sortedTopLevelFiles = filesAndFoldersGrouped.filesFirstRow;
    const sortedTopLevelFolders = filesAndFoldersGrouped.foldersFirstRow;
    const sortedSubFolders = filesAndFoldersGrouped.groupFolder;
    const sortedSubFiles = filesAndFoldersGrouped.groupFile;

    for (const key in sortedSubFolders) {
      if (Object.hasOwnProperty.call(sortedSubFolders, key)) {
        const value = sortedSubFolders[key];
        value?.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    for (const key in sortedSubFiles) {
      if (Object.hasOwnProperty.call(sortedSubFiles, key)) {
        const value = sortedSubFiles[key];
        value?.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    sortedTopLevelFiles.sort((a, b) => a.name.localeCompare(b.name));
    sortedTopLevelFolders.sort((a, b) => a.name.localeCompare(b.name));

    return {
      sortedTopLevelFiles,
      sortedTopLevelFolders,
      sortedSubFolders,
      sortedSubFiles,
    };
  }, [filesAndFoldersGrouped]);

  const renameFileFunction = async (fileId: number, filename: string) => {
    const fileModified = project?.files.find((file) => file.id === fileId);
    const isThereFolderWithSameName = project?.files.find(
      (file) =>
        file.folderId == fileModified?.folderId && file.name === filename,
    );
    if (isThereFolderWithSameName) return;
    await renameFile.mutateAsync({ fileId, filename });
  };

  const renameFolderFunction = async (folderId: number, foldername: string) => {
    const folderModified = project?.folders.find(
      (folder) => folder.id === folderId,
    );
    const isThereFolderWithSameName = project?.folders.find(
      (folder) =>
        folder.parentId == folderModified?.parentId &&
        foldername === folder.name,
    );
    if (isThereFolderWithSameName) return;
    await renameFolder.mutateAsync({ folderId, foldername });
  };

  const createFileFunction = async (
    filename: string,
    folderId: number | undefined,
  ) => {
    const isThereFileWithSameName = project?.files.find(
      (file) => file.folderId == folderId && filename === file.name,
    );
    if (isThereFileWithSameName) return;
    await createFile.mutateAsync({
      projectId: parseInt(idOfProject),
      name: filename,
      folderId,
    });
  };

  const createFolderFunction = async (
    foldername: string,
    folderId: number | undefined,
  ) => {
    const isThereFolderWithSameName = project?.folders.find(
      (folder) => folder.parentId == folderId && foldername === folder.name,
    );
    if (isThereFolderWithSameName) return;

    await createFolder.mutateAsync({
      projectId: parseInt(idOfProject),
      name: foldername,
      folderId,
    });
  };

  const deleteFileFunction = async (fileId: number) => {
    await deleteFile.mutateAsync({ fileId });
  };

  const deleteFolderFunction = async (folderId: number) => {
    await deleteFolder.mutateAsync({ folderId });
  };

  const isSubFolderRecursive = (
    folderId: number,
    newFolderId: number | undefined,
  ): boolean => {
    const { subFolders } = getSubFoldersAndFiles(folderId);

    for (const subFolder of subFolders) {
      if (subFolder.id === newFolderId) {
        return true; // Found `newFolderId` in subfolders
      }

      // Recursively check in subfolders
      if (isSubFolderRecursive(subFolder.id, newFolderId)) {
        return true; // Found `newFolderId` in subfolders of subfolder
      }
    }

    return false; // `newFolderId` not found in subfolders
  };

  const getFileContent = (fileId: number) => {
    const file = project?.files.find((file) => file.id === fileId);
    return file?.content;
  };

  const setFileContent = (fileId: number, newContent: string) => {
    const updateData: Parameters<
      typeof trpcUtils.project.getById.setData
    >[1] = (oldData) => {
      if (oldData == null) return;

      return {
        ...oldData,
        files: oldData.files.map((item) => {
          if (item.id === fileId) {
            return { ...item, content: newContent };
          }
          return item;
        }),
      };
    };
    trpcUtils.project.getById.setData(
      { projectId: parseInt(idOfProject) },
      updateData,
    );
  };

  const moveFolderFunction = async (
    folderId: number,
    newFolderId: number | undefined,
  ) => {
    if (
      !newFolderId ||
      (!isSubFolderRecursive(folderId, newFolderId) && folderId !== newFolderId)
    ) {
      await moveFolder.mutateAsync({
        folderId,
        projectId: parseInt(idOfProject),
        newFolderId,
      });
    }
  };

  const moveFileFunction = async (
    fileId: number,
    newFolderId: number | undefined,
  ) => {
    await moveFile.mutateAsync({
      fileId,
      projectId: parseInt(idOfProject),
      newFolderId,
    });
  };

  const subscribeToEvent = (event: EventKeys, handler: EventHandler) => {
    return eventEmitter.subscribe(EVENTS[event], handler);
  };

  const unsubscribeFromEvent = (subscription: { unsubscribe: () => void }) => {
    subscription.unsubscribe();
  };

  trpc.file.onRename.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(file) {
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          eventEmitter.emit(EVENTS.FILE_RENAME, {
            id: file.fileId,
            name: file.filename,
          });

          return {
            ...oldData,
            files: oldData.files.map((item) => {
              if (item.id === file.fileId) {
                return { ...item, name: file.filename };
              }
              return item;
            }),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.file.onFileDeleted.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(fileId) {
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;
          eventEmitter.emit(EVENTS.FILE_DELETED, { id: fileId });

          return {
            ...oldData,
            files: oldData.files.filter((item) => item.id !== fileId),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.folder.onFolderMove.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(folder) {
        eventEmitter.emit(EVENTS.FOLDER_MOVE, {
          folderId: folder.folderId,
          newFolderId: folder.newFolderId,
        });
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            folders: oldData.folders.map((item) => {
              if (item.id === folder.folderId) {
                return { ...item, parentId: folder.newFolderId };
              }
              return item;
            }),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.file.onFileMove.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(file) {
        eventEmitter.emit(EVENTS.FILE_MOVE, {
          id: file.fileId,
          folderId: file.newFolderId,
        });
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            files: oldData.files.map((item) => {
              if (item.id === file.fileId) {
                return { ...item, folderId: file.newFolderId };
              }
              return item;
            }),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.folder.onFolderDeleted.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(folderId) {
        eventEmitter.emit(EVENTS.FOLDER_DELETED, { folderId });

        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          // Helper function to recursively collect subfolder IDs
          const getSubfolderIds = (folderId: any, allFolders: any[]) => {
            let subfolderIds: string[] = [];
            const directSubfolders = allFolders.filter(
              (folder) => folder.parentId === folderId,
            );
            for (const subfolder of directSubfolders) {
              subfolderIds.push(subfolder.id);
              subfolderIds = subfolderIds.concat(
                getSubfolderIds(subfolder.id, allFolders),
              );
            }
            return subfolderIds;
          };

          const folderIdsToDelete = [
            folderId,
            ...getSubfolderIds(folderId, oldData.folders),
          ];

          const filesRemoved = oldData.files.filter((file) =>
            folderIdsToDelete.includes(file.folderId),
          );
          filesRemoved.forEach((file) => closeFile(file.id));
          return {
            ...oldData,
            folders: oldData.folders.filter(
              (folder) => !folderIdsToDelete.includes(folder.id),
            ),
            files: oldData.files.filter(
              (file) => !folderIdsToDelete.includes(file.folderId),
            ),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.project.onUpdateProjectProperties.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(data) {

        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            description: data.newDescription,
            name: data.newTitle,
            isPrivate: data.isPrivate
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.project.onRemovePermission.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(data) {

        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            projectPermissions: oldData.projectPermissions.filter(permission => permission.userId !== data.userId)
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.project.onCreatePermission.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(data) {
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            projectPermissions: [...oldData.projectPermissions, data.permission]
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.folder.onRename.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(folder) {
        eventEmitter.emit(EVENTS.FOLDER_RENAME, {
          folderId: folder.folderId,
          name: folder.foldername,
        });
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            folders: oldData.folders.map((item) => {
              if (item.id === folder.folderId) {
                return { ...item, name: folder.foldername };
              }
              return item;
            }),
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.file.onFileCreated.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(file) {
        eventEmitter.emit(EVENTS.FILE_CREATED, { file });
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            files: [...oldData.files, file],
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  trpc.folder.onFolderCreated.useSubscription(
    { channelId: parseInt(idOfProject) },
    {
      onData(folder) {
        eventEmitter.emit(EVENTS.FOLDER_CREATED, { folder });
        const updateData: Parameters<
          typeof trpcUtils.project.getById.setData
        >[1] = (oldData) => {
          if (oldData == null) return;

          return {
            ...oldData,
            folders: [...oldData.folders, folder],
          };
        };

        trpcUtils.project.getById.setData(
          { projectId: parseInt(idOfProject) },
          updateData,
        );
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  if (isLoading)
    return (
      <div className="flex w-[100%] items-center justify-center">
        <LoadingSpinner big={true} />
      </div>
    );

  const getSubFoldersAndFiles = (parentId: number) => {
    let subFolders = sortedFilesAndFoldersGrouped.sortedSubFolders[parentId];
    subFolders = subFolders ? subFolders : [];

    let subFiles = sortedFilesAndFoldersGrouped.sortedSubFiles[parentId];
    subFiles = subFiles ? subFiles : [];
    return { subFolders, subFiles };
  };

  const setSelectedFile = (fileId: number) => {
    const file = project?.files.find((file) => file.id == fileId);
    setCurrentOpenedFile(file);
    setCurrentOpenedFolder(undefined);

    const index = openedFiles.array.findIndex((id) => fileId === id);
    if (index === -1 && file) {
      openedFiles.push(file.id);
    }
  };

  const closeFile = (fileId: number) => {
    const file = project?.files.find((file) => file.id == fileId);

    const index = openedFiles.array.findIndex((id) => fileId === id);

    if (index !== -1 && file) {
      const isLastFile = openedFiles.array.length === 1;
      const isCurrentFileOpen = currentOpenedFile?.id === fileId;

      if (isCurrentFileOpen) {
        let newIndex = index;

        if (isLastFile) {
          setCurrentOpenedFile(undefined);
        } else {
          newIndex =
            index === openedFiles.array.length - 1 ? index - 1 : index + 1;
          const nextFileId = openedFiles.array[newIndex];
          const nextFileToOpen = project?.files.find(
            (file) => file.id === nextFileId,
          );
          setCurrentOpenedFile(nextFileToOpen);
        }
      }

      openedFiles.removeValueByIndex(index);
    }
  };

  const getFileById = (fileId: number) => {
    const file = project?.files.find((file) => file.id === fileId);
    return file;
  };

  const setSelectedFolder = (folderId: number) => {
    const folder = project?.folders.find((folder) => folder.id == folderId);

    setCurrentOpenedFolder(folder);

    const index = openedFolders.findIndexByKey("id", folderId);
    if (index === -1 && folder) {
      openedFolders.push(folder);
    }
  };

  if(!project){
    return <div>Project not found</div>
  }
  const a = project.projectPermissions

  return (
    <div className="flex h-full w-[100%] items-start overflow-y-hidden align-middle">
      <ProjectContext.Provider
        value={{
          projectInfo: {
            name: project!.name,
            authorId: project!.authorId,
            description: project!.description,
            isPrivate: project!.isPrivate
          },
          projectPermissions: project.projectPermissions,
          idOfProject,
          getFileContent,
          subscribeToEvent,
          unsubscribeFromEvent,
          setFileContent,
          moveFileFunction,
          moveFolderFunction,
          setDeleteFolderModalInfo,
          deleteFolderModalInfo,
          closeFile,
          deleteFolderFunction,
          deleteFileFunction,
          getFileById,
          renameFolderFunction,
          createFileFunction,
          createFolderFunction,
          renameFileFunction,
          getSubFoldersAndFiles,
          openedFiles: openedFiles.array,
          openedFolders: openedFolders.array,
          firstRowFiles: sortedFilesAndFoldersGrouped.sortedTopLevelFiles,
          firstRowFolders: sortedFilesAndFoldersGrouped.sortedTopLevelFolders,
          selectedFile: currentOpenedFile,
          setSelectedFile,
          deleteFileModalInfo,
          setDeleteModalInfo,
          setSelectedFolder,
          currentOpenedFolder,
          files: project ? project?.files : [],
          folders: project ? project.folders : [],
        }}
      >
        <ContextMenuProvider>
          <FileManager></FileManager>
        </ContextMenuProvider>
      </ProjectContext.Provider>
    </div>
  );
};

export default Code;
