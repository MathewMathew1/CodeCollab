import { AiFillProject } from "react-icons/ai";
import Link from "next/link";

const ProjectPreview = ({
  project,
  expandedDescriptions,
  index,
  handleExpandDescription,
}: {
  project: {
    id: number;
    name: string;
    description: string | null;
    isPrivate: boolean;
    authorId: string;
  };
  expandedDescriptions: number[];
  index: number;
  handleExpandDescription: (index: number) => void;
}) => {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="rounded-full bg-gray-700 p-2">
        <AiFillProject />
      </div>
      <div className="flex-1">
        <Link href={`/project/${project.id}`}>
            <div className="text-lg">{project.name}</div>
        </Link>
        <div
          className={`text-sm text-gray-400 ${expandedDescriptions.includes(project.id) ? "" : "line-clamp-2"}`}
        >
          {project.description}
        </div>
        <div className="text-sm text-gray-400">
          {project.isPrivate ? "Private" : "Public"}
        </div>
      </div>
      {project.description!.length > 100 && (
        <button
          className="text-gray-400 hover:text-gray-200"
          onClick={() => handleExpandDescription(project.id)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ProjectPreview;
