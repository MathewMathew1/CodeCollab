import React, { useEffect, useState } from "react";
import { useContextMenu } from "../contexts/useContextMenu";
import { File, Folder } from "../types/Project";
import DeleteFileModal from "./Modals/DeleteFileModal";
import { useProject } from "../pages/project/[id]";

const ContextMenu = () => {
  const {
    mouseX,
    mouseY,
    fileContextMenu,
    folderContextMenu,
    handleNewFile,
    handleNewFolder,
    handleCloseContextMenu,
  } = useContextMenu();

  const { setDeleteModalInfo, setDeleteFolderModalInfo } = useProject();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      handleCloseContextMenu();
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div
        className="fixed z-10 w-[250px] border-gray-300 bg-[#000000] p-2 py-3 text-white shadow"
        style={{
          top: mouseY,
          left: mouseX,
        }}
      >
        <div
          onClick={() => handleNewFile()}
          className="select-none pl-3 hover:bg-blue-600"
        >
          New File
        </div>
        <div
          onClick={() => handleNewFolder()}
          className="select-none pl-3 hover:bg-blue-600"
        >
          New Folder
        </div>
        {fileContextMenu ? (
          <div
            onClick={() => setDeleteModalInfo(fileContextMenu)}
            className="select-none pl-3 hover:bg-blue-600"
          >
            Delete
          </div>
        ) : null}
        {folderContextMenu ? (
          <div
            onClick={() => setDeleteFolderModalInfo(folderContextMenu)}
            className="select-none pl-3 hover:bg-blue-600"
          >
            Delete
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ContextMenu;
