"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const vsc_1 = require("react-icons/vsc");
function LoadingSpinner({ big = false }) {
    const sizeClasses = big ? "w-16 h-16" : "w-10 h-10";
    return (<div className="flex justify-center p-2 ">
      <vsc_1.VscRefresh fill="white" className={`animate-spin ${sizeClasses}`}/>
    </div>);
}
exports.LoadingSpinner = LoadingSpinner;
