import { useProject } from "../pages/project/[id]";
import FileInStructure from "./FileInStructure";
import FolderInStructure from "./FolderInStructure";
import ContextMenu from "./ContextMenu";
import { useContextMenu } from "../contexts/useContextMenu";
import TemporaryFile from "./TemporaryFile";
import TemporaryFolder from "./TemporaryFolder";
import DeleteFileModal from "./Modals/DeleteFileModal";
import DeleteFolderModal from "./Modals/DeleteFolderModal";

const SidebarProjectSolution = () => {
  const {
    firstRowFiles,
    firstRowFolders,
    deleteFileModalInfo,
    setDeleteModalInfo,
    moveFileFunction,
    deleteFolderModalInfo,
    setDeleteFolderModalInfo,
    moveFolderFunction,
  } = useProject();
  const {
    contextMenuOpen,
    folderContextMenu,
    fileContextMenu,
    creatingFile,
    creatingFolder,
    handleContextMenu,
  } = useContextMenu();

  const newFileInRoot = !folderContextMenu?.id && !fileContextMenu?.folderId;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedFolderId = e.dataTransfer.getData("text/plain");
    const type = e.dataTransfer.getData("itemType");
    if (type === "folder") {
      console.log(draggedFolderId);
      moveFolderFunction(parseInt(draggedFolderId), undefined);
      return;
    }
    console.log(draggedFolderId);
    moveFileFunction(parseInt(draggedFolderId), undefined);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    console.log(e.dataTransfer.getData("text/plain"));
    e.preventDefault();
  };

  return (
    <div
      onContextMenu={(e) => handleContextMenu(e, null, null)}
      className="relative flex h-[100%] w-[200px] flex-col items-center justify-center bg-[#262624] pt-3 "
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}
    >
      <div className="flex h-full w-full flex-col text-white">
        <div className="mb-3 text-center text-white">Project Solution</div>
        <div className="scrollbar overflow-auto text-[14px]">
          <div className="flex  flex-col">
            {creatingFile && newFileInRoot ? (
              <TemporaryFile stackLevel={1} />
            ) : null}
            {firstRowFolders.map((folder) => (
              <FolderInStructure
                stackLevel={1}
                key={`${folder.id} folder`}
                folder={folder}
              />
            ))}
            {creatingFolder && newFileInRoot ? (
              <TemporaryFolder stackLevel={1} />
            ) : null}
            {firstRowFiles.map((file) => (
              <FileInStructure
                stackLevel={1}
                key={`${file.id} file`}
                file={file}
              />
            ))}
          </div>
        </div>
      </div>
      {contextMenuOpen ? <ContextMenu /> : null}
      <DeleteFileModal
        isOpen={deleteFileModalInfo !== null}
        handleClose={() => setDeleteModalInfo(null)}
        file={deleteFileModalInfo!}
      />
      <DeleteFolderModal
        isOpen={deleteFolderModalInfo !== null}
        handleClose={() => setDeleteFolderModalInfo(null)}
        folder={deleteFolderModalInfo!}
      />
    </div>
  );
};

export default SidebarProjectSolution;
