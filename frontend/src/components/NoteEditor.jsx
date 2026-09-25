import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";

const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));

function NoteEditor({ note, onSave, onDelete, isSaving }) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const { success, error } = useToast();

  useEffect(() => {
    if (!note) {
      setTitle("");
      setContent("");
      return;
    }

    setTitle(note.title);
    setContent(note.content);
  }, [note?.id, note?.title, note?.content]);

  const handleSave = () => {
    onSave({ title, content });
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Note editor
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Updated {formatTimestamp(note.updatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className="btn btn-danger text-sm px-3 py-1.5"
        >
          Delete
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Note title"
        aria-label="Note title"
        className="mt-5 w-full border-b-2 border-border bg-transparent pb-3 text-2xl font-bold text-text placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
      />
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Start writing..."
        aria-label="Note content"
        className="mt-5 flex-1 w-full resize-none rounded-xl border border-border bg-bg-elevated p-4 text-base leading-7 text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-5" aria-live="polite" />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary text-sm px-4 py-2"
        >
          {isSaving ? "Saving..." : "Save note"}
        </button>
      </div>
    </div>
  );
}

export default NoteEditor;