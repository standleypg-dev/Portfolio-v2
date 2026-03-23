import { Mail, MapPin } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import SocialIcon from "./icons/SocialIcon";

const Contact = () => {
  const renderContactInfo = (
    icon: React.ReactNode,
    title: string,
    content: React.ReactNode
  ) => (
    <div className="flex items-start">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {title}
        </h4>
        {content}
      </div>
    </div>
  );

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Get In Touch
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Feel free to reach out if you want to collaborate, have a question,
            or just want to connect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-12 max-w-xl mx-auto">
          {/* Contact information */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Contact Information
              </h3>

              <div className="space-y-6">
                {renderContactInfo(
                  <Mail
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />,
                  "Email",
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {personalInfo.email}
                  </a>
                )}

                {renderContactInfo(
                  <MapPin
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />,
                  "Location",
                  <p className="text-gray-600 dark:text-gray-400">
                    {personalInfo.location}
                  </p>
                )}
              </div>

              <div className="mt-10">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Follow Me
                </h4>
                <div className="flex space-x-4">
                  {personalInfo.socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white p-3 rounded-full transition-colors duration-300"
                      aria-label={social.platform}
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
