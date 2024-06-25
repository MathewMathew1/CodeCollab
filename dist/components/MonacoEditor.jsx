"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_2 = require("@monaco-editor/react");
const api_1 = require("../utils/api");
const router_1 = require("next/router");
const diff_match_patch_1 = __importDefault(require("diff-match-patch"));
const _id_1 = require("../pages/project/[id]");
const dockerodeHelper_1 = require("../utilis/dockerodeHelper");
const LENGTH_OF_LINE_BREAK = 2;
const CodeEditor = ({ setMonacoAtStart, initialValue, idOfFile, connectToChanges, disconnectFromChanges, requestId, monaco, editor, }) => {
    var _a, _b;
    const [language, setLanguage] = (0, react_1.useState)("javascript");
    const currentCode = (0, react_1.useRef)(initialValue);
    const preventSendingMessage = (0, react_1.useRef)(false);
    const router = (0, router_1.useRouter)();
    const { id } = router.query;
    const project = (0, _id_1.useProject)();
    const updateFile = api_1.trpc.file.update.useMutation();
    (0, react_1.useEffect)(() => {
        var _a;
        if (!project.selectedFile)
            return;
        const extension = (0, dockerodeHelper_1.getExtensionFromFilename)((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.name);
        const languageOfFile = (0, dockerodeHelper_1.getLanguageFromExtension)(extension);
        setLanguage(languageOfFile);
    }, [(_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.name]);
    (0, react_1.useEffect)(() => {
        if (editor) {
            connectToChanges(applyRemoteChange, idOfFile, editor);
        }
        return () => {
            disconnectFromChanges();
        };
    }, [editor]);
    const applyRemoteChange = async (diffs, editor) => {
        const dmp = new diff_match_patch_1.default();
        const newSelection = getNewSelection(diffs);
        const model = editor.getModel();
        const patch = dmp.patch_make(model.getValue(), diffs);
        const [newText] = dmp.patch_apply(patch, model.getValue());
        currentCode.current = newText;
        preventSendingMessage.current = true;
        model.pushEditOperations([], [
            {
                text: newText,
                range: {
                    endColumn: model.getLineMaxColumn(model.getLineCount()),
                    endLineNumber: model.getLineCount(),
                    startColumn: 1,
                    startLineNumber: 1,
                },
            },
        ], () => []);
        project.setFileContent(idOfFile, newText);
        editor.setSelection(newSelection);
    };
    const getNewSelection = (diffs) => {
        var _a, _b;
        const currentSelectionStart = ((_a = editor.getSelection()) === null || _a === void 0 ? void 0 : _a.startColumn) || 1;
        const currentSelectionEnd = ((_b = editor.getSelection()) === null || _b === void 0 ? void 0 : _b.endColumn) || 1;
        let newSelectionStart = currentSelectionStart;
        let newSelectionEnd = currentSelectionEnd;
        let charactersInsideText = 0;
        let changesInStartColumn = 0;
        let changesInEndColumn = 0;
        let currentColumnBeforeChanges = 1;
        let currentTextBeforeChanges = 1;
        let columnOfSelectionStart = editor.getSelection().startLineNumber || 1;
        let columnOfSelectionEnd = editor.getSelection().endLineNumber || 1;
        for (let i = 0; i < diffs.length; i++) {
            charactersInsideText = charactersInsideText + diffs[i][1].length;
            const lineBreaks = [0, ...getHowManyLineBreaksAreInString(diffs[i][1])];
            lineBreaks.forEach((lineBreak, index) => {
                const endOfLine = lineBreaks[index + 1] || diffs[i][1].length;
                const textTillEndOfLine = endOfLine - lineBreak;
                if (diffs[i][0] === 1) {
                    if (currentColumnBeforeChanges <= columnOfSelectionStart &&
                        index !== 0 &&
                        currentTextBeforeChanges <= currentSelectionStart) {
                        changesInStartColumn = changesInStartColumn + 1;
                    }
                    if (currentColumnBeforeChanges <= columnOfSelectionEnd &&
                        index !== 0 &&
                        currentTextBeforeChanges <= currentSelectionStart) {
                        changesInEndColumn = changesInEndColumn + 1;
                    }
                    if (currentColumnBeforeChanges === columnOfSelectionStart) {
                        if (currentTextBeforeChanges > currentSelectionStart) {
                            return;
                        }
                        else {
                            if (index === 0) {
                                newSelectionStart = newSelectionStart + textTillEndOfLine;
                            }
                            else {
                                newSelectionStart =
                                    newSelectionStart - currentTextBeforeChanges - 1;
                            }
                        }
                    }
                    if (currentColumnBeforeChanges === columnOfSelectionEnd) {
                        if (currentTextBeforeChanges > currentSelectionEnd) {
                            return;
                        }
                        else {
                            if (index === 0) {
                                newSelectionEnd = newSelectionEnd + textTillEndOfLine;
                            }
                            else {
                                newSelectionEnd =
                                    newSelectionEnd - currentTextBeforeChanges - 1;
                            }
                        }
                    }
                }
                if (diffs[i][0] === 0) {
                    if (currentColumnBeforeChanges === columnOfSelectionStart) {
                        currentTextBeforeChanges =
                            currentTextBeforeChanges + textTillEndOfLine;
                    }
                    if (index !== 0) {
                        currentColumnBeforeChanges = currentColumnBeforeChanges + 1;
                    }
                }
                if (diffs[i][0] === -1) {
                    if (currentColumnBeforeChanges <= columnOfSelectionStart &&
                        index !== 0 &&
                        currentTextBeforeChanges <= currentSelectionStart) {
                        changesInStartColumn = changesInStartColumn - 1;
                    }
                    if (currentColumnBeforeChanges <= columnOfSelectionEnd &&
                        index !== 0 &&
                        currentTextBeforeChanges <= currentSelectionEnd) {
                        changesInEndColumn = changesInEndColumn - 1;
                    }
                    if (currentColumnBeforeChanges === columnOfSelectionStart) {
                        if (currentTextBeforeChanges >= currentSelectionStart) {
                            return;
                        }
                        else {
                            if (index === 0) {
                                newSelectionStart = newSelectionStart - textTillEndOfLine;
                            }
                            else {
                                let amountOfTextSinceLastLineBreak = 0;
                                if (index > 1) {
                                    amountOfTextSinceLastLineBreak =
                                        lineBreak - lineBreaks[index - 1];
                                }
                                else {
                                    amountOfTextSinceLastLineBreak =
                                        getLengthOfTextSinceLastLineBreak(diffs, i) + lineBreak;
                                }
                                newSelectionStart =
                                    newSelectionStart + amountOfTextSinceLastLineBreak;
                            }
                        }
                    }
                    if (currentColumnBeforeChanges === columnOfSelectionEnd) {
                        if (currentTextBeforeChanges >= currentSelectionEnd) {
                            return;
                        }
                        else {
                            if (index === 0) {
                                newSelectionEnd = newSelectionEnd - textTillEndOfLine;
                            }
                            else {
                                let amountOfTextSinceLastLineBreak = 0;
                                if (index > 1) {
                                    amountOfTextSinceLastLineBreak =
                                        lineBreak - lineBreaks[index - 1];
                                }
                                else {
                                    amountOfTextSinceLastLineBreak =
                                        getLengthOfTextSinceLastLineBreak(diffs, i) + lineBreak;
                                }
                                newSelectionEnd =
                                    newSelectionEnd + amountOfTextSinceLastLineBreak;
                            }
                        }
                    }
                    currentColumnBeforeChanges = currentColumnBeforeChanges + 1;
                }
            });
            if (currentColumnBeforeChanges > columnOfSelectionStart)
                continue;
        }
        return new monaco.Selection(columnOfSelectionStart + changesInStartColumn, newSelectionStart, columnOfSelectionEnd + changesInEndColumn, newSelectionEnd);
    };
    const getLengthOfTextSinceLastLineBreak = (diffs, i) => {
        let amountOfTextSinceLastLineBreak = 0;
        for (let a = i - 1; a >= 0; a--) {
            const lineBreaks = getHowManyLineBreaksAreInString(diffs[a][1]);
            if (lineBreaks.length === 0) {
                amountOfTextSinceLastLineBreak =
                    amountOfTextSinceLastLineBreak + diffs[a][1].length;
            }
            else {
                amountOfTextSinceLastLineBreak =
                    amountOfTextSinceLastLineBreak +
                        (diffs[a][1].length - lineBreaks[lineBreaks.length - 1]) -
                        LENGTH_OF_LINE_BREAK;
                break;
            }
        }
        return amountOfTextSinceLastLineBreak;
    };
    const handleEditorChange = async (newCode) => {
        if (newCode === currentCode.current) {
            return;
        }
        if (preventSendingMessage.current === true) {
            preventSendingMessage.current = false;
            return;
        }
        if (newCode !== undefined) {
            const dmp = new diff_match_patch_1.default();
            const diff = dmp.diff_main(currentCode.current, newCode);
            currentCode.current = newCode;
            project.setFileContent(idOfFile, newCode);
            await updateFile.mutateAsync({
                fileId: idOfFile,
                change: diff,
                requestId,
            });
        }
    };
    (0, react_1.useEffect)(() => {
        if (typeof id === "string") {
        }
    }, [id]);
    (0, react_1.useEffect)(() => {
        var _a;
        if (project.selectedFile !== undefined) {
            currentCode.current = (_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.content;
        }
    }, [(_b = project.selectedFile) === null || _b === void 0 ? void 0 : _b.id]);
    const getHowManyLineBreaksAreInString = (text) => {
        const lineBreaks = text.match(/\r\n|\r|\n/g);
        //Determine the positions of line breaks
        const lineBreakPositions = [];
        let currentPosition = 0;
        if (lineBreaks) {
            lineBreaks.forEach((lineBreak) => {
                const position = text.indexOf(lineBreak, currentPosition);
                if (position !== -1) {
                    lineBreakPositions.push(position);
                    currentPosition = position + lineBreak.length;
                }
            });
        }
        return lineBreakPositions;
    };
    const change = () => {
        const a = editor.getModel();
        a.pushEditOperations([], [
            {
                text: "newText",
                range: {
                    endColumn: 1,
                    endLineNumber: 1,
                    startColumn: 1,
                    startLineNumber: 1,
                },
            },
        ], 
        // CHANGE THIS
        // () => null,
        () => null);
    };
    console.log(language);
    return (<div className="flex-1 overflow-hidden w-full">
      <react_2.Editor onMount={(e, a) => setMonacoAtStart(e, a)} className={`scrollbar min-h-full overflow-auto w-full`} language={language} theme="vs-dark" value={""} onChange={(e) => handleEditorChange(e)}/>
      <button onClick={() => change()}>as</button>
    </div>);
};
exports.default = CodeEditor;
