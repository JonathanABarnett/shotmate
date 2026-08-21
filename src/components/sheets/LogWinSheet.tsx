import { useState } from "react";
import type { WinEntry } from "../../types";
import { uid } from "../../lib/ids";
import { useStore } from "../../store/StoreProvider";
import Sheet from "../Sheet";
import { EntryBadge } from "../entryKinds";
import { DateTimeField, Field } from "../form/fields";
import EntrySheetFooter from "../form/EntrySheetFooter";
import type { EntrySheetProps } from "./types";

const PROMPTS = [
  "Belt needed a new notch",
  "Took the stairs without thinking",
  "Old jeans fit again",
  "Said no to seconds — didn't miss it",
];

export default function LogWinSheet({ onClose, onDone, existing }: EntrySheetProps & { existing?: WinEntry }) {
  const { dispatch } = useStore();
  const [text, setText] = useState(existing?.text ?? "");
  const [ts, setTs] = useState(existing?.ts ?? Date.now());

  const finish = (message: string, undo?: () => void) => {
    onDone(message, undo);
    onClose();
  };

  const save = () => {
    if (!text.trim()) return;
    const entry: WinEntry = { id: existing?.id ?? uid(), ts, text: text.trim() };
    dispatch({ type: "upsert", collection: "wins", item: entry });
    finish(existing ? "Win updated" : "That's a win! 🎉");
  };

  const remove = () => {
    if (!existing) return;
    dispatch({ type: "remove", collection: "wins", id: existing.id });
    finish("Entry deleted", () => dispatch({ type: "upsert", collection: "wins", item: existing }));
  };

  return (
    <Sheet title={existing ? "Edit win" : "Non-scale victory"} icon={<EntryBadge kind="win" />} onClose={onClose}>
      <Field label="What happened?" hint={`Ideas: ${PROMPTS[Math.floor(ts / 86_400_000) % PROMPTS.length].toLowerCase()}…`}>
        <textarea
          className="input"
          placeholder="The scale isn't the only scoreboard…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          autoFocus={!existing}
        />
      </Field>
      <DateTimeField value={ts} onChange={setTs} />
      <EntrySheetFooter
        saveLabel={existing ? "Save changes" : "Log the win 🎉"}
        onSave={save}
        disabled={!text.trim()}
        onDelete={existing ? remove : undefined}
      />
    </Sheet>
  );
}
