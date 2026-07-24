import * as React from "react";

export interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightText({
  text,
  query,
  className,
}: HighlightTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={idx}
            className="rounded bg-primary/25 text-primary font-extrabold px-0.5 py-0"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}
