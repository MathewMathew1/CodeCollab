"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Button_1 = __importDefault(require("../../components/Button"));
const ErrorComponent_1 = __importDefault(require("../../components/ErrorComponent"));
const validators_1 = require("../../utilis/validators");
const api_1 = require("../../utils/api");
const router_1 = require("next/router");
const useToast_1 = require("../../contexts/useToast");
const Toast_1 = require("../../types/Toast");
const ProjectCreator = () => {
    const [title, setTitle] = (0, react_1.useState)("");
    const [description, setDescription] = (0, react_1.useState)("");
    const [privacy, setPrivacy] = (0, react_1.useState)('public');
    const [errors, setErrors] = (0, react_1.useState)({});
    const updateToast = (0, useToast_1.useUpdateToast)();
    const router = (0, router_1.useRouter)();
    const createProject = api_1.trpc.project.create.useMutation({
        onSuccess: (response) => {
            router.push(`/project/${response.project.id}`);
        },
        onError: (error) => {
            updateToast.addToast({ toastText: "Unexpected error occurred try again.", severity: Toast_1.severityColors.error });
        }
    });
    const handleChange = (e) => {
        setPrivacy(e.target.value);
    };
    const validateForm = () => {
        const newErrors = {};
        const titleError = (0, validators_1.stringLengthValidator)('Title', title, 1, 320);
        if (titleError)
            newErrors.title = titleError;
        const descriptionError = (0, validators_1.stringLengthValidator)('Description', description, 1, 320);
        if (descriptionError)
            newErrors.description = descriptionError;
        // Add more validation rules for other fields as needed
        return newErrors;
    };
    const onCreateProject = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length !== 0) {
            return;
        }
        createProject.mutate({ title, description, isPrivate: privacy !== "public" });
    };
    return <div className="flex w-full font-bold h-full flex-1">
    <div className="opacity-70 ml-auto mr-auto bg-gray-800 flex flex-col gap-5 pt-4 w-full  sm:w-[90%] shadow-md rounded-lg p-4">
      <h3 className="text-3xl text-center font-serif font-bold text-white">Create new project:</h3>
      <form className="flex justify-center flex-col items-center gap-5 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-2 items-center w-full">
          <label className="text-center text-white">Title of project:</label>
          <div className="w-full flex gap-3 flex-col items-center">
            <input className={`max-w-md w-full border-gray-300 bg-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
            {errors.title && <ErrorComponent_1.default error={errors.title}/>}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center w-full">
          <label className="text-center text-white">Description of Project:</label>
          <div className="w-full flex gap-3 flex-col items-center">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="max-w-md w-full resize-none p-2 bg-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description of project" rows={6}></textarea>
            {errors.description && <ErrorComponent_1.default error={errors.description}/>}
          </div>
        </div>
        <div className="flex flex-col space-x-2 w-full">
          <div className="flex flex-col justify-center">
            <div className="flex justify-start">
              <label htmlFor="public" className="flex items-center cursor-pointer gap-2 text-white">
                <input type="radio" id="public" name="privacy" value="public" checked={privacy === 'public'} onChange={handleChange} className="rounded-full border border-blue-500 bg-gray-700 w-4 h-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <span>Public</span>
              </label>
            </div>
            <div className="flex justify-start">
              <label htmlFor="private" className="flex items-center cursor-pointer gap-2 text-white">
                <input type="radio" id="private" name="privacy" value="private" checked={privacy === 'private'} onChange={handleChange} className="rounded-full border border-red-500 bg-gray-700 w-4 h-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end w-full">
          <Button_1.default onClick={(e) => onCreateProject(e)} className="w-40" color="blue">Create</Button_1.default>
        </div>
      </form>
    </div>
  </div>;
};
exports.default = ProjectCreator;
