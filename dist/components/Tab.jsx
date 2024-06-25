"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Tab = ({ active, onClick, onClose, title, fileId, }) => {
    return (<div className={`flex cursor-pointer items-center justify-between border-x-2 border-x-gray-500 px-4  py-2 ${active ? "border-b-2 border-b-blue-500" : "text-gray-500"}`} onClick={() => onClick(fileId)}>
      <div>{title}</div>
      <button className="text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => {
            e.stopPropagation();
            onClose(fileId);
        }}>
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.707 6.293a1 1 0 011.414 0L10 8.586l2.879-2.88a1 1 0 111.415 1.415L11.414 10l2.88 2.879a1 1 0 01-1.415 1.415L10 11.414l-2.879 2.88a1 1 0 01-1.414-1.415L8.586 10 5.707 7.121a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>);
};
exports.default = Tab;
