import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet with backdrop, Escape/scrim dismissal, and body scroll lock. */
export default function Sheet({ title, icon, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div className="sheet-title">
            {icon}
            {title}
          </div>
          <button className="icon-btn icon-btn-sm" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
