import { trpc } from "~/utils/api";
import { useState } from "react";
import { useProject } from "~/pages/project/[id]";

const ProjectSettings = ({ visibility }: { visibility: boolean }) => {
  const project = useProject();

  return (
    <div
      className={`mx-auto h-full w-full max-w-lg rounded-lg bg-gray-800 p-6 text-white shadow-md ${visibility ? "" : "hidden"}`}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Project Information</h2>
      </div>
      <div>
        <p>
          <strong>Project Name:</strong> {project.projectInfo.name}
        </p>
        <p>
          <strong>Description:</strong> {project.projectInfo.description}
        </p>
        <p>
          <strong>Privacy:</strong>{" "}
          {project.projectInfo.isPrivate ? "Private" : "Public"}
        </p>
      </div>
    </div>
  );
};

export default ProjectSettings;
