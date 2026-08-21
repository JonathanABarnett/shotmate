import Accordion from "../../components/Accordion";
import { HELP_SECTIONS } from "./helpContent";

export default function HelpView() {
  return (
    <div className="view">
      <p className="callout info">
        🌱 Friendly pointers for the GLP-1 journey. Your care team knows you best — for anything medical, they're the
        ones to ask.
      </p>
      {HELP_SECTIONS.map((s) => (
        <Accordion key={s.title} emoji={s.emoji} title={s.title}>
          {s.body}
        </Accordion>
      ))}
    </div>
  );
}
