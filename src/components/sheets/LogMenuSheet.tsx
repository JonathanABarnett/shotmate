import Sheet from "../Sheet";
import { ENTRY_KINDS, type EntryKind } from "../entryKinds";

const SUBTITLES: Record<EntryKind, string> = {
  shot: "Dose, injection site & time",
  weight: "A quick step on the scale",
  measure: "Chest, waist & more with a tape",
  activity: "A walk, run, ride, or workout",
  effect: "Side effects & symptoms",
  photo: "Private before & after shots",
  win: "A non-scale victory 🎉",
};

interface Props {
  onClose: () => void;
  onPick: (kind: EntryKind) => void;
}

export default function LogMenuSheet({ onClose, onPick }: Props) {
  return (
    <Sheet title="What would you like to log?" onClose={onClose}>
      <div className="logmenu">
        {(Object.keys(ENTRY_KINDS) as EntryKind[]).map((kind) => {
          const { label, tone, Icon } = ENTRY_KINDS[kind];
          return (
            <button key={kind} className="logmenu-btn" onClick={() => onPick(kind)}>
              <span className={`logmenu-ico ${tone}`}>
                <Icon size={23} />
              </span>
              <span>
                <div className="logmenu-title">{label}</div>
                <div className="logmenu-sub">{SUBTITLES[kind]}</div>
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
