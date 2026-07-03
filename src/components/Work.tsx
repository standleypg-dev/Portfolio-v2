import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { workExperience } from "../data/work";
import type { WorkExperience } from "../data/work";
import WorkModal from "./WorkModal";
import SectionHeading from "./SectionHeading";

const Work = () => {
  const [selectedWork, setSelectedWork] = useState<WorkExperience | null>(null);

  return (
    <>
      <section id="work" className="bg-white py-24 dark:bg-gray-900 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              eyebrow="Experience"
              title="Production systems I've carried."
              lead="From financial platforms moving billions of records to IoT pipelines on factory floors and Raspberry Pis in rural schools."
            />

            <ol className="relative space-y-14 border-l border-gray-200 pl-8 dark:border-gray-800 sm:space-y-16">
              {workExperience.map((work) => (
                <li key={work.project} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[37px] top-2 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:bg-blue-400 dark:ring-gray-900"
                  />

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                      {work.project}
                    </h3>
                    {work.projectLink && (
                      <a
                        href={work.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${work.project}`}
                        className="text-gray-400 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {work.role} at{" "}
                    <a
                      href={work.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      {work.company}
                    </a>
                    {work.clientCompany && (
                      <>
                        {" "}
                        for{" "}
                        <a
                          href={work.clientCompanyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          {work.clientCompany}
                        </a>
                      </>
                    )}
                  </p>

                  <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
                    {work.description}
                  </p>

                  {work.highlights && (
                    <ul className="mt-4 space-y-2">
                      {work.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 leading-relaxed text-gray-700 dark:text-gray-300"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}

                  {work.responsibilities && (
                    <button
                      onClick={() => setSelectedWork(work)}
                      className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      All responsibilities{" "}
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ol>
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
