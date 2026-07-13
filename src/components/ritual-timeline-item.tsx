import Link from "next/link";

type TimelineItemProps = {
  time: string;
  moment: string;
  title: string;
  tag: string;
  description: string;
  href: string;
  cta: string;
};

export function RitualTimelineItem({
  time,
  moment,
  title,
  tag,
  description,
  href,
  cta,
}: TimelineItemProps) {
  return (
    <article className="grid gap-4 border-b border-[var(--line)] py-8 transition-colors hover:bg-white/5 md:grid-cols-[120px_1fr_1.1fr] md:gap-8">
      <div className="font-[var(--font-space-mono)] text-[var(--gold)]">
        {time}
        <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.14em] text-[var(--cream-dim)]">
          {moment}
        </span>
      </div>
      <div>
        <h3 className="text-3xl">{title}</h3>
        <p className="mt-2 font-[var(--font-space-mono)] text-xs uppercase tracking-[0.1em] text-[var(--sage)]">
          {tag}
        </p>
      </div>
      <div className="text-[var(--cream-dim)]">
        <p className="leading-7">{description}</p>
        <Link
          href={href}
          className="focus-ring mt-3 inline-block border-b border-[var(--gold)] pb-0.5 text-sm text-[var(--gold)]"
        >
          {cta} →
        </Link>
      </div>
    </article>
  );
}
