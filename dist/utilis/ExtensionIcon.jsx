"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ai_1 = require("react-icons/ai");
const Python_webp_1 = __importDefault(require("./Python.webp"));
const Java_jpg_1 = __importDefault(require("./Java.jpg"));
const ExtensionIcon = ({ fileName }) => {
    var _a;
    const extension = (_a = fileName.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const extensionMap = {
        ts: <div className="w-[1rem] text-cyan-500">Ts</div>,
        js: <div className="w-[1rem] text-yellow-500">Js</div>,
        cpp: <div className="w-[1rem] text-yellow-500">C+</div>,
        cs: <div className="w-[1rem] text-cyan-500">C#</div>,
        py: <img src={Python_webp_1.default.src} alt="Python" className="w-[1rem]"/>,
        java: <img src={Java_jpg_1.default.src} alt="Java" className="w-[1rem]"/>
    };
    return (extensionMap[extension !== null && extension !== void 0 ? extension : ""] || (<ai_1.AiFillFile fill="white" style={{ width: "1rem" }}>
        Default
      </ai_1.AiFillFile>));
};
exports.default = ExtensionIcon;
