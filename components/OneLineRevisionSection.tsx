import type { OneLineRevision } from "@/lib/types";

interface OneLineRevisionSectionProps {
  oneLineRevision?: OneLineRevision;
}

/** Signed-in-only one-line revision block (schema v2). */
export function OneLineRevisionSection({
  oneLineRevision,
}: OneLineRevisionSectionProps) {
  if (!oneLineRevision?.line) return null;

  return (
    <section className="surface-emphasis mb-10 p-5 md:p-6">
      <h2 className="!mt-0">
        {oneLineRevision.heading || "One Line Revision"}
      </h2>
      <p className="!mb-0 font-serif text-[15px] font-medium leading-relaxed text-ink">
        {oneLineRevision.line}
      </p>
    </section>
  );
}
