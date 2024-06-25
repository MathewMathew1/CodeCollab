"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../utils/api");
const Button_1 = __importDefault(require("./Button"));
const react_1 = require("react");
const _id_1 = require("../pages/project/[id]");
const useArray_1 = __importDefault(require("../hooks/useArray"));
const fa_1 = require("react-icons/fa");
const Chat = ({ visibility, setUnreadChatMessages }) => {
    const [text, setText] = (0, react_1.useState)("");
    const [infoVisible, setInfoVisible] = (0, react_1.useState)(false);
    const chatMessages = (0, useArray_1.default)([]);
    const project = (0, _id_1.useProject)();
    const chat = api_1.trpc.project.chat.useMutation({
        onError: (error) => {
            console.log(error);
        },
    });
    api_1.trpc.project.onChat.useSubscription({ channelId: parseInt(project.idOfProject) }, {
        onData({ text, username }) {
            chatMessages.push({ message: text, username });
            if (!visibility) {
                setUnreadChatMessages(prevState => {
                    return prevState + 1;
                });
            }
        },
        onError(err) {
            console.error("Subscription error:", err);
        },
    });
    (0, react_1.useEffect)(() => {
        if (visibility) {
            setUnreadChatMessages(0);
        }
    }, [visibility]);
    const sendChatMessage = () => {
        if (text.length === 0) {
            return;
        }
        setText("");
        chat.mutate({ text: text, projectId: parseInt(project.idOfProject) });
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };
    return (<div className={`${visibility ? "" : "hidden"} w-full flex flex-col gap-3 h-full mb-4`}>
      <div className="flex items-center">
        <button className="text-gray-400 hover:text-gray-200" onClick={() => setInfoVisible(!infoVisible)}>
          <fa_1.FaQuestionCircle size={24}/>
        </button>
        {infoVisible && (<div className="ml-2 bg-gray-800 text-gray-300 p-3 rounded-md">
            <p className="text-sm">
              Note: Chat messages are not stored in a database. The messages you see are those sent during your current session.
            </p>
          </div>)}
      </div>
      <textarea className="resize-none w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" cols={3} rows={3} value={text} onKeyDown={(e) => handleKeyDown(e)} placeholder={"Write message"} onChange={(e) => setText(e.target.value)}></textarea>
      <div>
        <Button_1.default className="w-full" color="green" onClick={() => sendChatMessage()}>
          Send
        </Button_1.default>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-auto bg-slate-900 pb-[20px]">
        <div className="glass p-5 w-full">Messages: </div>
        <div className="mb-4 flex flex-col overflow-auto space-y-3">
          {chatMessages.array.map((message, index) => (<div className="border-2 border-gray-100 bg-slate-700 p-3 rounded" key={`${index} message`}>
              <div>Send by: {message.username}</div>
              <div>{message.message}</div>
            </div>))}
          {/* Extra div to create space at the bottom */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>);
};
exports.default = Chat;
