import React from 'react';

interface EditorialParagraphsProps {
  text?: string | null;
  className?: string;
  paragraphClassName?: string;
}

/**
 * EditorialParagraphs formats long-form text (descriptions, eligibility,
 * requirements, provider verification notes, etc.) into clean, traditional
 * article-style paragraphs matching professional sports news and newspapers.
 *
 * - Times New Roman / Times / serif
 * - 16px mobile, 17px desktop
 * - 1.6 line height
 * - 12-16px margin between paragraphs
 * - Clean standard blue links with underline
 * - Normal letter spacing and weight
 */
export const EditorialParagraphs: React.FC<EditorialParagraphsProps> = ({
  text,
  className = '',
  paragraphClassName = '',
}) => {
  if (!text) return null;

  // Split content on blank lines / double newlines to preserve distinct paragraphs
  const rawParagraphs = text.split(/\r?\n\s*\r?\n/);
  const paragraphs = rawParagraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return null;

  // Simple URL parser to format external hyperlinks with traditional blue underline
  const renderParagraphContent = (paraText: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = paraText.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`editorial-prose ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`editorial-p ${paragraphClassName}`}>
          {renderParagraphContent(paragraph)}
        </p>
      ))}
    </div>
  );
};

export default EditorialParagraphs;
