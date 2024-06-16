import { useState } from "react";
import { useContextMenu } from "~/contexts/useContextMenu";
import { useProject } from "~/pages/project/[id]";
import ExtensionIcon from "~/utilis/ExtensionIcon";

const TemporaryFile = ({ stackLevel }: { stackLevel: number }) => {
  const [name, setName] = useState("");

  const { createFileFunction } = useProject();
  const { closeAddingNewThing, fileContextMenu, folderContextMenu } =
    useContextMenu();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const idOfParentFolder =
        fileContextMenu?.folderId || folderContextMenu?.id || undefined;
      createFileFunction(name, idOfParentFolder);
      closeAddingNewThing();
    }
  };

  return (
    <div
      className={`flex items-center `}
      style={{ paddingLeft: `${stackLevel * 6}px` }}
    >
      <ExtensionIcon fileName={name} />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name..."
        autoFocus
        onKeyDown={(e) => handleKeyDown(e)}
        className="w-[100%] flex-1 bg-[#404142] p-1 text-white outline-none"
        onBlur={() => closeAddingNewThing()}
      />
    </div>
  );
};

export default TemporaryFile;
