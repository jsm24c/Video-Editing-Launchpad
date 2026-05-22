# Video-Editing-Launchpad

A simple launchpad with clickable tiles that link to my editing tools, resources, and references — plus a notepad and a visual storyboard planner.

## Features

- **Launchpad** — clickable tiles for LUTs, Text-to-Speech, Font Library, Video Downloader, SFX, and How-To's.
- **Storyboard** — drag-and-drop node editor for sketching cut sequences. Click "+ Add Clip" to spawn nodes, drag them anywhere on the canvas, connect them by dragging the right-side port to another node, and click an arrow to delete it. Edge labels (e.g. "cut", "fade") are click-to-edit.
- **Notepad** — slide-up panel with full CRUD (create, edit, delete) backed by the SQLite API.
- Dark teal theme, no build step on the frontend (React + Babel via CDN).

## How to Run

**Frontend (launchpad + storyboard + notepad UI)**
- Serve the project folder (e.g. VS Code Live Server, or `npx serve .`), then open the URL (e.g. http://localhost:3000).
- Do not open `launchpad.html` as a file; `app.jsx` is loaded as `type="text/babel"` and needs to be served over HTTP.

**Backend (notes API)**
- From the project root: `cd server`, then `npm install`, then `npm start`.
- Server runs at http://localhost:3001. The React app talks to `http://localhost:3001/api/notes` for CRUD.

**Full stack**
1. Start the backend: `cd server && npm start`.
2. Start a static server for the frontend (e.g. `npx serve .` in the project root).
3. Open the frontend URL in the browser. Use the top tab nav to switch between Launchpad and Storyboard; use "Open Notepad" on the Launchpad tab to manage notes (stored in SQLite).

## Project Structure

- `launchpad.html` / `app.jsx` / `style.css` — frontend (React from CDN, no bundler).
- `images/` — tile icons.
- `server/` — Express + better-sqlite3 backend; `notes.db` is created automatically on first run.
