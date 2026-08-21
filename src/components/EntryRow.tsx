import type { Entry, Unit } from "../types";
import { fmtTime } from "../lib/dates";
import { entrySummary } from "../lib/entries";
import { EntryBadge } from "./entryKinds";

interface Props {
  entry: Entry;
  unit: Unit;
  onEdit: (entry: Entry) => void;
}

/** One tappable history/activity row. */
export default function EntryRow({ entry, unit, onEdit }: Props) {
  const { title, sub } = entrySummary(entry, unit);
  return (
    <button className="entry-row" onClick={() => onEdit(entry)}>
      <EntryBadge kind={entry.kind} />
      <span className="entry-main">
        <div className="entry-title">{title}</div>
        <div className="entry-sub">{sub}</div>
      </span>
      <span className="entry-time">{fmtTime(entry.item.ts)}</span>
    </button>
  );
}
