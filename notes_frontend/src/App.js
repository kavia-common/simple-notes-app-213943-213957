import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { createNote, deleteNote, listNotes, updateNote } from "./api/notesApi";
import { NotesList } from "./components/NotesList";
import { NoteEditor } from "./components/NoteEditor";
import { StatusBanner } from "./components/StatusBanner";

function sortNotes(notes) {
  // Prefer updated_at/created_at if backend provides; otherwise keep stable by title.
  const copy = [...notes];
  copy.sort((a, b) => {
    const au = a.updated_at || a.updatedAt || a.created_at || a.createdAt || 0;
    const bu = b.updated_at || b.updatedAt || b.created_at || b.createdAt || 0;
    if (au && bu && au !== bu) return String(bu).localeCompare(String(au));
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
  return copy;
}

function normalizeNotes(data) {
  if (Array.isArray(data)) return data;
  // Some APIs might return {items:[...]} or {notes:[...]}
  if (data && typeof data === "object") {
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.notes)) return data.notes;
  }
  return [];
}

// PUBLIC_INTERFACE
function App() {
  /** Retro Notes main application component (list + editor with CRUD). */
  const [theme, setTheme] = useState("retro");
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [mode, setMode] = useState("empty"); // empty | view | create | edit
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [status, setStatus] = useState({
    kind: "info",
    title: "",
    message: "",
  });

  const selectedNote = useMemo(
    () => notes.find((n) => String(n.id) === String(selectedId)) || null,
    [notes, selectedId],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  async function refreshNotes({ keepSelection = true } = {}) {
    setLoading(true);
    setStatus({
      kind: "info",
      title: "Loading",
      message: "Fetching notes from the backend…",
    });
    try {
      const data = await listNotes();
      const normalized = sortNotes(normalizeNotes(data));
      setNotes(normalized);

      if (keepSelection && selectedId != null) {
        const stillExists = normalized.some(
          (n) => String(n.id) === String(selectedId),
        );
        if (!stillExists) {
          setSelectedId(null);
          setMode("empty");
        }
      }

      setStatus({
        kind: "success",
        title: "Ready",
        message: `Loaded ${normalized.length} note(s).`,
      });
    } catch (e) {
      setStatus({
        kind: "error",
        title: "Backend unreachable",
        message:
          `${e?.message || "Failed to load notes."} ` +
          "Check REACT_APP_API_BASE / REACT_APP_BACKEND_URL and that the backend is running.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onNew() {
    setSelectedId(null);
    setMode("create");
    setStatus({
      kind: "info",
      title: "New note",
      message: "Drafting a new note…",
    });
  }

  function onSelect(id) {
    setSelectedId(id);
    setMode("view");
    setStatus({ kind: "info", title: "Viewing", message: "Opened note." });
  }

  async function onDelete(id) {
    setDeletingId(id);
    setStatus({ kind: "info", title: "Deleting", message: "Removing note…" });
    try {
      await deleteNote(id);
      await refreshNotes({ keepSelection: false });
      setSelectedId(null);
      setMode("empty");
      setStatus({
        kind: "success",
        title: "Deleted",
        message: "Note deleted.",
      });
    } catch (e) {
      setStatus({
        kind: "error",
        title: "Delete failed",
        message: e?.message || "Could not delete note.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function onSave(payload) {
    // Special intent: in view mode, the "Edit" button routes to edit mode.
    if (mode === "view" && payload && payload._intent === "edit") {
      setMode("edit");
      setStatus({
        kind: "info",
        title: "Editing",
        message: "Make your changes, then Update.",
      });
      return;
    }

    setSaving(true);
    setStatus({
      kind: "info",
      title: "Saving",
      message: "Writing note to the backend…",
    });

    try {
      if (mode === "create") {
        const created = await createNote({
          title: payload.title,
          content: payload.content,
        });
        // If backend returns note with id, prefer it; otherwise refresh list.
        if (created && created.id != null) {
          await refreshNotes({ keepSelection: false });
          setSelectedId(created.id);
          setMode("view");
        } else {
          await refreshNotes({ keepSelection: false });
          setMode("empty");
        }
        setStatus({
          kind: "success",
          title: "Saved",
          message: "New note created.",
        });
      } else if (mode === "edit" && selectedNote) {
        const updated = await updateNote(selectedNote.id, {
          title: payload.title,
          content: payload.content,
        });
        if (updated && updated.id != null) {
          await refreshNotes({ keepSelection: true });
          setSelectedId(updated.id);
        } else {
          await refreshNotes({ keepSelection: true });
        }
        setMode("view");
        setStatus({
          kind: "success",
          title: "Updated",
          message: "Note updated.",
        });
      } else {
        setStatus({
          kind: "error",
          title: "Nothing to save",
          message: "No active note selected.",
        });
      }
    } catch (e) {
      setStatus({
        kind: "error",
        title: "Save failed",
        message: e?.message || "Could not save note.",
      });
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (selectedNote) {
      setMode("view");
      setStatus({
        kind: "info",
        title: "Cancelled",
        message: "Back to view mode.",
      });
    } else {
      setMode("empty");
      setStatus({
        kind: "info",
        title: "Cancelled",
        message: "Draft discarded.",
      });
    }
  }

  const editorMode = mode === "view" || mode === "edit" ? mode : mode; // keep explicit
  const editorNote =
    mode === "create" ? { id: null, title: "", content: "" } : selectedNote;

  return (
    <div className="App">
      <div className="appFrame">
        <header className="topbar">
          <div className="brand">
            <div className="brandMark" aria-hidden="true">
              RN
            </div>
            <div className="brandText">
              <div className="brandTitle">Retro Notes</div>
              <div className="brandTagline">Create • Edit • Delete</div>
            </div>
          </div>

          <div className="topbarActions">
            <button
              className="topbarBtn"
              type="button"
              onClick={() =>
                setTheme((t) => (t === "retro" ? "retro-dark" : "retro"))
              }
              aria-label="Toggle retro theme"
            >
              Theme: {theme === "retro" ? "Light" : "Dark"}
            </button>
            <button
              className="topbarBtn"
              type="button"
              onClick={() => refreshNotes()}
              disabled={loading}
              aria-label="Refresh notes"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        <main className="content" aria-label="Notes app">
          <div className="statusRow">
            <StatusBanner
              kind={status.kind}
              title={status.title}
              message={status.message}
              actionLabel={status.kind === "error" ? "Retry" : ""}
              onAction={
                status.kind === "error" ? () => refreshNotes() : undefined
              }
            />
          </div>

          <div className="split">
            <NotesList
              notes={notes}
              selectedId={selectedId}
              onSelect={onSelect}
              onNew={onNew}
              onDelete={onDelete}
              isDeletingId={deletingId}
            />

            <NoteEditor
              mode={
                selectedNote
                  ? editorMode
                  : mode === "create"
                    ? "create"
                    : "empty"
              }
              note={editorNote}
              onSave={onSave}
              onCancel={onCancel}
              isSaving={saving}
            />
          </div>

          <footer className="footer">
            <div className="footerHint">
              API base:{" "}
              <code className="codeChip">
                {(
                  process.env.REACT_APP_API_BASE ||
                  process.env.REACT_APP_BACKEND_URL ||
                  "same-origin"
                ).trim() || "same-origin"}
              </code>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
