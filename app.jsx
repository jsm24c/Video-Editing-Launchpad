const { useState, useEffect } = React;

// 1. The data — one array, one place to add/remove/edit tools
const TILES = [
  { id: 'tts', name: 'Text-to-Speech', url: 'https://start.elevenlabs.io/', image: 'tts.png' },
  { id: 'font', name: 'Font Picker', url: 'https://www.dafont.com/top.php', image: 'font.png' },
  { id: 'y2mate', name: 'Youtube Video Downloader', url: 'https://v4.www-y2mate.com/', image: 'y2mate.png' },
  { id: 'luts', name: 'LUTs', url: 'https://freshluts.com/luts', image: 'luts.png' },
  { id: 'howto', name: "How-To's", url: 'https://docs.google.com/document/d/12-C1Reu0s2bdL1LuW2Q5QjQM2PvrRY6flwyZX9jFI20/edit?tab=t.0', image: 'how to.png' }
];

const NOTEPAD_KEY = 'editing-launchpad-notes';

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

// 4. Notepad — slide-up panel, text saved to localStorage
function Notepad({ isOpen, onClose, content, setContent }) {
  return (
    <div id="notepad" className={isOpen ? 'active' : ''}>
      <textarea
        placeholder="Write your notes here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}

// 5. App — holds notepad state, loads/saves from localStorage
function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');

  // Load saved note when the app starts
  useEffect(() => {
    const saved = localStorage.getItem(NOTEPAD_KEY);
    if (saved != null) setContent(saved);
  }, []);

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem(NOTEPAD_KEY, content);
  }, [content]);

  return (
    <>
      <TileGrid tiles={TILES} />
      <button id="openNotepadBtn" type="button" onClick={() => setIsOpen(true)}>Open Notepad</button>
      <Notepad isOpen={isOpen} onClose={() => setIsOpen(false)} content={content} setContent={setContent} />
    </>
  );
}

// 6. Render the app into the page
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
