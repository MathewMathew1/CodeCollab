import { useProject } from "~/pages/project/[id]";
import Button from "../Button";
import Modal from "../Modal";
import { File } from "~/types/Project";

const DeleteFileModal = ({isOpen, handleClose, file}: {
    isOpen: boolean, 
    handleClose: () => void,
    file: File
}) => {
    
    const {deleteFileFunction} = useProject()

    return <> 
    {isOpen?
        <Modal>
            <div onClick={()=>handleClose()} className="flex mt-3 flex-col p-5 text-white">
                <div> <h3 className="text-[1rem] text-bold mb-3">Are you sure you want to delete {file.name}?</h3></div>
                <div className="flex justify-end gap-2">
                    <Button color="blue" onClick={()=>handleClose()}>Cancel</Button>
                    <Button color="red" onClick={()=>deleteFileFunction(file.id)}>Delete</Button>
                </div>
            </div>
        </Modal>
    :
        null
    }
    </>
}
 
export default DeleteFileModal;