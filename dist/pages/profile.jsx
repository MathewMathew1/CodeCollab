"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("next-auth/react");
const react_2 = require("react");
const Button_1 = __importDefault(require("../components/Button"));
const LoadingSpinner_1 = require("../components/LoadingSpinner");
const api_1 = require("../utils/api");
const ci_1 = require("react-icons/ci");
const md_1 = require("react-icons/md");
const ProjectPreview_1 = __importDefault(require("../components/ProjectPreview"));
const head_1 = __importDefault(require("next/head"));
const Profile = () => {
    var _a;
    const session = (0, react_1.useSession)();
    const user = (_a = session.data) === null || _a === void 0 ? void 0 : _a.user;
    const { data: userInfo, isLoading } = api_1.trpc.user.getUserInfo.useQuery();
    const [expandedDescriptions, setExpandedDescriptions] = (0, react_2.useState)([]);
    // Function to handle expanding/collapsing description
    const handleExpandDescription = (index) => {
        if (expandedDescriptions.includes(index)) {
            setExpandedDescriptions(expandedDescriptions.filter((item) => item !== index));
        }
        else {
            // If not expanded, add to the list
            setExpandedDescriptions([...expandedDescriptions, index]);
        }
    };
    const changeNameApi = api_1.trpc.user.changeName.useMutation({
        onSuccess: () => {
            location.reload();
        },
        onError: () => {
            console.error("ERROR");
        },
    });
    const [isEditing, setIsEditing] = (0, react_2.useState)(false);
    const [newUsername, setNewUsername] = (0, react_2.useState)("");
    const handleCancelClick = () => {
        setIsEditing(false);
        setNewUsername(""); // Clear the new username input
    };
    const handleInputChange = (e) => {
        setNewUsername(e.target.value);
    };
    (0, react_2.useEffect)(() => {
        //b.mutate()
        //changeNameApi.mutate({name: "newUsername"})
    }, []);
    if (isLoading)
        return <LoadingSpinner_1.LoadingSpinner />;
    if (!userInfo)
        return <div>Couldnt find user in database</div>;
    if (!user)
        return (<div>
        <Button_1.default>Login to View profile</Button_1.default>
      </div>);
    const currentUsername = userInfo.username ? userInfo.username : userInfo.name;
    const handleSaveClick = async () => {
        changeNameApi.mutate({ name: newUsername });
        setIsEditing(false);
    };
    const handleEditClick = () => {
        setNewUsername(currentUsername);
        setIsEditing(true);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSaveClick();
        }
        else if (e.key === "Escape") {
            handleCancelClick();
        }
    };
    return (<>
      <head_1.default>
        <title>CodeCollab profile</title>
        <meta name="description" content="This is Reddit clone by me"/>
      </head_1.default>
      <div className="mb-6 mt-6 flex h-[100%] w-full flex-1  justify-center overflow-hidden text-white">
        <div className="scrollbar flex h-full  w-full max-w-7xl flex-col items-center gap-2 overflow-auto rounded-lg bg-gray-800 px-4 py-6  shadow-md">
          <h2 className="mb-4 text-3xl sm:text-4xl">Profile:</h2>
          <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col sm:text-lg">
              {isEditing ? (<div className="mb-4 flex items-center gap-2">
                  <div className="flex-1 pr-3">
                    <input onKeyDown={(e) => handleKeyDown(e)} className="standard-input w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Enter your username" value={newUsername} onChange={(e) => handleInputChange(e)}/>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="tooltip">
                      <button className="scale-[1.3]">
                        <md_1.MdSaveAs className="cursor-pointer hover:text-gray-400" onClick={handleSaveClick}/>
                      </button>
                      <span className="tooltiptext">Save</span>
                    </div>
                    <div className="tooltip">
                      <button className="scale-[1.3]">
                        <md_1.MdCancel className="cursor-pointer hover:text-gray-400" onClick={handleCancelClick}/>
                      </button>
                      <span className="tooltiptext">Cancel</span>
                    </div>
                  </div>
                </div>) : (<div className="mb-4 flex items-center">
                  <div className="flex-1">
                    <span className="text-lg">Name: {currentUsername}</span>
                  </div>
                  <ci_1.CiEdit className="h-[2rem] w-[2rem] cursor-pointer rounded-full bg-gray-700 p-1 hover:bg-gray-600" color="white" onClick={handleEditClick}/>
                </div>)}
              <div className="mt-2">Username: {userInfo.name}</div>
              <div className="mt-2">Email: {userInfo.email}</div>
              <div className="mt-2">Id: {userInfo.id}</div>
            </div>
            <div className="flex flex-col sm:text-lg">
              <div className="scrollbar mt-4 max-h-[500px] overflow-auto">
                <h3 className="mb-2 text-xl">Your Projects:</h3>
                {userInfo.projects.map((project, index) => (<ProjectPreview_1.default key={`${index}-project`} project={project} index={index} handleExpandDescription={handleExpandDescription} expandedDescriptions={expandedDescriptions}/>))}
              </div>
              <div className="scrollbar mt-6 max-h-[500px] overflow-auto">
                <h3 className="mb-2 text-xl">
                  Permissions to Update Projects:
                </h3>
                {userInfo.projectPermissions.map((permission, index) => (<ProjectPreview_1.default key={`${index}-permission`} project={permission.project} index={index} handleExpandDescription={handleExpandDescription} expandedDescriptions={expandedDescriptions}/>))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button_1.default color="blue" onClick={() => void (0, react_1.signOut)({ callbackUrl: "" })}>
              Logout
            </Button_1.default>
          </div>
        </div>
      </div>
    </>);
};
exports.default = Profile;
