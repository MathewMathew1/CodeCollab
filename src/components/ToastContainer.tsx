import { ToastInfo, useToast, useUpdateToast } from "../contexts/useToast";
import Toast from "./Toast";
//HELPERS
const ToastContainer = (): JSX.Element => {
  const toasts = useToast();
  const toastUpdate = useUpdateToast();

  const handleClose = (index: number): void => {
    toastUpdate.removeToastById(index);
  };

  return (
    <>
      {toasts.toastsInfos.map((toast: ToastInfo, index: number) => (
        <Toast
          bottom={50 + 80 * index}
          variant={toast.severity}
          handleClose={() => handleClose(toast.id)}
          key={`${index}toast`}
          message={toast.message}
        />
      ))}
    </>
  );
};

export default ToastContainer;
