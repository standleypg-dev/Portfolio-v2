import { personalInfo } from "../data/personalInfo";
import SectionHeading from "./SectionHeading";

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

const About = () => {
  const years =
    new Date().getFullYear() -
    personalInfo.professionalStartYear.getFullYear();
  const intro = personalInfo.about.intro.replace(
    "{{years}}",
    NUMBER_WORDS[years] ?? String(years),
  );

  const hobbyItems = personalInfo.hobbies.flatMap((hobby) => hobby.items);
  const hobbyLine =
    hobbyItems.length > 1
      ? `${hobbyItems.slice(0, -1).join(", ")}, and ${hobbyItems[hobbyItems.length - 1]}`
      : hobbyItems[0];

  return (
    <section id="about" className="bg-white py-24 dark:bg-gray-900 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="About"
            title="Curious about the why behind the what."
          />

          <div className="grid items-start gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-5">
              <img
                src="/images/me.jpeg"
                alt={`${personalInfo.name} working`}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl object-cover ring-1 ring-gray-900/10 dark:ring-white/10"
              />
            </div>

            <div className="space-y-6 md:col-span-7">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl">
                {intro}
              </p>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                {personalInfo.description}
              </p>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Off the clock:
                </span>{" "}
                {hobbyLine}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
