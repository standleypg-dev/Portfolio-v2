import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import GitHubIcon from "./icons/GitHub";
import LinkedInIcon from "./icons/LinkedInIcon";
import { scrollToSection } from "../utils/scroll";

// three.js is by far the heaviest dependency; keep it out of the main bundle
// so the page becomes interactive before the starfield loads.
const Hero3D = lazy(() => import("./Hero3D"));

const Hero = () => {
  const years =
    new Date().getFullYear() -
    personalInfo.professionalStartYear.getFullYear();

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
      className="relative flex min-h-svh items-center overflow-hidden bg-white dark:bg-gray-900"
    >
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>

      {/* Soft scrim behind the text block so stars never fight the words */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_55%_at_42%_48%,rgb(255_255_255/0.8),rgb(255_255_255/0.35)_55%,transparent_75%)] dark:bg-[radial-gradient(ellipse_62%_55%_at_42%_48%,rgb(17_24_39/0.85),rgb(17_24_39/0.4)_55%,transparent_75%)]"
      />

      {/* Quiet accent glow layered over the starfield */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 right-[-12%] h-[36rem] w-[36rem] rounded-full bg-blue-500/[0.07] blur-3xl dark:bg-blue-400/[0.08]"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl py-28 sm:py-32">
          <div className="mb-10 flex items-center gap-4">
            <img
              src={personalInfo.avatar}
              alt=""
              width={56}
              height={56}
              fetchPriority="high"
              className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-900/10 dark:ring-white/15"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {personalInfo.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {personalInfo.title}, {personalInfo.location}
              </p>
            </div>
          </div>

          <h1 className="font-display text-balance text-[clamp(2.5rem,1.2rem+5vw,4.5rem)] font-semibold leading-[1.06] tracking-tight text-gray-900 dark:text-white">
            I build software that{" "}
            <em className="text-blue-600 dark:text-blue-400">
              carries real load
            </em>
            .
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
            {years} years across .NET, React, and Azure. Currently an
            Associate Tech Lead at 99x, building a financial reconciliation
            platform that processes billions of transaction records a year.
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href="#projects"
              onClick={(e) => handleNavClick(e, "#projects")}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              View my work
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="flex items-center gap-1.5 font-medium text-gray-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              Get in touch <ArrowRight size={16} aria-hidden="true" />
            </a>

            <div className="flex items-center gap-5">
              {personalInfo.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label={`${social.platform} Profile`}
                >
                  {social.platform === "GitHub" && <GitHubIcon size={22} />}
                  {social.platform === "LinkedIn" && (
                    <LinkedInIcon size={22} />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
