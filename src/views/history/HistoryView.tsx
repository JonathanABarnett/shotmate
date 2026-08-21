import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Entry } from "../../types";
import { buildEntries, entrySummary, groupEntriesByDay } from "../../lib/entries";
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
  { key: "activity", label: "Moves" },
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
  const [query, setQuery] = useState("");
  const unit = data.settings.unit;
  const needle = query.trim().toLowerCase();

  const matches = (entry: Entry) => {
    if (!needle) return true;
    const { title, sub } = entrySummary(entry, unit);
    return `${title} ${sub}`.toLowerCase().includes(needle);
  };
  const entries = buildEntries(data).filter((e) => (filter === "all" || e.kind === filter) && matches(e));
  const groups = groupEntriesByDay(entries);

  return (
    <div className="view">
      <div className="history-search">
        <Search size={17} className="history-search-icon" />
        <input
          className="input"
          placeholder="Search notes, symptoms, sites…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search history"
        />
        {query && (
          <button className="history-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>
      <ChipGroup
        className="history-filter"
        options={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
        selected={[filter]}
        onToggle={(key) => setFilter(key as Filter)}
      />
      {groups.length === 0 ? (
        needle ? (
          <EmptyState emoji="🔍" title="No matches" sub={`Nothing mentions “${query.trim()}” — try another word.`} />
        ) : (
          <EmptyState
            emoji="📖"
            title="Your story starts here"
            sub="Everything you log — shots, weigh-ins, how you feel — lands on this timeline."
          />
        )
      ) : (
        groups.map((g) => (
          <section className="day-group" key={g.day}>
            <div className="day-head">{g.label}</div>
            {g.entries.map((entry) => (
              <EntryRow key={`${entry.kind}-${entry.item.id}`} entry={entry} unit={unit} onEdit={onEdit} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
