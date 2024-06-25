"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const COLORS = {
    black: "bg-black hover:bg-gray-800 focus-visible:bg-gray-800",
    white: "bg-white hover:bg-gray-300 focus-visible:bg-gray-300",
    red: "bg-red-500 hover:bg-red-400 focus-visible:bg-red-400",
    green: "bg-green-500 hover:bg-green-400 focus-visible:bg-green-400",
    blue: "bg-blue-500 hover:bg-blue-400 focus-visible:bg-blue-400",
    default: "bg-gray-400 hover:bg-gray-300 focus-visible:bg-gray-300"
};
function Input({ small, color = "default", className = "", ...props }) {
    const sizeClasses = small ? "px-2 py-1" : "px-4 py-2";
    const colorClass = COLORS[color];
    return <input className={`rounded-md transition-colors duration-200 
    text-black ${sizeClasses} ${colorClass} ${className}`} {...props}/>;
}
exports.default = Input;
