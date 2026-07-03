import { ExternalLink, Lock } from "lucide-react";
import { projects } from "../data/projects";
import GitHubIcon from "./icons/GitHub";
import ProjectImageCarousel from "./ProjectImageCarousel";
import SectionHeading from "./SectionHeading";

const CASE_STUDY_FIELDS = [
  { label: "Problem", key: "problem" },
  { label: "What I built", key: "built" },
  { label: "Outcome", key: "outcome" },
] as const;

const Projects = () => {
  const featured = projects.filter((p) => p.images && p.images.length > 0);
  const more = projects.filter((p) => !p.images || p.images.length === 0);

  return (
    <section id="projects" className="bg-gray-50 py-24 dark:bg-gray-950 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Projects"
            title="Built to solve my own problems."
            lead="Personal projects. Each one started as a real itch at home and ended up running in production on my own hardware."
          />

          <div className="space-y-20 sm:space-y-24">
            {featured.map((project, index) => (
              <article
                key={project.project}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
              >
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <ProjectImageCarousel
                    images={project.images!}
                    alt={project.project}
                  />
                </div>

                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {project.project}
                  </h3>

                  <dl className="mt-6 space-y-5">
                    {CASE_STUDY_FIELDS.map(({ label, key }) => (
                      <div key={key}>
                        <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-500">
                          {label}
                        </dt>
                        <dd className="mt-1.5 leading-relaxed text-gray-600 dark:text-gray-400">
                          {project[key]}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                    {project.technologies.join(", ")}
                  </p>

                  <div className="mt-6 flex items-center gap-6">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <GitHubIcon size={18} />
                        <span>Code</span>
                      </a>
                    ) : project.isPrivate ? (
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Lock size={16} />
                        <span>Private repo</span>
                      </span>
                    ) : null}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink size={16} />
                        <span>Live demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {more.length > 0 && (
            <div className="mt-20 sm:mt-24">
              <h3 className="font-display text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                More on GitHub
              </h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {more.map((project) => (
                  <a
                    key={project.project}
                    href={project.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-gray-200 bg-white p-6 transition-colors duration-200 hover:border-blue-500/60 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-400/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {project.project}
                      </h4>
                      <GitHubIcon
                        size={18}
                        className="shrink-0 text-gray-400 transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {project.shortDescription}
                    </p>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                      {project.technologies.join(", ")}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
