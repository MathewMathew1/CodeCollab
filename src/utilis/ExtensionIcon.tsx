import React from "react";
import { AiFillFile } from "react-icons/ai";
import PythonIcon from "./Python.webp"
import JavaIcon from "./Java.jpg"

type ExtensionIconProps = {
  fileName: string;
};


const ExtensionIcon: React.FC<ExtensionIconProps> = ({ fileName }) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const extensionMap: Record<string, JSX.Element> = {
    ts: <div className="w-[1rem] text-cyan-500">Ts</div>,
    js: <div className="w-[1rem] text-yellow-500">Js</div>,
    cpp: <div className="w-[1rem] text-yellow-500">C+</div>,
    cs: <div className="w-[1rem] text-cyan-500">C#</div>,
    py: <img src={PythonIcon.src} alt="Python" className="w-[1rem]"/>,
    java: <img src={JavaIcon.src} alt="Java" className="w-[1rem]"/>
  };

  return (
    extensionMap[extension ?? ""] || (
      <AiFillFile fill="white" style={{ width: "1rem" }}>
        Default
      </AiFillFile>
    )
  );
};

export default ExtensionIcon;
