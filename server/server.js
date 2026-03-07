const express = require('express');
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
