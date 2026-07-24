interface VisualMemoryCardProps {
  visualMemoryCard?: string;
}

/**
 * Visual Memory Card — ASCII/tree revision diagram as preformatted
 * monospace text. Matches surface-emphasis spacing of other gated blocks.
 */
export function VisualMemoryCard({ visualMemoryCard }: VisualMemoryCardProps) {
  if (!visualMemoryCard?.trim()) return null;

  return (
    <section className="surface-emphasis mb-10 p-5 md:p-6">
      <h2 className="!mt-0">Visual Memory Card</h2>
      <pre className="!mb-0 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-ink-2 md:text-sm">
        {visualMemoryCard}
      </pre>
    </section>
  );
}
