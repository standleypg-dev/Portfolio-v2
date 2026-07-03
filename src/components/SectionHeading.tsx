interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lead?: string;
}

const SectionHeading = ({ eyebrow, title, lead }: SectionHeadingProps) => (
  <div className="mb-14 max-w-3xl sm:mb-16">
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
      {eyebrow}
    </p>
    <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
      {title}
    </h2>
    {lead && (
      <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        {lead}
      </p>
    )}
  </div>
);

export default SectionHeading;
