import { Trash2 } from "lucide-react";
import ConfirmButton from "../ConfirmButton";

interface Props {
  saveLabel: string;
  onSave: () => void;
  disabled?: boolean;
  /** present only when editing an existing entry */
  onDelete?: () => void;
}

/** Save button + two-tap delete, shared by every entry sheet. */
export default function EntrySheetFooter({ saveLabel, onSave, disabled, onDelete }: Props) {
  return (
    <>
      <button className="btn btn-primary btn-block" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </button>
      {onDelete && (
        <>
          <div className="spacer-8" />
          <ConfirmButton
            label={
              <>
                <Trash2 size={16} /> Delete entry
              </>
            }
            confirmLabel="Tap again to delete"
            onConfirm={onDelete}
          />
        </>
      )}
    </>
  );
}
