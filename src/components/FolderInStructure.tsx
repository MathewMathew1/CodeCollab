// FolderInStructure.js
import { useProject } from "../pages/project/[id]";
import { Folder } from "../types/Project";
import FileInStructure from "./FileInStructure";
import { useContextMenu } from "../contexts/useContextMenu";
import TemporaryFile from "./TemporaryFile";
import {AiFillFolder} from "react-icons/ai"
import TemporaryFolder from "./TemporaryFolder";
import { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

const FolderInStructure = ({ folder, stackLevel }: { 
    folder: Folder,
    stackLevel: number
}) => {
    const [showContent, setShowContent] = useState(true)
    const [editing, setEditing] = useState(false);
    const { currentOpenedFolder, getSubFoldersAndFiles, setSelectedFolder, moveFolderFunction, moveFileFunction,
        renameFolderFunction, setDeleteFolderModalInfo } = useProject();
    const foldersAndFiles = getSubFoldersAndFiles(folder.id);
    const [folderName, setFolderName] = useState(folder.name);

    const {handleContextMenu, creatingFile, creatingFolder, fileContextMenu, folderContextMenu} = useContextMenu()

    const folderIdOfContextMenu = folderContextMenu?.id === folder.id || fileContextMenu?.folderId === folder.id
    
    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter') {
  
          if(currentOpenedFolder?.id === folder.id){
            renameFolderFunction(folder.id, folderName)
            setEditing(false)
          }
        }
    }

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
  
          if (e.code === 'F2') {
            if(currentOpenedFolder?.id === folder.id){
              setEditing(true)
            }
          }

          if (e.code === 'Delete') {
            if(currentOpenedFolder?.id === folder.id){
              setDeleteFolderModalInfo(folder)
            }
          }
          
        };
  
        document.addEventListener('keydown', (e)=>handleKeyPress(e));
    
        // Clean up the event listener when the component is unmounted
        return () => {
          document.removeEventListener('keydown', (e)=>handleKeyPress(e));
        };
    }, [currentOpenedFolder?.id]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', folder.id.toString());
        e.dataTransfer.setData('itemType', "folder");
    };
      
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(e.dataTransfer.getData('text/plain'))
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedFolderId = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('itemType');
        if(type==="folder"){
            console.log(folder.id)
            moveFolderFunction(parseInt(draggedFolderId), folder.id)
            return
        }

        moveFileFunction(parseInt(draggedFolderId), folder.id)
    };

    const handleClickOnFolder = () => {
        setSelectedFolder(folder.id)
        setShowContent(!showContent)
    }
   
    return (
        <div  className="flex flex-col text-white" onDrop={(e)=>handleDrop(e)}>
            <div
                
                draggable="true"
                onDragStart={(e)=>handleDragStart(e)}
                onDragOver={(e)=>handleDragOver(e)}
                onClick={() => handleClickOnFolder()}
                style={{ backgroundColor: `${currentOpenedFolder?.id === folder.id ? "grey" : "transparent"}`, paddingLeft: `${stackLevel*6}px` }} 
                className="flex items-center w-[100%]" onContextMenu={(e)=>handleContextMenu(e, null, folder)}>
                <div className="w-[1rem] h-[100%] "><AiFillFolder fill={"orange"}/></div>
                {showContent?
                    <MdKeyboardArrowDown />
                :
                    <MdKeyboardArrowRight />
                }
                {editing ? (
                    <input
                        className="text-white p-1 flex-1 bg-[#404142] w-[1px] outline-none"
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyDown={(e)=>handleEnter(e)}
                        autoFocus
                        onBlur={()=>setEditing(false)}
                    />
                ) : (
                    <div className="p-1 rounded flex-1" >{folder.name}</div>
                )}
                
            </div>
            {showContent?
                <div className="flex flex-col">
                    { creatingFile && folderIdOfContextMenu ?
                        <TemporaryFile stackLevel={stackLevel+1}/>
                    :
                        null
                    }
                    {foldersAndFiles.subFolders.map((subFolder) => (
                        <FolderInStructure key={`${subFolder.id} folder`} folder={subFolder} stackLevel={stackLevel+1}/>
                    ))}
                    { creatingFolder && folderIdOfContextMenu ?
                        <TemporaryFolder stackLevel={stackLevel+1}/>
                    :
                        null
                    }
                    {foldersAndFiles.subFiles.map((subFile) => (
                        <FileInStructure stackLevel={stackLevel+1} key={`${subFile.id} file`} file={subFile} />
                    ))}
                </div>
            :
                null
            }
        </div>
    );
};

export default FolderInStructure;