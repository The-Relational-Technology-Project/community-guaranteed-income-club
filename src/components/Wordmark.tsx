import { Link } from "react-router-dom";
import { ORG, CHAPTER } from "@/lib/chapter";

interface WordmarkProps {
  to?: string;
  variant?: "default" | "compact" | "light";
  showChapter?: boolean;
  className?: string;
}

/**
 * Three overlapping circles in blue / orange / yellow — a small symbol of
 * pooled, shared income flowing between people. Paired with the wordmark in
 * Space Grotesk.
 */
export const ClubMark = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    aria-hidden="true"
    className="shrink-0"
  >
    <circle cx="17" cy="20" r="12" fill="hsl(var(--primary))" />
    <circle cx="31" cy="20" r="12" fill="hsl(var(--accent))" style={{ mixBlendMode: "multiply" }} />
    <circle cx="24" cy="32" r="12" fill="hsl(var(--pop))" style={{ mixBlendMode: "multiply" }} />
  </svg>
);

const Wordmark = ({ to = "/", variant = "default", showChapter = false, className = "" }: WordmarkProps) => {
  const compact = variant === "compact";
  const light = variant === "light";

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      <ClubMark size={compact ? 28 : 36} />
      <div className="leading-[1.05]">
        <p
          className={`font-display font-bold tracking-tight ${
            compact ? "text-sm" : "text-base md:text-[17px]"
          } ${light ? "text-sidebar-foreground" : "text-foreground"}`}
        >
          Community Guaranteed Income
        </p>
        <p
          className={`font-display font-bold tracking-tight ${
            compact ? "text-base" : "text-lg md:text-xl"
          } ${light ? "text-sidebar-primary" : "text-primary"}`}
        >
          Club{showChapter && <span className={`ml-2 text-xs font-medium ${light ? "text-sidebar-foreground/70" : "text-muted-foreground"}`}>· {CHAPTER.name}</span>}
        </p>
      </div>
    </div>
  );

  if (!to) return content;
  return <Link to={to} aria-label={`${ORG.name} — ${CHAPTER.fullName} home`}>{content}</Link>;
};

export default Wordmark;