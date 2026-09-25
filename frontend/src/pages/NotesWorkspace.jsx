import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import NoteEditor from "../components/NoteEditor.jsx";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote
} from "../api.js";

function NotesWorkspace() {
  const { user, signOut, session } = useAuth();
  const { success, error } = useToast();
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const accessToken = session?.access_token;

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter((note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const openNote = (note) => {
    setSelectedNoteId(note.id);
  };

  const loadNotes = async () => {
    setIsLoading(true);

    try {
      const loadedNotes = await getNotes(accessToken);
      setNotes(loadedNotes);

      if (loadedNotes.length > 0) {
        openNote(loadedNotes[0]);
      } else {
        setSelectedNoteId(null);
      }
    } catch (err) {
      error("Failed to load notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const createBlankNote = async () => {
    setIsSaving(true);

    try {
      const note = await createNote({ title: "", content: "" }, accessToken);
      setNotes((currentNotes) => [note, ...currentNotes]);
      openNote(note);
      success("New note created");
    } catch (err) {
      error("Failed to create note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveNote = async ({ title, content }) => {
    if (!selectedNoteId) return;

    setIsSaving(true);

    try {
      const updatedNote = await updateNote(selectedNoteId, { title, content }, accessToken);
      setNotes((currentNotes) =>
        currentNotes.map((note) => (note.id === selectedNoteId ? updatedNote : note))
      );
      success("Note saved");
    } catch (err) {
      error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeNote = async () => {
    if (!selectedNoteId) return;

    setIsSaving(true);

    try {
      await deleteNote(selectedNoteId, accessToken);
      const remainingNotes = notes.filter((note) => note.id !== selectedNoteId);
      setNotes(remainingNotes);

      if (remainingNotes.length > 0) {
        openNote(remainingNotes[0]);
      } else {
        setSelectedNoteId(null);
      }

      success("Note deleted");
    } catch (err) {
      error("Failed to delete note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const formatDate = (timestamp) =>
    new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp));

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-bg-elevated sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-primary">OJOTO</p>
            <h1 className="text-xl font-bold text-text">Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted hidden sm:block truncate max-w-[180px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-secondary text-sm px-3 py-1.5 hidden sm:flex"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={createBlankNote}
              disabled={isSaving}
              className="btn btn-primary text-sm px-4 py-2"
            >
              New Note
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-full border-r border-border bg-bg-elevated lg:w-80 flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Your notes</h2>
              <p className="mt-0.5 text-xs text-text-muted">{notes.length} total</p>
            </div>
            <button
              type="button"
              onClick={loadNotes}
              disabled={isLoading}
              className="btn btn-ghost text-xs px-2 py-1"
            >
              Refresh
            </button>
          </div>

          <div className="border-b border-border px-4 py-3">
            <label htmlFor="note-search" className="sr-only">Search notes</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="note-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="input pl-10 w-full"
                aria-label="Search notes by title or content"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-text-muted animate-pulse-soft">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading notes...</span>
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <div className="empty-state-icon">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="empty-state-title">No matching notes</p>
                    <p className="empty-state-text">Try adjusting your search or create a new note.</p>
                  </>
                ) : (
                  <>
                    <div className="empty-state-icon">N</div>
                    <p className="empty-state-title">No notes yet</p>
                    <p className="empty-state-text">Create your first note to get started.</p>
                  </>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId;
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => openNote(note)}
                        className={`w-full px-3 py-2.5 text-left rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          isSelected
                            ? "bg-primary-light text-text"
                            : "hover:bg-bg text-text"
                        }`}
                      >
                        <span className="block truncate text-sm font-medium text-text">
                          {note.title.trim() || "Untitled note"}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-muted">
                          {note.content.trim() || "Empty note"}
                        </span>
                        <span className="mt-1.5 block text-[10px] text-text-muted">
                          {formatDate(note.updatedAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onSave={saveNote}
              onDelete={removeNote}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-2xl font-bold text-primary">
                  N
                </div>
                <h2 className="mt-4 text-lg font-bold text-text">
                  {isLoading ? "Loading your notes..." : "Create a note to get started"}
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  {isLoading
                    ? "Fetching notes from the backend."
                    : "Your notes will appear here and stay in sync with the API."}
                </p>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={createBlankNote}
                    disabled={isSaving}
                    className="mt-5 btn btn-primary"
                  >
                    New Note
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default NotesWorkspace;