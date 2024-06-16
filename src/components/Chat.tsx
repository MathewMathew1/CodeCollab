import { trpc } from "~/utils/api";
import Button from "./Button";
import { useEffect, useState } from "react";
import { useProject } from "~/pages/project/[id]";
import useArray from "~/hooks/useArray";
import { FaQuestionCircle } from 'react-icons/fa';

type ChatMessage = {
  message: string;
  username: string;
};

const Chat = ({visibility, setUnreadChatMessages}:{visibility: boolean, setUnreadChatMessages: React.Dispatch<React.SetStateAction<number>>}) => {
  const [text, setText] = useState("");
  const [infoVisible, setInfoVisible] = useState(false);
  const chatMessages = useArray<ChatMessage>([]);

  const project = useProject();

  const chat = trpc.project.chat.useMutation({
    onError: (error) => {
      console.log(error);
    },
  });

  trpc.project.onChat.useSubscription(
    { channelId: parseInt(project.idOfProject) },
    {
      onData({ text, username }) {
        chatMessages.push({ message: text, username });
        if(!visibility){
          setUnreadChatMessages(prevState => {
            return prevState + 1
         })
        }
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    },
  );

  useEffect(() => {
    if(visibility){
      setUnreadChatMessages(0)
    }
  }, [visibility]);

  const sendChatMessage = () => {
    if(text.length === 0){
      return
    }
    setText("")
    chat.mutate({ text: text, projectId: parseInt(project.idOfProject) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault()
      sendChatMessage()
    }
  }

  return (
    <div className={`${visibility ? "" : "hidden"} w-full flex flex-col gap-3 h-full mb-4`}>
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
              Note: Chat messages are not stored in a database. The messages you see are those sent during your current session.
            </p>
          </div>
        )}
      </div>
      <textarea
        className="resize-none w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        cols={3}
        rows={3}
        value={text}
        onKeyDown={(e) => handleKeyDown(e)}
        placeholder={"Write message"}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <div>
        <Button
          className="w-full"
          color="green"
          onClick={() => sendChatMessage()}
        >
          Send
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-auto bg-slate-900 pb-[20px]">
        <div className="glass p-5 w-full">Messages: </div>
        <div className="mb-4 flex flex-col overflow-auto space-y-3">
          {chatMessages.array.map((message, index) => (
            <div
              className="border-2 border-gray-100 bg-slate-700 p-3 rounded"
              key={`${index} message`}
            >
              <div>Send by: {message.username}</div>
              <div>{message.message}</div>
            </div>
          ))}
          {/* Extra div to create space at the bottom */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
