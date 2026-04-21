import { useState, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import GitHubIcon from "./icons/GitHub";
import LinkedInIcon from "./icons/LinkedInIcon";

const Hero = () => {
  const [typedText, setTypedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const text = personalInfo.roles[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(text.substring(0, typedText.length + 1));
        setTypingSpeed(100);

        if (typedText.length === text.length) {
          setIsDeleting(true);
          setTypingSpeed(1000);
        }
      } else {
        setTypedText(text.substring(0, typedText.length - 1));
        setTypingSpeed(50);

        if (typedText.length === 0) {
          setIsDeleting(false);
          setCurrentTextIndex(
            (currentTextIndex + 1) % personalInfo.roles.length,
          );
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, currentTextIndex, isDeleting, typingSpeed]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative"
      style={{ zIndex: 1 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl mb-6 sm:mb-8">
            <img
              src={personalInfo.avatar}
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-3 sm:mb-4">
            Hello, I'm{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {personalInfo.name}
            </span>
          </h1>

          <div className="h-8 md:h-10 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-700 dark:text-gray-300">
              {typedText}
              <span className="animate-blink">|</span>
            </h2>
          </div>

          <p className="max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">
            I enjoy seeking out creative solutions to complex problems and
            building things that empower others to do the same.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Get in Touch
            </a>
            <a
              href="#projects"
              onClick={(e) => handleNavClick(e, "#projects")}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              View Projects
            </a>
          </div>

          <div className="flex space-x-6 mb-8 sm:mb-12">
            {personalInfo.socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300"
                aria-label={`${social.platform} Profile`}
              >
                {social.platform === "GitHub" && <GitHubIcon size={24} />}
                {social.platform === "LinkedIn" && <LinkedInIcon size={24} />}
                {social.platform === "Resume" && <FileText size={24} />}
              </a>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          document
            .querySelector("#about")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gray-500 dark:text-gray-400"
        aria-label="Scroll to about section"
      >
        <ChevronDown size={36} />
      </button>
    </section>
  );
};

export default Hero;
