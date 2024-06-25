"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProject = void 0;
const router_1 = require("next/router");
const react_1 = require("react");
const FileManager_1 = __importDefault(require("../../components/FileManager"));
const LoadingSpinner_1 = require("../../components/LoadingSpinner");
const useContextMenu_1 = require("../../contexts/useContextMenu");
const useArray_1 = __importDefault(require("../../hooks/useArray"));
const Events_1 = require("../../utilis/Events");
const api_1 = require("../../utils/api");
const eventEmitter = new Events_1.EventEmitter();
const ProjectContext = (0, react_1.createContext)({});
function useProject() {
    return (0, react_1.useContext)(ProjectContext);
}
exports.useProject = useProject;
const Code = () => {
    const router = (0, router_1.useRouter)();
    const { id } = router.query;
    const idOfProject = typeof id === "string" ? id : "1";
    const { data: project, isLoading } = api_1.trpc.project.getById.useQuery({
        projectId: parseInt(idOfProject),
    });
    const [currentOpenedFile, setCurrentOpenedFile] = (0, react_1.useState)();
    const openedFiles = (0, useArray_1.default)([]);
    const openedFolders = (0, useArray_1.default)([]);
    const [currentOpenedFolder, setCurrentOpenedFolder] = (0, react_1.useState)();
    const [deleteFileModalInfo, setDeleteModalInfo] = (0, react_1.useState)(null);
    const [deleteFolderModalInfo, setDeleteFolderModalInfo] = (0, react_1.useState)(null);
    const renameFile = api_1.trpc.file.rename.useMutation();
    const renameFolder = api_1.trpc.folder.rename.useMutation();
    const createFile = api_1.trpc.file.create.useMutation();
    const createFolder = api_1.trpc.folder.create.useMutation();
    const deleteFile = api_1.trpc.file.delete.useMutation();
    const deleteFolder = api_1.trpc.folder.delete.useMutation();
    const moveFolder = api_1.trpc.folder.move.useMutation();
    const moveFile = api_1.trpc.file.move.useMutation();
    const trpcUtils = api_1.trpc.useContext();
    const filesAndFoldersGrouped = (0, react_1.useMemo)(() => {
        const groupFile = {};
        const groupFolder = {};
        const foldersFirstRow = [];
        const filesFirstRow = [];
        if (project == null)
            return { groupFile, groupFolder, foldersFirstRow, filesFirstRow };
        project.files.forEach((file) => {
            var _a;
            if (file.folderId == null) {
                filesFirstRow.push(file);
                return;
            }
            //ignoring warning since group is always created before adding
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            groupFile[_a = file.folderId] || (groupFile[_a] = []);
            groupFile[file.folderId].push(file);
        });
        project.folders.forEach((folder) => {
            var _a;
            if (folder.parentId == null) {
                foldersFirstRow.push(folder);
                return;
            }
            //ignoring warning since group is always created before adding
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            groupFolder[_a = folder.parentId] || (groupFolder[_a] = []);
            groupFolder[folder.parentId].push(folder);
        });
        return { groupFile, groupFolder, foldersFirstRow, filesFirstRow };
    }, [project]);
    const sortedFilesAndFoldersGrouped = (0, react_1.useMemo)(() => {
        const sortedTopLevelFiles = filesAndFoldersGrouped.filesFirstRow;
        const sortedTopLevelFolders = filesAndFoldersGrouped.foldersFirstRow;
        const sortedSubFolders = filesAndFoldersGrouped.groupFolder;
        const sortedSubFiles = filesAndFoldersGrouped.groupFile;
        for (const key in sortedSubFolders) {
            if (Object.hasOwnProperty.call(sortedSubFolders, key)) {
                const value = sortedSubFolders[key];
                value === null || value === void 0 ? void 0 : value.sort((a, b) => a.name.localeCompare(b.name));
            }
        }
        for (const key in sortedSubFiles) {
            if (Object.hasOwnProperty.call(sortedSubFiles, key)) {
                const value = sortedSubFiles[key];
                value === null || value === void 0 ? void 0 : value.sort((a, b) => a.name.localeCompare(b.name));
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
    const renameFileFunction = async (fileId, filename) => {
        const fileModified = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id === fileId);
        const isThereFolderWithSameName = project === null || project === void 0 ? void 0 : project.files.find((file) => file.folderId == (fileModified === null || fileModified === void 0 ? void 0 : fileModified.folderId) && file.name === filename);
        if (isThereFolderWithSameName)
            return;
        await renameFile.mutateAsync({ fileId, filename });
    };
    const renameFolderFunction = async (folderId, foldername) => {
        const folderModified = project === null || project === void 0 ? void 0 : project.folders.find((folder) => folder.id === folderId);
        const isThereFolderWithSameName = project === null || project === void 0 ? void 0 : project.folders.find((folder) => folder.parentId == (folderModified === null || folderModified === void 0 ? void 0 : folderModified.parentId) &&
            foldername === folder.name);
        if (isThereFolderWithSameName)
            return;
        await renameFolder.mutateAsync({ folderId, foldername });
    };
    const createFileFunction = async (filename, folderId) => {
        const isThereFileWithSameName = project === null || project === void 0 ? void 0 : project.files.find((file) => file.folderId == folderId && filename === file.name);
        if (isThereFileWithSameName)
            return;
        await createFile.mutateAsync({
            projectId: parseInt(idOfProject),
            name: filename,
            folderId,
        });
    };
    const createFolderFunction = async (foldername, folderId) => {
        const isThereFolderWithSameName = project === null || project === void 0 ? void 0 : project.folders.find((folder) => folder.parentId == folderId && foldername === folder.name);
        if (isThereFolderWithSameName)
            return;
        await createFolder.mutateAsync({
            projectId: parseInt(idOfProject),
            name: foldername,
            folderId,
        });
    };
    const deleteFileFunction = async (fileId) => {
        await deleteFile.mutateAsync({ fileId });
    };
    const deleteFolderFunction = async (folderId) => {
        await deleteFolder.mutateAsync({ folderId });
    };
    const isSubFolderRecursive = (folderId, newFolderId) => {
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
    const getFileContent = (fileId) => {
        const file = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id === fileId);
        return file === null || file === void 0 ? void 0 : file.content;
    };
    const setFileContent = (fileId, newContent) => {
        const updateData = (oldData) => {
            if (oldData == null)
                return;
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
        trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
    };
    const moveFolderFunction = async (folderId, newFolderId) => {
        if (!newFolderId ||
            (!isSubFolderRecursive(folderId, newFolderId) && folderId !== newFolderId)) {
            await moveFolder.mutateAsync({
                folderId,
                projectId: parseInt(idOfProject),
                newFolderId,
            });
        }
    };
    const moveFileFunction = async (fileId, newFolderId) => {
        await moveFile.mutateAsync({
            fileId,
            projectId: parseInt(idOfProject),
            newFolderId,
        });
    };
    const subscribeToEvent = (event, handler) => {
        return eventEmitter.subscribe(Events_1.EVENTS[event], handler);
    };
    const unsubscribeFromEvent = (subscription) => {
        subscription.unsubscribe();
    };
    api_1.trpc.file.onRename.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(file) {
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                eventEmitter.emit(Events_1.EVENTS.FILE_RENAME, {
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
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.file.onFileDeleted.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(fileId) {
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                eventEmitter.emit(Events_1.EVENTS.FILE_DELETED, { id: fileId });
                return {
                    ...oldData,
                    files: oldData.files.filter((item) => item.id !== fileId),
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.folder.onFolderMove.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(folder) {
            eventEmitter.emit(Events_1.EVENTS.FOLDER_MOVE, {
                folderId: folder.folderId,
                newFolderId: folder.newFolderId,
            });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
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
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.file.onFileMove.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(file) {
            eventEmitter.emit(Events_1.EVENTS.FILE_MOVE, {
                id: file.fileId,
                folderId: file.newFolderId,
            });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
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
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.folder.onFolderDeleted.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(folderId) {
            eventEmitter.emit(Events_1.EVENTS.FOLDER_DELETED, { folderId });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                // Helper function to recursively collect subfolder IDs
                const getSubfolderIds = (folderId, allFolders) => {
                    let subfolderIds = [];
                    const directSubfolders = allFolders.filter((folder) => folder.parentId === folderId);
                    for (const subfolder of directSubfolders) {
                        subfolderIds.push(subfolder.id);
                        subfolderIds = subfolderIds.concat(getSubfolderIds(subfolder.id, allFolders));
                    }
                    return subfolderIds;
                };
                const folderIdsToDelete = [
                    folderId,
                    ...getSubfolderIds(folderId, oldData.folders),
                ];
                const filesRemoved = oldData.files.filter((file) => folderIdsToDelete.includes(file.folderId));
                filesRemoved.forEach((file) => closeFile(file.id));
                return {
                    ...oldData,
                    folders: oldData.folders.filter((folder) => !folderIdsToDelete.includes(folder.id)),
                    files: oldData.files.filter((file) => !folderIdsToDelete.includes(file.folderId)),
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.project.onUpdateProjectProperties.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(data) {
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                return {
                    ...oldData,
                    description: data.newDescription,
                    name: data.newTitle,
                    isPrivate: data.isPrivate
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.project.onRemovePermission.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(data) {
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                return {
                    ...oldData,
                    projectPermissions: oldData.projectPermissions.filter(permission => permission.userId !== data.userId)
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.project.onCreatePermission.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(data) {
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                return {
                    ...oldData,
                    projectPermissions: [...oldData.projectPermissions, data.permission]
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.folder.onRename.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(folder) {
            eventEmitter.emit(Events_1.EVENTS.FOLDER_RENAME, {
                folderId: folder.folderId,
                name: folder.foldername,
            });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
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
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.file.onFileCreated.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(file) {
            eventEmitter.emit(Events_1.EVENTS.FILE_CREATED, { file });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                return {
                    ...oldData,
                    files: [...oldData.files, file],
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    api_1.trpc.folder.onFolderCreated.useSubscription({ channelId: parseInt(idOfProject) }, {
        onData(folder) {
            eventEmitter.emit(Events_1.EVENTS.FOLDER_CREATED, { folder });
            const updateData = (oldData) => {
                if (oldData == null)
                    return;
                return {
                    ...oldData,
                    folders: [...oldData.folders, folder],
                };
            };
            trpcUtils.project.getById.setData({ projectId: parseInt(idOfProject) }, updateData);
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    if (isLoading)
        return (<div className="flex w-[100%] items-center justify-center">
        <LoadingSpinner_1.LoadingSpinner big={true}/>
      </div>);
    const getSubFoldersAndFiles = (parentId) => {
        let subFolders = sortedFilesAndFoldersGrouped.sortedSubFolders[parentId];
        subFolders = subFolders ? subFolders : [];
        let subFiles = sortedFilesAndFoldersGrouped.sortedSubFiles[parentId];
        subFiles = subFiles ? subFiles : [];
        return { subFolders, subFiles };
    };
    const setSelectedFile = (fileId) => {
        const file = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id == fileId);
        setCurrentOpenedFile(file);
        setCurrentOpenedFolder(undefined);
        const index = openedFiles.array.findIndex((id) => fileId === id);
        if (index === -1 && file) {
            openedFiles.push(file.id);
        }
    };
    const closeFile = (fileId) => {
        const file = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id == fileId);
        const index = openedFiles.array.findIndex((id) => fileId === id);
        if (index !== -1 && file) {
            const isLastFile = openedFiles.array.length === 1;
            const isCurrentFileOpen = (currentOpenedFile === null || currentOpenedFile === void 0 ? void 0 : currentOpenedFile.id) === fileId;
            if (isCurrentFileOpen) {
                let newIndex = index;
                if (isLastFile) {
                    setCurrentOpenedFile(undefined);
                }
                else {
                    newIndex =
                        index === openedFiles.array.length - 1 ? index - 1 : index + 1;
                    const nextFileId = openedFiles.array[newIndex];
                    const nextFileToOpen = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id === nextFileId);
                    setCurrentOpenedFile(nextFileToOpen);
                }
            }
            openedFiles.removeValueByIndex(index);
        }
    };
    const getFileById = (fileId) => {
        const file = project === null || project === void 0 ? void 0 : project.files.find((file) => file.id === fileId);
        return file;
    };
    const setSelectedFolder = (folderId) => {
        const folder = project === null || project === void 0 ? void 0 : project.folders.find((folder) => folder.id == folderId);
        setCurrentOpenedFolder(folder);
        const index = openedFolders.findIndexByKey("id", folderId);
        if (index === -1 && folder) {
            openedFolders.push(folder);
        }
    };
    if (!project) {
        return <div>Project not found</div>;
    }
    const a = project.projectPermissions;
    return (<div className="flex h-full w-[100%] items-start overflow-y-hidden align-middle">
      <ProjectContext.Provider value={{
            projectInfo: {
                name: project.name,
                authorId: project.authorId,
                description: project.description,
                isPrivate: project.isPrivate
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
            files: project ? project === null || project === void 0 ? void 0 : project.files : [],
            folders: project ? project.folders : [],
        }}>
        <useContextMenu_1.ContextMenuProvider>
          <FileManager_1.default></FileManager_1.default>
        </useContextMenu_1.ContextMenuProvider>
      </ProjectContext.Provider>
    </div>);
};
exports.default = Code;
