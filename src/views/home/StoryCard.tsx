import Confetti from "../../components/Confetti";
import type { MonthStory } from "../../lib/story";

interface Props {
  story: MonthStory;
  onSaveWin: () => void;
  onDone: () => void;
}

/** The month-versary card — the story so far, with confetti. */
export default function StoryCard({ story, onSaveWin, onDone }: Props) {
  return (
    <section className="card celebrate-card">
      <Confetti />
      <div className="celebrate-emoji" aria-hidden="true">
        📖
      </div>
      <h3 className="celebrate-title">{story.title}</h3>
      <p className="celebrate-sub">{story.sub}</p>
      <ul className="story-lines">
        {story.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="celebrate-actions">
        <button className="btn btn-primary" onClick={onSaveWin}>
          Save as a win 🎉
        </button>
        <button className="btn btn-subtle" onClick={onDone}>
          Onward ✨
        </button>
      </div>
    </section>
  );
}
