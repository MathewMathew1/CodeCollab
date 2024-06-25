"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageAndCommandFromExtension = exports.getLanguageFromExtension = exports.getExtensionFromFilename = void 0;
const languageMapping = {
    js: {
        language: "javascript",
        command: (filename) => `node ${filename}`,
        image: "node:latest",
    },
    ts: {
        language: "typescript",
        command: (filename) => `npx ts-node ${filename}`,
        image: "node-ts-environment",
    },
    py: {
        language: "python",
        command: (filename) => `python ${filename}`,
        image: "python:latest",
    },
    java: {
        language: "java",
        command: (filename) => `java ${filename}`,
        image: "openjdk:latest",
    },
    cs: {
        language: "csharp",
        command: (filename) => `dotnet run ${filename}`,
        image: "my-csharp-image:latest",
    },
    cpp: {
        language: "cpp",
        command: (filename) => `g++ -o output ${filename} && ./output`,
        image: "gcc:latest",
    },
};
const getExtensionFromFilename = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
};
exports.getExtensionFromFilename = getExtensionFromFilename;
const getLanguageFromExtension = (extension) => {
    const mapping = languageMapping[extension];
    return mapping ? mapping.language : "Unknown";
};
exports.getLanguageFromExtension = getLanguageFromExtension;
const imageAndCommandFromExtension = (extension) => {
    const mapping = languageMapping[extension];
    return mapping
        ? { command: mapping.command, image: mapping.image }
        : { command: (filename) => `unknown`, image: "unknown" };
};
exports.imageAndCommandFromExtension = imageAndCommandFromExtension;
