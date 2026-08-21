import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  emoji: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ emoji, title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`acc${open ? " open" : ""}`}>
      <button className="acc-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="acc-emoji">{emoji}</span>
        <span className="acc-title">{title}</span>
        <span className="acc-chev">
          <ChevronDown size={19} />
        </span>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}
