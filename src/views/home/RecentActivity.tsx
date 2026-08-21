import { ChevronRight } from "lucide-react";
import type { AppData, Entry } from "../../types";
import { buildEntries } from "../../lib/entries";
import EntryRow from "../../components/EntryRow";

const RECENT_COUNT = 4;

interface Props {
  data: AppData;
  onEdit: (entry: Entry) => void;
  onSeeAll: () => void;
}

export default function RecentActivity({ data, onEdit, onSeeAll }: Props) {
  const recent = buildEntries(data).slice(0, RECENT_COUNT);
  if (recent.length === 0) return null;

  return (
    <>
      <div className="section-label row-between">
        Recent activity
        <button className="link-btn" onClick={onSeeAll}>
          See all <ChevronRight size={15} />
        </button>
      </div>
      {recent.map((entry) => (
        <EntryRow key={`${entry.kind}-${entry.item.id}`} entry={entry} unit={data.settings.unit} onEdit={onEdit} />
      ))}
    </>
  );
}
