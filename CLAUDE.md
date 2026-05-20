# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

**Frontend only** — serve the project root over HTTP (required for Babel to transpile `app.jsx`):
```
npx serve .
```
Do not open `launchpad.html` as a `file://` URL; `app.jsx` is loaded as `type="text/babel"` and needs an HTTP server.

**Backend** — from `server/`:
```
cd server
npm install   # first time only
npm start     # runs on http://localhost:3001
```

**Full stack**: start the backend first, then the frontend static server. The React app expects the API at `http://localhost:3001` (hardcoded as `API_BASE` in `app.jsx`).

## Architecture

This is a no-build-step frontend + Node.js backend project.

**Frontend** (`launchpad.html`, `app.jsx`, `style.css`)
- React 18 loaded from CDN; Babel Standalone transpiles `app.jsx` in the browser at runtime — no bundler, no `npm` on the frontend.
- `app.jsx` is the entire React app: `TILES` array (data), `Tile`/`TileGrid` components (the icon grid), `Notepad` component (slide-up panel), and `App` root component.
- To add a new launchpad tile, add an entry to the `TILES` array in `app.jsx` with `{ id, name, url, image }`. The image file must exist in `images/` and the path should be `images/filename.png`.
- `style.css` contains all styles including the notepad slide-up animation (`#notepad` / `#notepad.active`). `script.js` is a legacy stub; the notepad open/close state is now managed by React.

**Backend** (`server/server.js`)
- Express + `better-sqlite3` — synchronous SQLite driver (no async/await in DB calls).
- `notes.db` is created automatically in `server/` on first run.
- REST API: `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`. All routes return JSON; DELETE returns 204.
- CORS is open (`cors()` with no options) so the frontend can call from any port.

## Key Constraint

`API_BASE` is hardcoded to `http://localhost:3001` in `app.jsx`. If the backend port changes, update that constant.
