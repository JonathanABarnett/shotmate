export interface ChipOption {
  key: string;
  label: string;
}

interface Props {
  options: ChipOption[];
  selected: string[];
  onToggle: (key: string) => void;
  className?: string;
}

/** Pill chips for single- or multi-select — the caller owns the selection rule. */
export default function ChipGroup({ options, selected, onToggle, className }: Props) {
  return (
    <div className={`chip-row${className ? ` ${className}` : ""}`}>
      {options.map((o) => (
        <button
          key={o.key}
          className={`chip${selected.includes(o.key) ? " active" : ""}`}
          aria-pressed={selected.includes(o.key)}
          onClick={() => onToggle(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
