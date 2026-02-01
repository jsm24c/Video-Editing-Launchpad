// 1. The data — one array, one place to add/remove/edit tools
const TILES = [
  { id: 'tts', name: 'Text-to-Speech', url: 'https://start.elevenlabs.io/', image: 'tts.png' },
  { id: 'font', name: 'Font Picker', url: 'https://www.dafont.com/top.php', image: 'font.png' },
  { id: 'y2mate', name: 'Youtube Video Downloader', url: 'https://v4.www-y2mate.com/', image: 'y2mate.png' },
  { id: 'luts', name: 'LUTs', url: 'https://freshluts.com/luts', image: 'luts.png' },
  { id: 'howto', name: "How-To's", url: 'https://docs.google.com/document/d/12-C1Reu0s2bdL1LuW2Q5QjQM2PvrRY6flwyZX9jFI20/edit?tab=t.0', image: 'how to.png' },
  
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

// 4. Render the grid into the page
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<TileGrid tiles={TILES} />);
