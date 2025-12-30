import { render_app_html } from 'svg-jww-viewer-mbt';
import { parse, to_json_string } from 'jww-parser-mbt';

// Create default AppState (matches MoonBit AppState::new())
function createDefaultAppState() {
  return {
    viewport: {
      scale: 1.0,
      offset_x: 0.0,
      offset_y: 0.0,
      width: 800.0,
      height: 600.0,
    },
    layers: [
      { layer_id: 0, name: "Layer 0", visible: true, locked: false },
      { layer_id: 1, name: "Layer 1", visible: true, locked: false },
      { layer_id: 2, name: "Layer 2", visible: true, locked: false },
    ],
    selection: {
      selected_ids: [],
      hovered_id: "",
    },
    background_color: "#ffffff",
    show_grid: false,
    show_ruler: false,
  };
}

// Simple SVG renderer for JWW data
function renderJWWToSVG(jwwData) {
  const bounds = calculateBounds(jwwData);
  const padding = 20;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}" width="${width}" height="${height}">
  <rect x="${bounds.minX - padding}" y="${bounds.minY - padding}" width="${width}" height="${height}" fill="white"/>
`;

  // Render entities
  if (jwwData.entities) {
    for (const entity of jwwData.entities) {
      svg += renderEntity(entity, jwwData);
    }
  }

  svg += `</svg>`;
  return svg;
}

function calculateBounds(jwwData) {
  let minX = 0, minY = 0, maxX = 400, maxY = 300;

  if (jwwData.entities && jwwData.entities.length > 0) {
    minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const entity of jwwData.entities) {
      const bounds = getEntityBounds(entity);
      if (bounds) {
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
      }
    }

    if (minX === Infinity) {
      minX = 0, minY = 0, maxX = 400, maxY = 300;
    }
  }

  return { minX, minY, maxX, maxY };
}

function getEntityBounds(entity) {
  switch (entity.type) {
    case 'LineEnt':
      return {
        minX: Math.min(entity.p1.x, entity.p2.x),
        minY: Math.min(entity.p1.y, entity.p2.y),
        maxX: Math.max(entity.p1.x, entity.p2.x),
        maxY: Math.max(entity.p1.y, entity.p2.y),
      };
    case 'ArcEnt':
    case 'CircleEnt':
      const r = entity.radius || 0;
      return {
        minX: entity.center.x - r,
        minY: entity.center.y - r,
        maxX: entity.center.x + r,
        maxY: entity.center.y + r,
      };
    case 'PointEnt':
      return {
        minX: entity.x - 5,
        minY: entity.y - 5,
        maxX: entity.x + 5,
        maxY: entity.y + 5,
      };
    default:
      return null;
  }
}

function renderEntity(entity, jwwData) {
  const color = getColor(entity.penColor);
  const strokeWidth = (entity.lineWeight || 1) * 0.1;

  switch (entity.type) {
    case 'LineEnt':
      return `<line x1="${entity.p1.x}" y1="${entity.p1.y}" x2="${entity.p2.x}" y2="${entity.p2.y}" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;

    case 'ArcEnt':
    case 'CircleEnt':
      const cx = entity.center.x;
      const cy = entity.center.y;
      const r = entity.radius || 0;
      // For full circle, use circle element
      if (entity.startAngle === undefined && entity.endAngle === undefined) {
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
      }
      // For arc, use path
      const startAngle = entity.startAngle || 0;
      const endAngle = entity.endAngle || 360;
      const x1 = cx + r * Math.cos(startAngle * Math.PI / 180);
      const y1 = cy + r * Math.sin(startAngle * Math.PI / 180);
      const x2 = cx + r * Math.cos(endAngle * Math.PI / 180);
      const y2 = cy + r * Math.sin(endAngle * Math.PI / 180);
      const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;

    case 'PointEnt':
      return `<circle cx="${entity.x}" cy="${entity.y}" r="2" fill="${color}"/>\n`;

    case 'TextEnt':
      return `<text x="${entity.x}" y="${entity.y}" font-size="${entity.height || 10}" fill="${color}">${entity.text || ''}</text>\n`;

    case 'PolylineEnt':
      if (entity.points && entity.points.length > 0) {
        const points = entity.points.map(p => `${p.x},${p.y}`).join(' ');
        return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
      }
      return '';

    default:
      return `<!-- Unhandled entity type: ${entity.type} -->\n`;
  }
}

function getColor(penColor) {
  const colors = [
    '#ffffff', // 0: white
    '#000000', // 1: black
    '#ff0000', // 2: red
    '#00ff00', // 3: green
    '#0000ff', // 4: blue
    '#ffff00', // 5: yellow
    '#ff00ff', // 6: magenta
    '#00ffff', // 7: cyan
    '#ff8000', // 8: orange
    '#808080', // 9: gray
  ];
  const idx = Math.min(Math.max(penColor || 1, 0), colors.length - 1);
  return colors[idx];
}

// Demo SVG
function demoSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect x="0" y="0" width="400" height="300" fill="white"/>
  <g stroke="#e0e0e0" stroke-width="1">
    <line x1="0" y1="0" x2="400" y2="0"/>
    <line x1="0" y1="50" x2="400" y2="50"/>
    <line x1="0" y1="100" x2="400" y2="100"/>
    <line x1="0" y1="150" x2="400" y2="150"/>
    <line x1="0" y1="200" x2="400" y2="200"/>
    <line x1="0" y1="250" x2="400" y2="250"/>
    <line x1="0" y1="0" x2="0" y2="300"/>
    <line x1="50" y1="0" x2="50" y2="300"/>
    <line x1="100" y1="0" x2="100" y2="300"/>
    <line x1="150" y1="0" x2="150" y2="300"/>
    <line x1="200" y1="0" x2="200" y2="300"/>
    <line x1="250" y1="0" x2="250" y2="300"/>
    <line x1="300" y1="0" x2="300" y2="300"/>
    <line x1="350" y1="0" x2="350" y2="300"/>
    <line x1="400" y1="0" x2="400" y2="300"/>
  </g>
  <circle cx="200" cy="150" r="50" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="200" cy="150" r="5" fill="#2563eb"/>
  <text x="200" y="250" text-anchor="middle" font-size="14" fill="#666">JWW Viewer - Load a .jww file to view</text>
</svg>`;
}

// Render file picker UI
function renderFilePicker() {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f5f5f5;">
      <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
        <h1 style="margin-bottom: 20px; color: #333;">SVG JWW Viewer</h1>
        <p style="margin-bottom: 30px; color: #666;">Select a JWW file to view</p>
        <input type="file" id="fileInput" accept=".jww" style="display: none;">
        <button onclick="document.getElementById('fileInput').click()"
                style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 4px;">
          Select JWW File
        </button>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">Or drag and drop a .jww file here</p>
      </div>
    </div>
  `;
}

// Parse and render JWW file
async function loadJWWFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Parse JWW file
    const jwwData = parse(uint8Array);

    // Render to SVG
    const svgContent = renderJWWToSVG(jwwData);

    // Update app
    const app = document.getElementById('app');
    const appState = createDefaultAppState();
    app.innerHTML = render_app_html(appState, svgContent);

    console.log('JWW file loaded:', file.name);
    console.log('Parsed data:', jwwData);
  } catch (error) {
    console.error('Error loading JWW file:', error);
    alert('Error loading JWW file: ' + error.message);
  }
}

// Initialize app
function init() {
  const app = document.getElementById('app');

  // Show file picker
  app.innerHTML = renderFilePicker();

  // Set up file input handler
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadJWWFile(file);
    }
  });

  // Set up drag and drop
  document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.jww') || file.name.endsWith('.JWW'))) {
      loadJWWFile(file);
    }
  });

  console.log('SVG JWW Viewer initialized');
}

init();
