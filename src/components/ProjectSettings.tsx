import { trpc } from "../utils/api";
import { useState } from "react";
import { useProject } from "../pages/project/[id]";
import { useToast, useUpdateToast } from "../contexts/useToast";
import { severityColors } from "../types/Toast";

const ProjectInfo = ({ visibility }: { visibility: boolean }) => {
  const project = useProject();
  const updateToast = useUpdateToast();

  const updateProperties = trpc.project.updateProperties.useMutation();
  const invite = trpc.project.addPermission.useMutation({
    onError(err) {
      updateToast.addToast({
        toastText: "Error adding permission",
        severity: severityColors.error,
      });
      console.error("Invite error:", err);
    },
    onSuccess(data) {
      if(data?.error){
        updateToast.addToast({
          toastText: "Error adding permission",
          severity: severityColors.error,
        });
        return
      }
      updateToast.addToast({
        toastText: "Successfully added permission",
        severity: severityColors.success,
      });
    },
  });


  const removeInvite = trpc.project.removePermission.useMutation({
    onError(err) {
      updateToast.addToast({
        toastText: "Error removing permission",
        severity: severityColors.error,
      });
      console.error("Invite error:", err);
    },
    onSuccess(data) {
      if(data?.error){
        updateToast.addToast({
          toastText: "Error removing permission",
          severity: severityColors.error,
        });
        return
      }
      updateToast.addToast({
        toastText: "Successfully removed permission",
        severity: severityColors.success,
      });
    },
  });

  

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProject, setUpdatedProject] = useState(project.projectInfo);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = async () => {
    await updateProperties.mutateAsync({
      newDescription: updatedProject.description!,
      newTitle: updatedProject.name,
      isPrivate: updatedProject.isPrivate,
      projectId: parseInt(project.idOfProject),
    });
    setIsEditing(false);
  };

  const handleInvite = async () => {
    await invite.mutateAsync({
      projectId: parseInt(project.idOfProject),
      userId: inviteEmail,
    });
    setInviteEmail("");
  };

  const removePermission = async (userId: string) => {
    await removeInvite.mutateAsync({
      projectId: parseInt(project.idOfProject),
      userId: userId,
    });
  };

  return (
    <div
      className={`mx-auto h-full w-full max-w-lg overflow-auto rounded-lg bg-gray-800 p-6 text-white shadow-md ${visibility ? "" : "hidden"}`}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Project Information</h2>
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium">Project Name</label>
            <input
              type="text"
              name="name"
              value={updatedProject.name}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input
              type="text"
              name="description"
              value={updatedProject.description || ""}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPrivate"
              checked={updatedProject.isPrivate}
              onChange={() =>
                setUpdatedProject((prev) => ({
                  ...prev,
                  isPrivate: !prev.isPrivate,
                }))
              }
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm">Private Project</label>
          </div>
          <button
            onClick={handleUpdateClick}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      ) : (
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
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Invite Users</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter user id"
            className="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleInvite}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Invite
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Project Permissions</h3>
        <div className="mt-2 space-y-4">
          {project.projectPermissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-center gap-4 rounded-md bg-gray-700 p-3"
            >
              <img
                src={permission.user.image || "/default-avatar.png"}
                alt={permission.user.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-semibold">{permission.user.name}</p>
                <p className="text-sm text-gray-400">{permission.user.email}</p>
              </div>
              <button
                onClick={() => removePermission(permission.userId)}
                className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
