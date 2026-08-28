const PIECES = 26;
const COLORS = ["var(--brand)", "var(--teal)", "var(--gold)", "var(--coral)"];

/** A one-shot CSS confetti burst — purely decorative. */
export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 9) * 0.12}s`,
            animationDuration: `${1.7 + (i % 5) * 0.22}s`,
          }}
        />
      ))}
    </div>
  );
}
