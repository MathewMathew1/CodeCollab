"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletionProviderJavascript = void 0;
const ProjectPath_1 = require("./ProjectPath");
const dockerodeHelper_1 = require("./dockerodeHelper");
const createCompletionProviderJavascript = (monaco, editor) => {
    return {
        provideCompletionItems: (model, position, context, token) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            });
            const currentModel = editor.getModel();
            if (!currentModel) {
                return { suggestions: [] };
            }
            const currentFilePath = currentModel.uri.path;
            const importPattern = /(([\s|\n]+from\s+)|(\brequire\b\s*\())["|'][^'^"]*$/;
            if (importPattern.test(textUntilPosition)) {
                if (textUntilPosition.endsWith(".") || textUntilPosition.endsWith("/")) {
                    const suggestions = monaco.editor
                        .getModels()
                        .filter(file => {
                        const extension = (0, dockerodeHelper_1.getExtensionFromFilename)(file.uri.path);
                        if (extension !== "ts" && extension !== "js") {
                            return false;
                        }
                        return file.uri.path !== currentFilePath;
                    })
                        .map(file => {
                        let filename = (0, ProjectPath_1.getRelativePath)(currentFilePath, file.uri.path)
                            .replace(/\.(js|ts)$/, "");
                        const match = /(([\s|\n]+from\s+)|(\brequire\b\s*\())["|']([^'^"]*)$/.exec(textUntilPosition);
                        const typedText = match[4];
                        const fileToSuggest = filename.slice(typedText.length);
                        return {
                            label: filename,
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                            },
                            insertText: fileToSuggest,
                            kind: monaco.languages.CompletionItemKind.File,
                        };
                    })
                        .filter(Boolean);
                    return { suggestions };
                }
                else {
                    return { suggestions: [] };
                }
            }
            return { suggestions: [] };
        },
    };
};
exports.createCompletionProviderJavascript = createCompletionProviderJavascript;
