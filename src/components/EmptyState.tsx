import type { ReactNode } from "react";

interface Props {
  emoji: string;
  title: string;
  sub: string;
  action?: ReactNode;
}

export default function EmptyState({ emoji, title, sub, action }: Props) {
  return (
    <div className="empty">
      <span className="empty-art" aria-hidden="true">
        {emoji}
      </span>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {action && (
        <>
          <div className="spacer-16" />
          {action}
        </>
      )}
    </div>
  );
}
