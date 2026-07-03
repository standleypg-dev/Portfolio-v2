import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "../data/testimonials";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isExpanded, setIsExpanded] = useState(false);

  const nextTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(1);
    setIsExpanded(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 300);
  };

  const prevTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(-1);
    setIsExpanded(false);
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + testimonials.length) % testimonials.length
      );
    }, 300);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    setDirection(0);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const MAX_TEXT_LENGTH = 200;
  const currentTestimonial = testimonials[currentIndex];
  const isTextLong = currentTestimonial.text.length > MAX_TEXT_LENGTH;

  let truncatedText = currentTestimonial.text;

  if (isTextLong) {
    truncatedText = `${currentTestimonial.text.slice(0, MAX_TEXT_LENGTH)}...`;
  }

  const displayText = isExpanded ? currentTestimonial.text : truncatedText;

  return (
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Testimonials
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            What colleagues and clients say about working with me.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 md:p-12 overflow-hidden transition-colors duration-500">
            <Quote
              className="absolute top-6 left-6 text-blue-200 dark:text-blue-900"
              size={48}
            />

            <div
              className="relative z-10"
              style={{
                transform: `translateX(${direction * 100}%)`,
                opacity: isTransitioning ? 0 : 1,
                transition: "all 0.5s ease-in-out",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-4 italic">
                "{displayText}"
                {isTextLong && (
                  <button
                    onClick={toggleExpand}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 text-base not-italic"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>

              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden mr-4">
                  <img
                    src={currentTestimonial.avatarUrl}
                    alt={currentTestimonial.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentTestimonial.position}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={prevTestimonial}
              disabled={isTransitioning}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              disabled={isTransitioning}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
