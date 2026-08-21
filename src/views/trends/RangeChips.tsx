export interface RangeOption<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  options: RangeOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function RangeChips<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="range-row" role="tablist" aria-label="Date range">
      {options.map((o) => (
        <button
          key={o.key}
          role="tab"
          aria-selected={value === o.key}
          className={`range-chip${value === o.key ? " active" : ""}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
