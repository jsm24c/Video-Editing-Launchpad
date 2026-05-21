const { useState, useEffect, useRef } = React;

const API_BASE = 'http://localhost:3001';

const TILES = [
  { id: 'tts', name: 'Text-to-Speech', url: 'https://start.elevenlabs.io/', image: 'images/tts.png' },
  { id: 'font', name: 'Font Picker', url: 'https://www.dafont.com/top.php', image: 'images/font.png' },
  { id: 'y2mate', name: 'Youtube Video Downloader', url: 'https://v4.www-y2mate.com/', image: 'images/y2mate.png' },
  { id: 'luts', name: 'LUTs', url: 'https://freshluts.com/luts', image: 'images/luts.png' },
  { id: 'howto', name: "How-To's", url: 'https://docs.google.com/document/d/12-C1Reu0s2bdL1LuW2Q5QjQM2PvrRY6flwyZX9jFI20/edit?tab=t.0', image: 'images/how to.png' },
  { id: 'SFX', name: "SFX", url: 'https://pixabay.com/', image: 'images/how to.png' }
];

// Storyboard constants
const NODE_W = 180;
const NODE_H = 100;
const CANVAS_W = 3000;
const CANVAS_H = 1600;

let _nextId = 1;
function uid() { return _nextId++; }

// ---- Tile & TileGrid ----

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

function TileGrid({ tiles }) {
  return (
    <div className="icon-row">
      {tiles.map((tile) => (
        <Tile key={tile.id} name={tile.name} url={tile.url} image={tile.image} />
      ))}
    </div>
  );
}

// ---- Tab Nav ----

function TabNav({ activeTab, setActiveTab }) {
  return (
    <nav className="tab-nav">
      <span className="tab-nav-logo">Editing Launchpad</span>
      <button
        className={`tab-btn${activeTab === 'launchpad' ? ' active' : ''}`}
        onClick={() => setActiveTab('launchpad')}
      >
        Launchpad
      </button>
      <button
        className={`tab-btn${activeTab === 'storyboard' ? ' active' : ''}`}
        onClick={() => setActiveTab('storyboard')}
      >
        Storyboard
      </button>
    </nav>
  );
}

// ---- Storyboard helpers ----

function bezierParts(fromNode, toNode) {
  const sx = fromNode.x + NODE_W, sy = fromNode.y + NODE_H / 2;
  const tx = toNode.x,            ty = toNode.y + NODE_H / 2;
  const cx1 = sx + 70, cy1 = sy;
  const cx2 = tx - 70, cy2 = ty;
  const d = `M${sx},${sy} C${cx1},${cy1} ${cx2},${cy2} ${tx},${ty}`;
  // De Casteljau midpoint at t=0.5
  const t = 0.5;
  const mt = 1 - t;
  const midX = mt*mt*mt*sx + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*tx;
  const midY = mt*mt*mt*sy + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*ty;
  return { d, sx, sy, cx1, cy1, cx2, cy2, tx, ty, midX, midY };
}

// ---- StoryboardView ----

function StoryboardView() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);   // { nodeId, offsetX, offsetY }
  const [connecting, setConnecting] = useState(null); // { fromNodeId, mouseX, mouseY }
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const canvasRef = useRef(null);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + canvasRef.current.scrollLeft,
      y: e.clientY - rect.top  + canvasRef.current.scrollTop,
    };
  };

  const addNode = () => {
    const id = uid();
    const lastNode = nodes[nodes.length - 1];
    const x = lastNode ? lastNode.x + NODE_W + 80 : 80;
    const y = lastNode ? lastNode.y : 200;
    setNodes(prev => [...prev, { id, x, y, label: '' }]);
    if (lastNode) {
      setEdges(prev => [...prev, { id: uid(), fromId: lastNode.id, toId: id, label: 'cut' }]);
    }
    setTimeout(() => {
      const el = document.getElementById(`sb-ta-${id}`);
      if (el) el.focus();
    }, 30);
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.fromId !== nodeId && e.toId !== nodeId));
  };

  const updateNodeLabel = (nodeId, label) =>
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, label } : n));

  const updateEdgeLabel = (edgeId, label) =>
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, label } : e));

  const deleteEdge = (edgeId) =>
    setEdges(prev => prev.filter(e => e.id !== edgeId));

  const handleCanvasMouseMove = (e) => {
    if (!dragging && !connecting) return;
    const pos = getCanvasPos(e);
    if (dragging) {
      setNodes(prev => prev.map(n =>
        n.id === dragging.nodeId
          ? { ...n, x: pos.x - dragging.offsetX, y: pos.y - dragging.offsetY }
          : n
      ));
    }
    if (connecting) {
      setConnecting(prev => ({ ...prev, mouseX: pos.x, mouseY: pos.y }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDragging(null);
    setConnecting(null);
  };

  const startDrag = (e, nodeId) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    const node = nodes.find(n => n.id === nodeId);
    setDragging({ nodeId, offsetX: pos.x - node.x, offsetY: pos.y - node.y });
  };

  const startConnect = (e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    const pos = getCanvasPos(e);
    setConnecting({ fromNodeId: nodeId, mouseX: pos.x, mouseY: pos.y });
  };

  const finishConnect = (e, toNodeId) => {
    e.stopPropagation();
    if (!connecting || connecting.fromNodeId === toNodeId) {
      setConnecting(null);
      return;
    }
    setEdges(prev => {
      const filtered = prev.filter(e => e.fromId !== connecting.fromNodeId);
      return [...filtered, { id: uid(), fromId: connecting.fromNodeId, toId: toNodeId, label: 'cut' }];
    });
    setConnecting(null);
  };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Temp connecting line while dragging from port
  let tempPath = null;
  if (connecting) {
    const fn = nodeMap[connecting.fromNodeId];
    if (fn) {
      const sx = fn.x + NODE_W, sy = fn.y + NODE_H / 2;
      const mx = connecting.mouseX, my = connecting.mouseY;
      tempPath = `M${sx},${sy} C${sx + 60},${sy} ${mx - 60},${my} ${mx},${my}`;
    }
  }

  return (
    <div className="sb-view">
      <div className="sb-sidebar">
        <p className="sb-sidebar-title">Storyboard</p>
        <button className="sb-add-btn" onClick={addNode}>+ Add Clip</button>
        {nodes.length > 0 && (
          <span className="sb-clip-count">{nodes.length} clip{nodes.length !== 1 ? 's' : ''}</span>
        )}
        <p className="sb-hint">
          Drag nodes anywhere to rearrange<br />
          Drag ● to connect two nodes<br />
          Click an arrow to delete it
        </p>
      </div>

      <div
        className="sb-canvas"
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* SVG arrow layer */}
        <svg
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          <defs>
            <marker id="sb-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(0,180,216,0.85)" />
            </marker>
          </defs>

          {edges.map(edge => {
            const from = nodeMap[edge.fromId];
            const to   = nodeMap[edge.toId];
            if (!from || !to) return null;
            const { d } = bezierParts(from, to);
            return (
              <g key={edge.id}>
                <path d={d} stroke="rgba(0,180,216,0.7)" strokeWidth="2" fill="none" markerEnd="url(#sb-arrow)" />
                {/* Wide invisible hit area for click-to-delete */}
                <path
                  d={d}
                  stroke="transparent"
                  strokeWidth="18"
                  fill="none"
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onClick={() => deleteEdge(edge.id)}
                />
              </g>
            );
          })}

          {tempPath && (
            <path
              d={tempPath}
              stroke="rgba(0,212,255,0.55)"
              strokeWidth="2"
              strokeDasharray="6 4"
              fill="none"
            />
          )}
        </svg>

        {/* Edge transition labels (rendered as HTML over the SVG) */}
        {edges.map(edge => {
          const from = nodeMap[edge.fromId];
          const to   = nodeMap[edge.toId];
          if (!from || !to) return null;
          const { midX, midY } = bezierParts(from, to);
          return (
            <div
              key={edge.id}
              className="sb-edge-label"
              style={{ left: midX, top: midY }}
              onClick={() => setEditingEdgeId(edge.id)}
            >
              {editingEdgeId === edge.id ? (
                <input
                  className="sb-edge-input"
                  autoFocus
                  value={edge.label}
                  onChange={e => updateEdgeLabel(edge.id, e.target.value)}
                  onBlur={() => setEditingEdgeId(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingEdgeId(null); e.stopPropagation(); }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span>{edge.label || 'cut'}</span>
              )}
            </div>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="sb-node"
            style={{ left: node.x, top: node.y }}
            onMouseDown={e => startDrag(e, node.id)}
          >
            <div
              className="sb-port sb-port-in"
              onMouseUp={e => finishConnect(e, node.id)}
            />

            <textarea
              id={`sb-ta-${node.id}`}
              className="sb-node-textarea"
              placeholder="Clip description…"
              value={node.label}
              onChange={e => updateNodeLabel(node.id, e.target.value)}
              onMouseDown={e => e.stopPropagation()}
            />

            <button
              className="sb-node-delete"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => deleteNode(node.id)}
              title="Delete node"
            >×</button>

            <div
              className="sb-port sb-port-out"
              onMouseDown={e => startConnect(e, node.id)}
              title="Drag to connect"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Notepad ----

function Notepad({ isOpen, onClose, notes, onRefresh, apiBase }) {
  const [editingNote, setEditingNote] = useState(null);
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

      {editingNote !== null ? (
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

// ---- App ----

function App() {
  const [activeTab, setActiveTab] = useState('launchpad');
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

  useEffect(() => { fetchNotes(); }, []);

  return (
    <>
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'launchpad' ? (
        <>
          <header className="launchpad-header">
            <h1>Editing Launchpad</h1>
            <p>Your tools, one click away</p>
          </header>
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
      ) : (
        <StoryboardView />
      )}
    </>
  );
}

// ---- Mount ----
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
