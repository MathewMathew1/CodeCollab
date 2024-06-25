"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _id_1 = require("../../pages/project/[id]");
const Button_1 = __importDefault(require("../Button"));
const Modal_1 = __importDefault(require("../Modal"));
const DeleteFolderModal = ({ isOpen, handleClose, folder }) => {
    const { deleteFolderFunction } = (0, _id_1.useProject)();
    const deleteFolder = () => {
        deleteFolderFunction(folder.id);
        handleClose();
    };
    return <> 
    {isOpen ?
            <Modal_1.default>
            <div onClick={() => handleClose()} className="flex mt-3 flex-col p-5 text-white">
                <div> <h3 className="text-[1rem] text-bold mb-3">Are you sure you want to delete {folder.name}?</h3></div>
                <div className="flex justify-end gap-2">
                    <Button_1.default color="blue" onClick={() => handleClose()}>Cancel</Button_1.default>
                    <Button_1.default color="red" onClick={() => deleteFolder()}>Delete</Button_1.default>
                </div>
            </div>
        </Modal_1.default>
            :
                null}
    </>;
};
exports.default = DeleteFolderModal;
