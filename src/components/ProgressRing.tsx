interface Props {
  /** 0..1 progress around the ring */
  progress: number;
  size?: number;
  stroke?: number;
  /** ring colors — defaults suit the gradient hero */
  trackColor?: string;
  barColor?: string;
  gradient?: boolean;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 116,
  stroke = 10,
  trackColor = "rgba(255,255,255,0.25)",
  barColor = "#ffffff",
  gradient = false,
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(clamped * 100)}% of cycle complete`}>
        {gradient && (
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c5ce6" />
              <stop offset="100%" stopColor="#18b597" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={gradient ? "url(#ring-grad)" : barColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * clamped} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.22,0.9,0.35,1)" }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
