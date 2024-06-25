import { useProject } from "../../pages/project/[id]";
import Button from "../Button";
import Modal from "../Modal";
import { Folder } from "../../types/Project";

const DeleteFolderModal = ({isOpen, handleClose, folder}: {
    isOpen: boolean, 
    handleClose: () => void,
    folder: Folder
}) => {
    
    const {deleteFolderFunction} = useProject()

    const deleteFolder = () => {
        deleteFolderFunction(folder.id)
        handleClose()
    }

    return <> 
    {isOpen?
        <Modal>
            <div onClick={()=>handleClose()} className="flex mt-3 flex-col p-5 text-white">
                <div> <h3 className="text-[1rem] text-bold mb-3">Are you sure you want to delete {folder.name}?</h3></div>
                <div className="flex justify-end gap-2">
                    <Button color="blue" onClick={()=>handleClose()}>Cancel</Button>
                    <Button color="red" onClick={()=>deleteFolder()}>Delete</Button>
                </div>
            </div>
        </Modal>
    :
        null
    }
    </>
}
 
export default DeleteFolderModal;