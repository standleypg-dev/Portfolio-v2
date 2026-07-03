import SocialIcon from "./icons/SocialIcon";
import { personalInfo } from "../data/personalInfo";
import { scrollToSection } from "../utils/scroll";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    scrollToSection(href);
  };

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#work", label: "Work" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  const githubUrl = personalInfo.socials.find(
    (s) => s.platform === "GitHub",
  )?.url;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-14 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="mb-6 font-display text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
          >
            {personalInfo.name}
          </a>

          <nav className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="text-sm text-gray-600 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mb-8 flex space-x-6">
            {personalInfo.socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                aria-label={social.platform}
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <span>
              Copyright {currentYear} {personalInfo.name}
            </span>
            <span aria-hidden="true">|</span>
            <a
              href={`${githubUrl}/Portfolio-v2`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <SocialIcon platform="GitHub" size={14} />
              <span>Source Code</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
