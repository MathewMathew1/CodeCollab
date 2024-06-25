"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateToast = exports.useToast = void 0;
const react_1 = require("react");
const useArray_1 = __importDefault(require("../hooks/useArray"));
const SNACKBAR_SCREEN_TIME = 5000;
const MAXIMUM_AMOUNT_OF_SNACKBARS = 3;
let idOfNextToast = 1;
const ToastContext = (0, react_1.createContext)({});
const ToastUpdate = (0, react_1.createContext)({});
function useToast() {
    return (0, react_1.useContext)(ToastContext);
}
exports.useToast = useToast;
function useUpdateToast() {
    return (0, react_1.useContext)(ToastUpdate);
}
exports.useUpdateToast = useUpdateToast;
const ToastProvider = ({ children }) => {
    const toastInfos = (0, useArray_1.default)([]);
    const [idToDelete, setIdToDelete] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let toastInfo = sessionStorage.getItem("toast");
        if (toastInfo) {
            sessionStorage.removeItem("toast");
            let toastInfoParsed = JSON.parse(toastInfo);
            addToast({ toastText: toastInfoParsed.message, severity: toastInfoParsed.severity });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const addToast = ({ toastText, severity }) => {
        if (toastInfos.array.length >= MAXIMUM_AMOUNT_OF_SNACKBARS) {
            toastInfos.removeValueByIndex(0);
        }
        toastInfos.push({ message: toastText, severity, id: idOfNextToast });
        let idOfCreatedToast = idOfNextToast;
        idOfNextToast += 1;
        setTimeout(() => setIdToDelete(idOfCreatedToast), SNACKBAR_SCREEN_TIME);
    };
    (0, react_1.useEffect)(() => {
        if (idToDelete == null)
            return;
        removeToastById(idToDelete);
        setIdToDelete(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idToDelete]);
    const removeToastById = (id) => {
        toastInfos.removeByKey("id", id);
    };
    return (<ToastContext.Provider value={{ toastsInfos: toastInfos.array }}>
            <ToastUpdate.Provider value={{ addToast, removeToastById }}>
                {children}   
            </ToastUpdate.Provider>
        </ToastContext.Provider>);
};
exports.default = ToastProvider;
