import { useState, type ReactNode } from "react";

interface Props {
  label: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  className?: string;
}

/** Two-tap destructive action — first tap arms, second confirms. */
export default function ConfirmButton({ label, confirmLabel, onConfirm, className = "btn btn-danger btn-block btn-sm" }: Props) {
  const [arming, setArming] = useState(false);
  return (
    <button className={className} onClick={() => (arming ? onConfirm() : setArming(true))}>
      {arming ? confirmLabel : label}
    </button>
  );
}
