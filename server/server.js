const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// Open SQLite database (creates notes.db in server folder if it doesn't exist)
const dbPath = path.join(__dirname, 'notes.db');
const db = new Database(dbPath);

// Create the notes table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Allow the React app (e.g. from Live Server on another port) to call this API
app.use(cors());
// Parse JSON request bodies (for POST and PUT)
app.use(express.json());

// GET /api/notes — return all notes, newest first
app.get('/api/notes', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, title, content, created_at FROM notes ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes — create a new note
app.post('/api/notes', (req, res) => {
  try {
    const { title = '', content = '' } = req.body;
    const stmt = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
    const result = stmt.run(title, content);
    const row = db.prepare('SELECT id, title, content, created_at FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notes/:id — update a note
app.put('/api/notes/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    const stmt = db.prepare('UPDATE notes SET title = ?, content = ? WHERE id = ?');
    stmt.run(title ?? '', content ?? '', id);
    const row = db.prepare('SELECT id, title, content, created_at FROM notes WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Note not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id — delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Note not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
