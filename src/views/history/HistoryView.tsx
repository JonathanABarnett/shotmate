import { useState } from "react";
import type { Entry } from "../../types";
import { buildEntries, groupEntriesByDay } from "../../lib/entries";
import { useStore } from "../../store/StoreProvider";
import ChipGroup from "../../components/form/ChipGroup";
import EmptyState from "../../components/EmptyState";
import EntryRow from "../../components/EntryRow";

type Filter = "all" | Entry["kind"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shot", label: "Shots" },
  { key: "weight", label: "Weight" },
  { key: "measure", label: "Body" },
  { key: "effect", label: "Feels" },
  { key: "photo", label: "Photos" },
  { key: "win", label: "Wins" },
];

interface Props {
  onEdit: (entry: Entry) => void;
}

export default function HistoryView({ onEdit }: Props) {
  const { data } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const entries = buildEntries(data).filter((e) => filter === "all" || e.kind === filter);
  const groups = groupEntriesByDay(entries);

  return (
    <div className="view">
      <ChipGroup
        className="history-filter"
        options={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        selected={[filter]}
        onToggle={(key) => setFilter(key as Filter)}
      />
      {groups.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="Your story starts here"
          sub="Everything you log — shots, weigh-ins, how you feel — lands on this timeline."
        />
      ) : (
        groups.map((g) => (
          <section className="day-group" key={g.day}>
            <div className="day-head">{g.label}</div>
            {g.entries.map((entry) => (
              <EntryRow key={`${entry.kind}-${entry.item.id}`} entry={entry} unit={data.settings.unit} onEdit={onEdit} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
