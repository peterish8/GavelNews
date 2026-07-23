import type { BeforeYouLeave } from "@/lib/types";

interface BeforeYouLeaveSectionProps {
  beforeYouLeave?: BeforeYouLeave;
}

export function BeforeYouLeaveSection({ beforeYouLeave }: BeforeYouLeaveSectionProps) {
  if (!beforeYouLeave || !beforeYouLeave.oneLiner) return null;

  return (
    <section className="surface-emphasis p-5 md:p-6">
      <h2 className="!mt-0">Before you leave</h2>
      <p className="mb-4 font-serif text-[15px] font-medium leading-relaxed text-ink">
        {beforeYouLeave.oneLiner}
      </p>

      {beforeYouLeave.threeBullets.length > 0 && (
        <ul className="mb-4 list-disc pl-5">
          {beforeYouLeave.threeBullets.map((b, i) => (
            <li key={i} className="mb-1 text-sm leading-relaxed text-ink-2">
              {b}
            </li>
          ))}
        </ul>
      )}

      {beforeYouLeave.examTip && (
        <p className="!mb-0 text-sm italic text-brand">{beforeYouLeave.examTip}</p>
      )}
    </section>
  );
}
