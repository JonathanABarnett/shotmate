import { useCallback, useRef, useState } from "react";

const TOAST_MS = 2600;

interface ToastState {
  id: number;
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  return { toast, showToast };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className="toast" role="status">
      {toast.message}
    </div>
  );
}
