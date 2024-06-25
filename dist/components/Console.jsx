"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../utils/api");
const Button_1 = __importDefault(require("./Button"));
const react_1 = require("react");
const _id_1 = require("../pages/project/[id]");
const fa_1 = require("react-icons/fa");
const Console = ({ visibility }) => {
    const [consoleText, setConsoleText] = (0, react_1.useState)("");
    const [runningCode, setRunningCode] = (0, react_1.useState)(false);
    const [infoVisible, setInfoVisible] = (0, react_1.useState)(false);
    const project = (0, _id_1.useProject)();
    const runCode = api_1.trpc.project.runCode.useMutation({
        onSuccess: (data) => {
            setRunningCode(false);
            if (!data)
                return;
            const parsedText = parseAnsiEscapeCodes(data);
            setConsoleText(parsedText);
        },
        onError: (err) => {
            setRunningCode(false);
            setConsoleText("Some unexpected error occurred, try again");
            console.log(err);
        }
    });
    function parseAnsiEscapeCodes(input) {
        const ansiEscapeRegex = /\u001B\[[0-9;]*m/g;
        const html = input
            .replace(/\n/g, "<br />")
            .replace(ansiEscapeRegex, (match) => {
            var _a;
            const colorMap = {
                "30": "black",
                "31": "red",
                "32": "green",
                "33": "yellow",
                "34": "blue",
                "35": "magenta",
                "36": "cyan",
                "37": "white",
            };
            const colorCode = ((_a = match === null || match === void 0 ? void 0 : match.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || "37";
            const color = colorMap[colorCode] || "inherit";
            return `<span style="color: ${color};">`;
        });
        return html.replace(/\u001B\[0m/g, "</span>");
    }
    const runCodeFunction = () => {
        var _a;
        if (runningCode) {
            return;
        }
        setRunningCode(true);
        runCode.mutate({
            idOfFileToRun: ((_a = project.selectedFile) === null || _a === void 0 ? void 0 : _a.id) || 1,
            projectId: parseInt(project.idOfProject),
        });
    };
    return (<div className={`mr-[30px] flex h-full flex-col gap-4 pb-5  ${visibility ? "" : "hidden"}`}>
      <div className="flex items-center">
        <button className="text-gray-400 hover:text-gray-200" onClick={() => setInfoVisible(!infoVisible)}>
          <fa_1.FaQuestionCircle size={24}/>
        </button>
        {infoVisible && (<div className="ml-2 bg-gray-800 text-gray-300 p-3 rounded-md">
            <p className="text-sm">
              Note: Currently selected file will be run.
            </p>
          </div>)}
      </div>
      <div>
        <Button_1.default className="w-full" color="default" onClick={() => runCodeFunction()}>
          Run
        </Button_1.default>
      </div>
      <div dangerouslySetInnerHTML={{ __html: runningCode ? "Code is being run" : consoleText }} className="min-h-[300px] min-w-[300px] flex-1 overflow-auto bg-black p-4 text-white"></div>
    </div>);
};
exports.default = Console;
