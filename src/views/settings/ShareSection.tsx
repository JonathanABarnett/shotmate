import { CalendarPlus, FileText } from "lucide-react";
import { useStore } from "../../store/StoreProvider";
import { downloadShotDayIcs } from "../../lib/ics";

interface Props {
  showToast: (message: string) => void;
  onOpenReport: () => void;
}

export default function ShareSection({ showToast, onOpenReport }: Props) {
  const { data } = useStore();

  const handleCalendar = () => {
    if (downloadShotDayIcs(data)) {
      showToast("Calendar file downloaded 📅 — open it to add");
    } else {
      showToast("Log a shot first so I know your schedule");
    }
  };

  return (
    <section className="card">
      <button className="btn btn-subtle btn-block btn-sm" onClick={onOpenReport}>
        <FileText size={16} /> Provider report (print / PDF)
      </button>
      <div className="spacer-8" />
      <button className="btn btn-subtle btn-block btn-sm" onClick={handleCalendar}>
        <CalendarPlus size={16} /> Add shot day to my calendar
      </button>
      <p className="field-hint" style={{ marginTop: 12 }}>
        The calendar file adds a repeating "shot day" event with a reminder — re-download it if your schedule changes.
      </p>
    </section>
  );
}
