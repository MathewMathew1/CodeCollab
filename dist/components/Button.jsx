"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const COLORS = {
    black: "bg-black hover:bg-gray-800 focus-visible:bg-gray-800",
    white: "bg-white hover:bg-gray-300 focus-visible:bg-gray-300",
    red: "bg-red-500 hover:bg-red-400 focus-visible:bg-red-400",
    green: "bg-green-500 focus-visible:bg-green-400 hover:bg-green-300",
    blue: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus-visible:from-cyan-400 focus-visible:to-blue-400",
    default: "bg-gray-400 hover:bg-gray-300 focus-visible:bg-gray-300",
};
function Button({ small, color = "default", className = "", ...props }) {
    const sizeClasses = small ? "px-2 py-1" : "px-4 py-2 font-bold";
    const colorClass = COLORS[color];
    return (<button className={`rounded-md text-white transition-colors 
    duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${colorClass} ${className}`} {...props}></button>);
}
exports.default = Button;
