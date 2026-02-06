import React from "react";
import { Button } from "./Button";

function getPreview(content) {
  if (!content) return "";
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > 64 ? `${oneLine.slice(0, 64)}…` : oneLine;
}

// PUBLIC_INTERFACE
export function NotesList({
  notes,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  isDeletingId,
}) {
  /** Sidebar list of notes with select/new/delete actions. */
  return (
    <aside className="panel sidebar" aria-label="Notes list">
      <div className="sidebarHeader">
        <div className="sidebarTitleWrap">
          <h2 className="panelTitle">Notes</h2>
          <span className="badge" aria-label={`${notes.length} notes total`}>
            {notes.length}
          </span>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={onNew}
          ariaLabel="Create a new note"
        >
          + New
        </Button>
      </div>

      <ul className="notesList" aria-label="All notes">
        {notes.length === 0 ? (
          <li className="notesEmpty">No notes yet. Create your first note!</li>
        ) : (
          notes.map((n) => {
            const isSelected = String(n.id) === String(selectedId);
            return (
              <li
                key={n.id}
                className={`noteRow ${isSelected ? "selected" : ""}`}
              >
                <button
                  className="noteRowMain"
                  type="button"
                  onClick={() => onSelect(n.id)}
                  aria-label={`Open note ${n.title || "Untitled"}`}
                >
                  <div className="noteRowTitle">{n.title || "Untitled"}</div>
                  <div className="noteRowPreview">{getPreview(n.content)}</div>
                </button>
                <div className="noteRowActions">
                  <Button
                    variant="danger"
                    size="xs"
                    disabled={Boolean(isDeletingId)}
                    onClick={() => onDelete(n.id)}
                    ariaLabel={`Delete note ${n.title || "Untitled"}`}
                  >
                    {isDeletingId && String(isDeletingId) === String(n.id)
                      ? "…"
                      : "Del"}
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
