import { MapPin } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import SocialIcon from "./icons/SocialIcon";
import SectionHeading from "./SectionHeading";

const Contact = () => (
  <section id="contact" className="bg-white py-24 dark:bg-gray-900 sm:py-28">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something that lasts."
          lead="Whether you want to collaborate, have a question, or just want to connect, my inbox is open."
        />

        <a
          href={`mailto:${personalInfo.email}`}
          className="font-display text-2xl font-semibold tracking-tight text-gray-900 underline decoration-blue-600/40 decoration-2 underline-offset-8 transition-colors duration-200 hover:text-blue-600 hover:decoration-blue-600 dark:text-white dark:decoration-blue-400/40 dark:hover:text-blue-400 dark:hover:decoration-blue-400 sm:text-3xl"
        >
          {personalInfo.email}
        </a>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
            {personalInfo.location}
          </span>
          <span className="flex items-center gap-5">
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
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
