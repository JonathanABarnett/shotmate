import { useCallback, useEffect, useRef, useState } from "react";

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Pill tabs in a horizontally scrollable row: mouse wheel scrolls it sideways,
 * faded edges hint at hidden tabs, and the active tab scrolls itself into view.
 */
export default function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const updateFade = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setFade({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateFade();
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    return () => {
      el.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [updateFade]);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(".seg-btn.active")?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [value]);

  return (
    <div className={`seg-wrap${fade.left ? " fade-left" : ""}${fade.right ? " fade-right" : ""}`}>
      <div ref={ref} className="seg" role="tablist" aria-label={ariaLabel} onScroll={updateFade}>
        {options.map((o) => (
          <button
            key={o.key}
            role="tab"
            aria-selected={value === o.key}
            className={`seg-btn${value === o.key ? " active" : ""}`}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
