type Props = { score: number; size?: number; stroke?: number; showLabel?: boolean };

export function MLScoreRing({ score, size = 64, stroke = 6, showLabel = true }: Props) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 90 ? "var(--color-primary)" :
    score >= 75 ? "var(--color-amber)" :
    "oklch(0.7 0.02 250)";

  const tone =
    score >= 90 ? "text-primary" :
    score >= 75 ? "text-[color:var(--color-amber)]" :
    "text-muted-foreground";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-bold leading-none ${tone}`}>{score}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">ML</span>
        </div>
      )}
    </div>
  );
}
