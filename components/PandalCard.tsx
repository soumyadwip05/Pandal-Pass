import Icon from "@/components/Icon";
import type { Pandal } from "@/lib/types";

const thumbLetters = "abcde";

interface PandalCardProps {
  pandal: Pandal;
  glyph: string;
  crowdLabel: string;
  tagLabels: Record<string, string>;
  variant?: "grid" | "row";
  meta?: string;
}

export default function PandalCard({
  pandal,
  glyph,
  crowdLabel,
  tagLabels,
  variant = "grid",
  meta,
}: PandalCardProps) {
  const thumb = `pcard__thumb--${thumbLetters.charAt(pandal.id % thumbLetters.length)}`;
  return (
    <article className={`pcard${variant === "row" ? " pcard--row" : ""}`}>
      <div className={`pcard__thumb ${thumb}`} aria-hidden="true">
        <Icon name={glyph} size={variant === "row" ? 34 : 44} strokeWidth={2.2} />
      </div>
      <div className="pcard__body">
        <div className="pcard__top">
          <div className="pcard__name">{pandal.name}</div>
          <span className={`badge badge--${pandal.crowd}`}>{crowdLabel}</span>
        </div>
        <div className="pcard__tag">{pandal.tagline}</div>
        <div className="pcard__meta">{meta ?? `${pandal.area} · planning estimate`}</div>
        {variant === "grid" ? (
          <div className="pcard__tags">
            {pandal.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tagLabels[tag] ?? tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
