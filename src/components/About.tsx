import { Code, CodeIcon, Compass, Gamepad2, Music, Server } from "lucide-react";
import { personalInfo } from "../data/personalInfo";
import { ToWords } from "to-words";

const About = () => {
  const calculateExperienceYears = () => {
    const startYear = personalInfo.professionalStartYear;
    const currentYear = new Date();
    const years = currentYear.getFullYear() - startYear.getFullYear();

    return years > 0 ? years : 0;
  };

  // Function to highlight technologies in the intro text
  const renderHighlightedIntro = () => {
    const technologies = [".NET", "React", "Angular", "Aurelia"];
    const toWords = new ToWords();
    let intro = personalInfo.about.intro.replace(
      "{{years}}",
      toWords.convert(calculateExperienceYears()).toLowerCase()
    );

    technologies.forEach((tech) => {
      intro = intro.replace(
        tech,
        `<span class="text-blue-600 dark:text-blue-400 font-medium">${tech}</span>`
      );
    });

    return (
      <p
        className="text-lg text-gray-700 dark:text-gray-300 mb-6"
        dangerouslySetInnerHTML={{ __html: intro }}
      />
    );
  };

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-20 items-center">
          {/* Image column */}
          <div className="w-full md:w-5/12">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-blue-500 rounded-lg"></div>
              <img
                src="/images/me.jpeg"
                alt={`${personalInfo.name} working`}
                className="w-full h-auto rounded-lg shadow-xl relative z-10"
              />
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600 rounded-lg"></div>
            </div>
          </div>

          {/* Content column */}
          <div className="w-full md:w-7/12">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                About Me
              </h2>
              <div className="w-20 h-1 bg-blue-500"></div>
            </div>

            {renderHighlightedIntro()}

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {personalInfo.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {personalInfo.about.skills.map((skill, index) => (
                <div
                  key={`${skill.title}-${index}`}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    {skill.icon === "Code" && (
                      <Code
                        className="text-blue-600 dark:text-blue-400 mr-3"
                        size={24}
                      />
                    )}
                    {skill.icon === "CodeIcon" && (
                      <CodeIcon
                        className="text-blue-600 dark:text-blue-400 mr-3"
                        size={24}
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {skill.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                When I'm not coding
              </h3>
              <div className="flex flex-wrap gap-4">
                {personalInfo.hobbies.map((hobby) =>
                  hobby.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-full"
                    >
                      {(() => {
                        let IconComponent;
                        if (hobby.category === "Outdoor") {
                          IconComponent = Compass;
                        } else if (hobby.category === "Gaming") {
                          IconComponent = Gamepad2;
                        } else if (hobby.category === "Self-Hosting") {
                          IconComponent = Server;
                        } else {
                          IconComponent = Music;
                        }
                        return (
                          <IconComponent
                            className="text-blue-600 dark:text-blue-400 mr-2"
                            size={18}
                          />
                        );
                      })()}
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
