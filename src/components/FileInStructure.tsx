import { useEffect, useState } from "react";
import { useContextMenu } from "../contexts/useContextMenu";
import { useProject } from "../pages/project/[id]";
import { File } from "../types/Project";
import ExtensionIcon from "../utilis/ExtensionIcon";

type FileInStructureProps = {
    file: File;
    stackLevel: number
};

const FileInStructure: React.FC<FileInStructureProps> = ({ file, stackLevel}) => {
    const [editing, setEditing] = useState(false);
    const [fileName, setFileName] = useState(file.name);


    const {handleContextMenu} = useContextMenu()

    const {setSelectedFile, selectedFile, renameFileFunction, setDeleteModalInfo} = useProject()

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === 'Enter') {

        if(selectedFile?.id === file.id){
          renameFileFunction(file.id, fileName)
          setFileName(fileName)
          setEditing(false)
        }
      }
    }

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {

        if (e.code === 'F2') {
          // Perform your action here
          if(selectedFile?.id === file.id){
            setEditing(true)
          }
        }

        if (e.code === 'Delete') {
          // Perform your action here
          if(selectedFile?.id === file.id){
            setDeleteModalInfo(file)
          }
        }
        
      };

      document.addEventListener('keydown', (e)=>handleKeyPress(e));
  
      // Clean up the event listener when the component is unmounted
      return () => {
        document.removeEventListener('keydown', (e)=>handleKeyPress(e));
      };
    }, [selectedFile?.id]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('text/plain', file.id.toString());
      e.dataTransfer.setData('itemType', "file");
    };
  
    return (
    <div className={`w-[100%]`} >
        <div className={`flex items-center `} 
          draggable="true"
          onDragStart={(e)=>handleDragStart(e)}
          onContextMenu={(e)=>handleContextMenu(e, file, null)} 
          style={{ backgroundColor: `${selectedFile?.id === file.id ? "grey" : "transparent"}`, paddingLeft: `${6*stackLevel}px` }} >
            <ExtensionIcon fileName={fileName} />
            {editing ? (
              <input
                  className="text-white p-1 flex-1 bg-[#404142] w-[1px] outline-none"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={(e)=>handleEnter(e)}
                  autoFocus
                  onBlur={()=>{setFileName(file.name); setEditing(false)}}
              />
              ) : (
              <div className="text-white p-1 flex-1" onClick={() => setSelectedFile(file.id)}>
                  {file.name}
              </div>
            )}
        </div>
      </div>
    );
  };
  
  export default FileInStructure;

