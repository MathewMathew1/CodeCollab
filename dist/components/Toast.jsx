"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Toast = ({ variant, message, handleClose, bottom, }) => {
    return (<div style={{ bottom: `${bottom}px` }} className={`fixed right-[2rem] w-[280px]`}>
      <div className={`max-w-xs ${variant} rounded-md text-sm text-white shadow-lg`} role="alert">
        <div className="flex p-4">
          {message}
          <div className="ml-3">
            <div className="relative">
              <button onClick={() => handleClose()} type="button" className="rounded-full  bg-black text-white hover:bg-gray-800">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Toast;
