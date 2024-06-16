type LanguageMapping = {
  [key: string]: {
    language: string;
    command: (filename: string) => string;
    image: string;
  };
};

const languageMapping: LanguageMapping = {
  js: {
    language: "javascript",
    command: (filename: string) => `node ${filename}`,
    image: "node:latest",
  },
  ts: {
    language: "typescript",
    command: (filename: string) => `npx ts-node ${filename}`,
    image: "node-ts-environment",
  },
  py: {
    language: "python",
    command: (filename: string) => `python ${filename}`,
    image: "python:latest",
  },
  java: {
    language: "java",
    command: (filename: string) => `java ${filename}`,
    image: "openjdk:latest",
  },
  cs: {
    language: "csharp",
    command: (filename: string) => `dotnet run ${filename}`,
    image: "my-csharp-image:latest",
  },
  cpp: {
    language: "cpp",
    command: (filename: string) => `g++ -o output ${filename} && ./output`,
    image: "gcc:latest",
  },
};

export const getExtensionFromFilename = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
};

export const getLanguageFromExtension = (extension: string) => {
  const mapping = languageMapping[extension];
  return mapping ? mapping.language : "Unknown";
};

export const imageAndCommandFromExtension = (extension: string) => {
  const mapping = languageMapping[extension];
  return mapping
    ? { command: mapping.command, image: mapping.image }
    : { command: (filename: string) => `unknown`, image: "unknown" };
};
