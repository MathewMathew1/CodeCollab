"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const useToast_1 = require("../contexts/useToast");
const Toast_1 = __importDefault(require("./Toast"));
//HELPERS
const ToastContainer = () => {
    const toasts = (0, useToast_1.useToast)();
    const toastUpdate = (0, useToast_1.useUpdateToast)();
    const handleClose = (index) => {
        toastUpdate.removeToastById(index);
    };
    return (<>
      {toasts.toastsInfos.map((toast, index) => (<Toast_1.default bottom={50 + 80 * index} variant={toast.severity} handleClose={() => handleClose(toast.id)} key={`${index}toast`} message={toast.message}/>))}
    </>);
};
exports.default = ToastContainer;
