import  {createContext, useContext, useEffect, useState,} from "react";
import useArray from "../hooks/useArray";
import { severityColors } from "../types/Toast";

const SNACKBAR_SCREEN_TIME = 5000
const MAXIMUM_AMOUNT_OF_SNACKBARS = 3
let idOfNextToast = 1

export type ToastInfo = {
    message: string,
    severity: severityColors
    id: number
}

type ToastContextProps = {    
    toastsInfos: ToastInfo[]
}

type ToastUpdateProps = {    
    addToast: ({toastText, severity}: {toastText: string, severity: severityColors}) => void
    removeToastById: (index: number) => void
}

const ToastContext = createContext({} as ToastContextProps)
const ToastUpdate = createContext({} as ToastUpdateProps)

export function useToast(){
    return useContext(ToastContext)
}

export function useUpdateToast(){
    return useContext(ToastUpdate)
}

const ToastProvider = ({ children }: {children: any}): JSX.Element => {
    const toastInfos = useArray<ToastInfo>([])
    const [idToDelete, setIdToDelete] = useState<number|null>(null)

    useEffect(() => {
        let toastInfo = sessionStorage.getItem("toast")
        if(toastInfo){
            sessionStorage.removeItem("toast")
            let toastInfoParsed: ToastInfo = JSON.parse(toastInfo)
            addToast({toastText: toastInfoParsed.message, severity: toastInfoParsed.severity})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addToast = ({toastText, severity}: {toastText: string, severity: severityColors}): void => {
        if(toastInfos.array.length >= MAXIMUM_AMOUNT_OF_SNACKBARS){
            toastInfos.removeValueByIndex(0)
        }
        toastInfos.push({message: toastText, severity, id: idOfNextToast})
        let idOfCreatedToast = idOfNextToast
        idOfNextToast += 1
        setTimeout(() => setIdToDelete(idOfCreatedToast)
        , SNACKBAR_SCREEN_TIME)
    }
    
    useEffect(() => {

        if(idToDelete==null) return
        removeToastById(idToDelete)
        setIdToDelete(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idToDelete]);

    const removeToastById = (id: number) => {
        toastInfos.removeByKey("id", id)
    }

    return (
        <ToastContext.Provider value={{toastsInfos: toastInfos.array}}>
            <ToastUpdate.Provider value={{addToast, removeToastById}}>
                {children}   
            </ToastUpdate.Provider>
        </ToastContext.Provider>
    )
}

export default ToastProvider