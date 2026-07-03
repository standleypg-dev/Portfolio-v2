import { testimonials } from "../data/testimonials";
import SectionHeading from "./SectionHeading";

const Testimonials = () => (
  <section
    id="testimonials"
    className="bg-gray-50 py-24 dark:bg-gray-950 sm:py-28"
  >
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="What it's like to work with me."
        />

        <div className="space-y-16">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name}>
              <blockquote className="border-l-2 border-blue-600 pl-6 text-lg leading-relaxed text-gray-700 dark:border-blue-400 dark:text-gray-300 sm:pl-8">
                "{testimonial.text}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4 pl-6 sm:pl-8">
                <img
                  src={testimonial.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-900/10 dark:ring-white/15"
                />
                <span>
                  <span className="block font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.position}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
