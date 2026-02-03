const { useState, useEffect } = React;

// API base URL — change if your server runs on a different port
const API_BASE = 'http://localhost:3001';

// 1. The data — one array, one place to add/remove/edit tools
const TILES = [
  { id: 'tts', name: 'Text-to-Speech', url: 'https://start.elevenlabs.io/', image: 'tts.png' },
  { id: 'font', name: 'Font Picker', url: 'https://www.dafont.com/top.php', image: 'font.png' },
  { id: 'y2mate', name: 'Youtube Video Downloader', url: 'https://v4.www-y2mate.com/', image: 'y2mate.png' },
  { id: 'luts', name: 'LUTs', url: 'https://freshluts.com/luts', image: 'luts.png' },
  { id: 'howto', name: "How-To's", url: 'https://docs.google.com/document/d/12-C1Reu0s2bdL1LuW2Q5QjQM2PvrRY6flwyZX9jFI20/edit?tab=t.0', image: 'how to.png' }
];

// 2. Tile — one link box (receives name, url, image as props)
function Tile({ name, url, image }) {
  return (
    <div className="icon">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={image} alt={name} width="300" height="300" />
      </a>
      <p>{name}</p>
    </div>
  );
}

// 3. TileGrid — maps over the array and renders a Tile for each
function TileGrid({ tiles }) {
  return (
    <div className="icon-row">
      {tiles.map((tile) => (
        <Tile key={tile.id} name={tile.name} url={tile.url} image={tile.image} />
      ))}
    </div>
  );
}

// 4. Notepad — slide-up panel, fetches and manages notes via API
function Notepad({ isOpen, onClose, notes, onRefresh, apiBase }) {
  const [editingNote, setEditingNote] = useState(null); // null = add new, or { id, title, content }
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (editingNote && editingNote.id) {
        const res = await fetch(`${apiBase}/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
        if (!res.ok) throw new Error('Failed to update note');
      } else {
        const res = await fetch(`${apiBase}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
        if (!res.ok) throw new Error('Failed to create note');
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      if (editingNote && editingNote.id === id) resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (note) => {
    setEditingNote({ id: note.id, title: note.title, content: note.content });
    setTitle(note.title || '');
    setContent(note.content || '');
  };

  return (
    <div id="notepad" className={isOpen ? 'active' : ''}>
      <div className="notepad-header">
        <h3 style={{ margin: 0, fontSize: 18 }}>Notes</h3>
        <button type="button" className="notepad-add" onClick={() => { resetForm(); setEditingNote({}); }}>
          Add note
        </button>
      </div>

      {(editingNote !== null) ? (
        <div className="notepad-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="notepad-title-input"
          />
          <textarea
            placeholder="Content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="notepad-content-input"
          />
          {error && <p className="notepad-error">{error}</p>}
          <div className="notepad-form-actions">
            <button type="button" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      ) : null}

      <ul className="notepad-list">
        {notes.map((note) => (
          <li key={note.id} className="notepad-item">
            <div className="notepad-item-body">
              <strong>{note.title || '(No title)'}</strong>
              <span className="notepad-item-preview">{note.content ? note.content.slice(0, 60) + (note.content.length > 60 ? '…' : '') : ''}</span>
            </div>
            <div className="notepad-item-actions">
              <button type="button" onClick={() => startEdit(note)}>Edit</button>
              <button type="button" onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {notes.length === 0 && editingNote === null && (
        <p className="notepad-empty">No notes yet. Click &quot;Add note&quot; to create one.</p>
      )}

      <button type="button" className="notepad-close" onClick={onClose}>Close</button>
    </div>
  );
}

// 5. App — holds notepad open state, fetches notes from API
function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);

  const fetchNotes = async () => {
    try {
      setNotesError(null);
      const res = await fetch(`${API_BASE}/api/notes`);
      if (!res.ok) throw new Error('Failed to load notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setNotesError(err.message);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <>
      <TileGrid tiles={TILES} />
      <button id="openNotepadBtn" type="button" onClick={() => setIsOpen(true)}>Open Notepad</button>
      <Notepad
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notes={notes}
        onRefresh={fetchNotes}
        apiBase={API_BASE}
      />
      {notesError && isOpen && (
        <p className="notepad-api-error">Could not load notes. Is the server running at {API_BASE}?</p>
      )}
    </>
  );
}

// 6. Render the app into the page
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
