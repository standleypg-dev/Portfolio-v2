import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import GitHubIcon from "./icons/GitHub";
import LinkedInIcon from "./icons/LinkedInIcon";
import { scrollToSection } from "../utils/scroll";

const Hero3D = lazy(() => import("./Hero3D"));
const RoverStrip = lazy(() => import("./rover/RoverStrip"));

const Hero = () => {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-white dark:bg-gray-900"
    >
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>
      <Suspense fallback={null}>
        <RoverStrip />
      </Suspense>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center py-28 text-center">
          <img
            src={personalInfo.avatar}
            alt=""
            width={112}
            height={112}
            fetchPriority="high"
            className="h-28 w-28 rounded-full object-cover ring-1 ring-gray-900/10 dark:ring-white/15"
          />

          <h1 className="mt-8 max-w-3xl text-balance font-display text-[clamp(2.5rem,1.2rem+5vw,4.5rem)] font-semibold leading-[1.06] tracking-tight text-gray-900 dark:text-white">
            I build software that{" "}
            <em className="text-blue-600 dark:text-blue-400">
              carries real load
            </em>
            .
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
            Associate Tech Lead at 99x, building a financial reconciliation
            platform that processes billions of transaction records a year.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <a
              href="#projects"
              onClick={(e) => handleNavClick(e, "#projects")}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              View my work
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="flex items-center gap-1.5 font-medium text-gray-900 transition-colors duration-200 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              Get in touch <ArrowRight size={16} aria-hidden="true" />
            </a>

            <div
              role="group"
              aria-label="Social profiles"
              className="flex items-center gap-5"
            >
              {personalInfo.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 transition-colors duration-200 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label={`${social.platform} profile`}
                >
                  {social.platform === "GitHub" && <GitHubIcon size={22} />}
                  {social.platform === "LinkedIn" && (
                    <LinkedInIcon size={22} />
                  )}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
            {personalInfo.name} | {personalInfo.title} | {personalInfo.location}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
