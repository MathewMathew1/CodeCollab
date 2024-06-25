import { trpc } from "../utils/api";
import Button from "./Button";
import { useState } from "react";
import { useProject } from "../pages/project/[id]";
import { FaQuestionCircle } from "react-icons/fa";

const Console = ({visibility}:{visibility: boolean}) => {
  const [consoleText, setConsoleText] = useState("");
  const [runningCode, setRunningCode] = useState(false)
  const [infoVisible, setInfoVisible] = useState(false);

  const project = useProject();

  const runCode = trpc.project.runCode.useMutation({
    onSuccess: (data) => {
      setRunningCode(false)
      if (!data) return;
      const parsedText = parseAnsiEscapeCodes(data);
      setConsoleText(parsedText);
    },
    onError: (err) => {
      setRunningCode(false)
      setConsoleText("Some unexpected error occurred, try again")
      console.log(err)
    }
  });

  function parseAnsiEscapeCodes(input: string) {
    const ansiEscapeRegex = /\u001B\[[0-9;]*m/g;

    const html = input
      .replace(/\n/g, "<br />")
      .replace(ansiEscapeRegex, (match) => {
        const colorMap: { [key: string]: string } = {
          "30": "black",
          "31": "red",
          "32": "green",
          "33": "yellow",
          "34": "blue",
          "35": "magenta",
          "36": "cyan",
          "37": "white",
        };

        const colorCode = match?.match(/\d+/)?.[0] || "37";

        const color: string = colorMap[colorCode] || "inherit";

        return `<span style="color: ${color};">`;
      });

    return html.replace(/\u001B\[0m/g, "</span>");
  }

  const runCodeFunction = () => {
    if(runningCode){
      return
    }
    setRunningCode(true)
    runCode.mutate({
      idOfFileToRun: project.selectedFile?.id || 1,
      projectId: parseInt(project.idOfProject),
    });
  };

  return (
    <div className={`mr-[30px] flex h-full flex-col gap-4 pb-5  ${visibility? "": "hidden"}`}>
      <div className="flex items-center">
        <button 
          className="text-gray-400 hover:text-gray-200" 
          onClick={() => setInfoVisible(!infoVisible)}
        >
          <FaQuestionCircle size={24} />
        </button>
        {infoVisible && (
          <div className="ml-2 bg-gray-800 text-gray-300 p-3 rounded-md">
            <p className="text-sm">
              Note: Currently selected file will be run.
            </p>
          </div>
        )}
      </div>
      <div>
        <Button
          className="w-full"
          color="default"
          onClick={() => runCodeFunction()}
        >
          Run
        </Button>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: runningCode ? "Code is being run": consoleText }}
        className="min-h-[300px] min-w-[300px] flex-1 overflow-auto bg-black p-4 text-white"
      ></div>
    </div>
  );
};

export default Console;
