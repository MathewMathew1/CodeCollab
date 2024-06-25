"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileImage = void 0;
const image_1 = __importDefault(require("next/image"));
const vsc_1 = require("react-icons/vsc");
const SIZES = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    big: "h-12 w-12",
};
function ProfileImage({ src, className = "", size = "medium", }) {
    const sizeOfImageClass = SIZES[size];
    return (<div className={`relative ${sizeOfImageClass} overflow-hidden rounded-full ${className}`}>
      {src == null ? (<vsc_1.VscAccount className="h-full w-full"/>) : (<image_1.default src={src} alt="Profile Image" quality={100} fill/>)}
    </div>);
}
exports.ProfileImage = ProfileImage;
