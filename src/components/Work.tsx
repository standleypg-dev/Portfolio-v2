import { useState } from "react";
import { ExternalLink, Building2, ClipboardList } from "lucide-react";
import { workExperience } from "../data/work";
import type { WorkExperience } from "../data/work";
import WorkModal from "./WorkModal";

const MAX_DESC_LENGTH = 200;

const Work = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedWork, setSelectedWork] = useState<WorkExperience | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <section id="work" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Work Experience
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Here's a look at some of the professional projects I've worked on.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workExperience.map((work, index) => (
              <div
                key={`${work.project}-${index}`}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={work.imageUrl}
                    alt={work.project}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {work.project}
                    </h3>
                    <span className="ml-2 flex-shrink-0 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {work.role}
                    </span>
                  </div>

                  <div className="flex items-center mb-4">
                    <Building2
                      size={18}
                      className="text-blue-600 dark:text-blue-400 mr-2"
                    />
                    <a
                      href={work.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {work.company}
                    </a>
                    {work.clientCompany && (
                      <>
                        <span className="mx-2 text-gray-500 dark:text-gray-400">
                          ×
                        </span>
                        <a
                          href={work.clientCompanyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {work.clientCompany}
                        </a>
                      </>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {expandedIndex === index || work.description.length <= MAX_DESC_LENGTH
                      ? work.description
                      : `${work.description.slice(0, MAX_DESC_LENGTH)}...`}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {work.description.length > MAX_DESC_LENGTH && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 text-sm"
                        >
                          {expandedIndex === index ? "Read Less" : "Read More"}
                        </button>
                      )}
                      {work.responsibilities && (
                        <button
                          onClick={() => setSelectedWork(work)}
                          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <ClipboardList size={15} />
                          <span>Responsibilities</span>
                        </button>
                      )}
                    </div>

                    {work.projectLink && (
                      <a
                        href={work.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 ml-auto"
                      >
                        <ExternalLink size={18} className="mr-1" />
                        <span>Visit</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedWork && (
        <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
    </>
  );
};

export default Work;
