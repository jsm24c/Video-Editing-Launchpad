# Video-Editing-Launchpad

# Editing Launchpad    A simple launchpad with clickable icons that redirect to my editing tools, resources, and links.    

## Features   - Clickable icons for quick access to editing resources   - Clean and minimal HTML/CSS design   - Easy to customize  

## Includes LUT's, Text-To-Speech, Font Library, Video Downloader, and How-To's for various transitions and effects

## How to Run  

**Frontend (launchpad + notepad UI)**  
- Serve the project folder (e.g. VS Code Live Server, or `npx serve .`), then open the URL (e.g. http://localhost:3000).  
- Do not open `launchpad.html` as a file; the notepad needs to load `app.jsx` over HTTP.

**Backend (notes API)**  
- From the project root: `cd server` then `npm install` then `npm start`.  
- Server runs at http://localhost:3001. The React app talks to `http://localhost:3001/api/notes` for CRUD.

**Full stack**  
1. Start the backend: `cd server && npm start`.  
2. Start a static server for the frontend (e.g. `npx serve .` in the project root).  
3. Open the frontend URL in the browser; use "Open Notepad" to add, edit, and delete notes (stored in SQLite).
