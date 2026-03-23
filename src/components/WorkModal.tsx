import { useEffect } from "react";
import { X, Building2, CheckCircle2 } from "lucide-react";
import type { WorkExperience } from "../data/work";

interface WorkModalProps {
  work: WorkExperience;
  onClose: () => void;
}

const WorkModal = ({ work, onClose }: WorkModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {work.project}
              </h3>
              <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {work.role}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
              <Building2 size={14} />
              <span>{work.company}</span>
              {work.clientCompany && (
                <>
                  <span className="text-gray-400 mx-1">×</span>
                  <span>{work.clientCompany}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Roles & Responsibilities
          </h4>
          <ul className="space-y-3">
            {work.responsibilities?.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2
                  size={17}
                  className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkModal;
