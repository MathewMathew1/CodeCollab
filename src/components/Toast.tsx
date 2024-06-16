import React from "react";
import { severityColors } from "../types/Toast";
import { AiFillCloseCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";

interface ToastProps {
  variant: severityColors;
  message: string;
  handleClose: () => void;
  bottom: number;
}

const Toast: React.FC<ToastProps> = ({
  variant,
  message,
  handleClose,
  bottom,
}) => {
  return (
    <div
      style={{ bottom: `${bottom}px` }}
      className={`fixed right-[2rem] w-[280px]`}
    >
      <div
        className={`max-w-xs ${variant} rounded-md text-sm text-white shadow-lg`}
        role="alert"
      >
        <div className="flex p-4">
          {message}
          <div className="ml-3">
            <div className="relative">
              <button
                onClick={() => handleClose()}
                type="button"
                className="rounded-full  bg-black text-white hover:bg-gray-800"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
