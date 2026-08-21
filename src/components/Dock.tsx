import { ChartLine, HeartHandshake, History, House, Plus, type LucideIcon } from "lucide-react";

export type Tab = "home" | "trends" | "history" | "help";

interface TabMeta {
  key: Tab;
  label: string;
  Icon: LucideIcon;
}

const LEFT_TABS: TabMeta[] = [
  { key: "home", label: "Home", Icon: House },
  { key: "trends", label: "Trends", Icon: ChartLine },
];

const RIGHT_TABS: TabMeta[] = [
  { key: "history", label: "History", Icon: History },
  { key: "help", label: "Help", Icon: HeartHandshake },
];

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onAdd: () => void;
}

function DockButton({ meta, active, onTab }: { meta: TabMeta; active: boolean; onTab: (tab: Tab) => void }) {
  const { key, label, Icon } = meta;
  return (
    <button className={`dock-btn${active ? " active" : ""}`} aria-current={active} onClick={() => onTab(key)}>
      <Icon size={21} strokeWidth={active ? 2.4 : 2} />
      {label}
    </button>
  );
}

export default function Dock({ tab, onTab, onAdd }: Props) {
  return (
    <nav className="dock" aria-label="Main">
      {LEFT_TABS.map((m) => (
        <DockButton key={m.key} meta={m} active={tab === m.key} onTab={onTab} />
      ))}
      <button className="fab" aria-label="Log something" onClick={onAdd}>
        <Plus size={26} strokeWidth={2.6} />
      </button>
      {RIGHT_TABS.map((m) => (
        <DockButton key={m.key} meta={m} active={tab === m.key} onTab={onTab} />
      ))}
    </nav>
  );
}
