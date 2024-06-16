import { BiErrorCircle } from "react-icons/bi";

const ErrorComponent = ({ error }: { error: string }) => {
  return (
    <div
      className="flex items-center gap-2 rounded
        border border-red-400 bg-red-100 px-4 py-3 text-red-700"
      role="alert"
    >
      <BiErrorCircle className="bg-red" />
      <span className="block flex-1 sm:inline">{error}</span>
    </div>
  );
};

export default ErrorComponent;
