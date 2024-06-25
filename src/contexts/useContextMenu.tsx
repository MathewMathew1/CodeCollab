import React, { createContext, useContext, useState } from 'react';
import { Folder, File } from '../types/Project';

type ContextMenuContextProps = {
  contextMenuOpen: boolean;
  mouseX: number;
  mouseY: number;
  fileContextMenu: File | null;
  folderContextMenu: Folder | null;
  handleContextMenu: (e: React.MouseEvent, file: File | null, folder: Folder | null) => void;
  handleCloseContextMenu: () => void;
  creatingFile: boolean,
  creatingFolder: boolean
  handleNewFile: () => void
  handleNewFolder: () => void
  closeAddingNewThing: () => void
}

const ContextMenuContext = createContext<ContextMenuContextProps>({} as ContextMenuContextProps);

export function useContextMenu(){
    return useContext(ContextMenuContext)
}

export const ContextMenuProvider = ({ children }: {children: any}): JSX.Element => {
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const [mouseX, setMouseX] = useState<number>(0)
    const [mouseY, setMouseY] = useState<number>(0)
    const [fileContextMenu, setFileContextMenu] = useState<File | null>(null)
    const [folderContextMenu, setFolderContextMenu] = useState<Folder | null>(null)

    const [creatingFile, setCreatingFile] = useState(false)
    const [creatingFolder, setCreatingFolder] = useState(false)

    const closeAddingNewThing = () => {
        setCreatingFolder(false)
        setCreatingFile(false)
    };

    const handleNewFile = () => {
        setCreatingFolder(false)
        setCreatingFile(true)
    };

    const handleNewFolder = () => {
        setCreatingFile(false);
        setCreatingFolder(true);
    };

    const handleContextMenu = (e: React.MouseEvent, file: File | null, folder: Folder | null) => {
      e.preventDefault()
      e.stopPropagation()
  
      const menuWidth = 150
      const menuHeight = 150
      const padding = 10
  
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
  
      let mouseX = e.clientX
      let mouseY = e.clientY
  

      if (mouseX + menuWidth + padding > viewportWidth) {
          mouseX = viewportWidth - menuWidth - padding
      }
      if (mouseY + menuHeight + padding > viewportHeight) {
          mouseY = viewportHeight - menuHeight - padding
      }
  
      setMouseX(mouseX)
      setMouseY(mouseY)
      setFileContextMenu(file)
      setFolderContextMenu(folder)
      setContextMenuOpen(true)
  }

  const handleCloseContextMenu = () => {
    setContextMenuOpen(false)
  };

  return (
    <ContextMenuContext.Provider
      value={{
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
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};