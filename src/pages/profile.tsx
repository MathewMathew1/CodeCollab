import { signOut, useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import Button from "~/components/Button";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { trpc } from "~/utils/api";
import { CiEdit } from "react-icons/ci";
import { MdCancel, MdSaveAs } from "react-icons/md";
import ProjectPreview from "~/components/ProjectPreview";
import Head from "next/head";

const Profile = () => {
  const session = useSession();
  const user = session.data?.user;

  const { data: userInfo, isLoading } = trpc.user.getUserInfo.useQuery();
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>(
    [],
  );

  // Function to handle expanding/collapsing description
  const handleExpandDescription = (index: number) => {
    if (expandedDescriptions.includes(index)) {
      setExpandedDescriptions(
        expandedDescriptions.filter((item) => item !== index),
      );
    } else {
      // If not expanded, add to the list
      setExpandedDescriptions([...expandedDescriptions, index]);
    }
  };

  const changeNameApi = trpc.user.changeName.useMutation({
    onSuccess: () => {
      location.reload();
    },
    onError: () => {
      console.error("ERROR");
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewUsername(""); // Clear the new username input
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  useEffect(() => {
    //b.mutate()
    //changeNameApi.mutate({name: "newUsername"})
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (!userInfo) return <div>Couldnt find user in database</div>;
  if (!user)
    return (
      <div>
        <Button>Login to View profile</Button>
      </div>
    );

  const currentUsername = userInfo.username ? userInfo.username : userInfo.name;

  const handleSaveClick = async () => {
    changeNameApi.mutate({ name: newUsername });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setNewUsername(currentUsername);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveClick();
    } else if (e.key === "Escape") {
      handleCancelClick();
    }
  };

  return (
    <>
      <Head>
        <title>CodeCollab profile</title>
        <meta name="description" content="This is Reddit clone by me" />
      </Head>
      <div className="mb-6 mt-6 flex h-[100%] w-full flex-1  justify-center overflow-hidden text-white">
        <div className="scrollbar flex h-full  w-full max-w-7xl flex-col items-center gap-2 overflow-auto rounded-lg bg-gray-800 px-4 py-6  shadow-md">
          <h2 className="mb-4 text-3xl sm:text-4xl">Profile:</h2>
          <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col sm:text-lg">
              {isEditing ? (
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex-1 pr-3">
                    <input
                      onKeyDown={(e) => handleKeyDown(e)}
                      className="standard-input w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      placeholder="Enter your username"
                      value={newUsername}
                      onChange={(e) => handleInputChange(e)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="tooltip">
                      <button className="scale-[1.3]">
                        <MdSaveAs
                          className="cursor-pointer hover:text-gray-400"
                          onClick={handleSaveClick}
                        />
                      </button>
                      <span className="tooltiptext">Save</span>
                    </div>
                    <div className="tooltip">
                      <button className="scale-[1.3]">
                        <MdCancel
                          className="cursor-pointer hover:text-gray-400"
                          onClick={handleCancelClick}
                        />
                      </button>
                      <span className="tooltiptext">Cancel</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-center">
                  <div className="flex-1">
                    <span className="text-lg">Name: {currentUsername}</span>
                  </div>
                  <CiEdit
                    className="h-[2rem] w-[2rem] cursor-pointer rounded-full bg-gray-700 p-1 hover:bg-gray-600"
                    color="white"
                    onClick={handleEditClick}
                  />
                </div>
              )}
              <div className="mt-2">Username: {userInfo!.name}</div>
              <div className="mt-2">Email: {userInfo.email}</div>
              <div className="mt-2">Id: {userInfo.id}</div>
            </div>
            <div className="flex flex-col sm:text-lg">
              <div className="scrollbar mt-4 max-h-[500px] overflow-auto">
                <h3 className="mb-2 text-xl">Your Projects:</h3>
                {userInfo.projects.map((project, index) => (
                  <ProjectPreview
                    key={`${index}-project`}
                    project={project}
                    index={index}
                    handleExpandDescription={handleExpandDescription}
                    expandedDescriptions={expandedDescriptions}
                  />
                ))}
              </div>
              <div className="scrollbar mt-6 max-h-[500px] overflow-auto">
                <h3 className="mb-2 text-xl">
                  Permissions to Update Projects:
                </h3>
                {userInfo.projectPermissions.map((permission, index) => (
                  <ProjectPreview
                    key={`${index}-permission`}
                    project={permission.project}
                    index={index}
                    handleExpandDescription={handleExpandDescription}
                    expandedDescriptions={expandedDescriptions}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              color="blue"
              onClick={() => void signOut({ callbackUrl: "" })}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
