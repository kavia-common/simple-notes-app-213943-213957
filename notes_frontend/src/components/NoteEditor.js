import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./Button";

function normalizeNote(note) {
  return {
    id: note?.id ?? null,
    title: note?.title ?? "",
    content: note?.content ?? "",
  };
}

// PUBLIC_INTERFACE
export function NoteEditor({ mode, note, onSave, onCancel, isSaving }) {
  /**
   * Main note editor.
   * mode: "empty" | "view" | "create" | "edit"
   */
  const initial = useMemo(() => normalizeNote(note), [note]);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Reset form when selection/mode changes.
    setTitle(initial.title);
    setContent(initial.content);
    setTouched(false);
  }, [initial.id, initial.title, initial.content, mode]);

  const titleError = touched && title.trim().length === 0 ? "Title is required." : "";
  const contentError = touched && content.trim().length === 0 ? "Content is required." : "";

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSaving;

  const primaryLabel = mode === "create" ? "Save" : "Update";

  if (mode === "empty") {
    return (
      <section className="panel main" aria-label="Note editor">
        <div className="hero">
          <div className="heroTitle">Retro Notes</div>
          <div className="heroSubtitle">
            Pick a note on the left, or create a new one. Your thoughts, pixel-perfect.
          </div>
        </div>
      </section>
    );
  }

  const isReadOnly = mode === "view";

  return (
    <section className="panel main" aria-label="Note editor">
      <div className="mainHeader">
        <h2 className="panelTitle">
          {mode === "create" ? "New Note" : mode === "edit" ? "Edit Note" : "View Note"}
        </h2>

        <div className="mainActions">
          {mode === "view" ? (
            <span className="hint">Tip: click “Edit” to modify.</span>
          ) : (
            <span className="hint">All fields required.</span>
          )}
        </div>
      </div>

      <div className="form">
        <label className="label" htmlFor="noteTitle">
          Title
        </label>
        <input
          id="noteTitle"
          className="input"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTouched(true);
          }}
          placeholder="e.g. Grocery list"
          disabled={isReadOnly || isSaving}
          aria-invalid={Boolean(titleError)}
        />
        {titleError ? <div className="fieldError">{titleError}</div> : null}

        <label className="label" htmlFor="noteContent">
          Content
        </label>
        <textarea
          id="noteContent"
          className="textarea"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setTouched(true);
          }}
          placeholder="Write something…"
          disabled={isReadOnly || isSaving}
          aria-invalid={Boolean(contentError)}
          rows={10}
        />
        {contentError ? <div className="fieldError">{contentError}</div> : null}

        <div className="formActions">
          {mode === "view" ? (
            <>
              <Button variant="primary" onClick={() => onSave({ ...initial, title, content, _intent: "edit" })} ariaLabel="Edit this note">
                Edit
              </Button>
              <Button variant="ghost" onClick={onCancel} ariaLabel="Close note">
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  setTouched(true);
                  if (!canSubmit) return;
                  onSave({ ...initial, title: title.trim(), content: content.trim() });
                }}
                ariaLabel={primaryLabel}
              >
                {isSaving ? "Saving…" : primaryLabel}
              </Button>
              <Button variant="ghost" onClick={onCancel} disabled={isSaving} ariaLabel="Cancel editing">
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
