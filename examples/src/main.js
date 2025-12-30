import { render_app_html } from 'svg-jww-viewer-mbt';
import { parse } from 'jww-parser-mbt';

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

// Get the actual entity value (handle MoonBit enum encoding)
function getEntityValue(entity) {
  // MoonBit enums in JS are encoded as { "_0": value } or { "_1": value } etc.
  // We need to find which key has the value
  for (const key of Object.keys(entity)) {
    if (key.startsWith('_')) {
      return entity[key];
    }
  }
  return entity;
}

// Determine entity type by checking which fields exist
function getEntityType(value) {
  if (value.start_x !== undefined && value.end_x !== undefined && value.center_x === undefined) {
    return 'Line';
  }
  if (value.center_x !== undefined && value.radius !== undefined) {
    return 'Arc';
  }
  if (value.x !== undefined && value.y !== undefined && value.start_x === undefined && value.content === undefined) {
    return 'Point';
  }
  if (value.content !== undefined) {
    return 'Text';
  }
  if (value.point1_x !== undefined) {
    return 'Solid';
  }
  if (value.def_number !== undefined) {
    return 'Block';
  }
  return 'Unknown';
}

// Simple SVG renderer for JWW data
function renderJWWToSVG(jwwData) {
  console.log('Rendering JWW data, entities:', jwwData.entities?.length);

  const bounds = calculateBounds(jwwData);
  const padding = 20;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}">
  <rect x="${bounds.minX - padding}" y="${bounds.minY - padding}" width="${width}" height="${height}" fill="white"/>
`;

  // Render entities
  if (jwwData.entities && jwwData.entities.length > 0) {
    for (const entity of jwwData.entities) {
      svg += renderEntity(entity);
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
  const value = getEntityValue(entity);
  const base = value.base || {};

  if (value.start_x !== undefined && value.end_x !== undefined && value.center_x === undefined) {
    // Line
    return {
      minX: Math.min(value.start_x, value.end_x),
      minY: Math.min(value.start_y, value.end_y),
      maxX: Math.max(value.start_x, value.end_x),
      maxY: Math.max(value.start_y, value.end_y),
    };
  }
  if (value.center_x !== undefined && value.radius !== undefined) {
    // Arc
    const r = value.radius || 0;
    return {
      minX: value.center_x - r,
      minY: value.center_y - r,
      maxX: value.center_x + r,
      maxY: value.center_y + r,
    };
  }
  if (value.x !== undefined && value.y !== undefined && value.start_x === undefined) {
    // Point
    return {
      minX: value.x - 5,
      minY: value.y - 5,
      maxX: value.x + 5,
      maxY: value.y + 5,
    };
  }
  if (value.content !== undefined) {
    // Text
    return {
      minX: value.start_x,
      minY: value.start_y,
      maxX: value.end_x || value.start_x,
      maxY: value.end_y || value.start_y,
    };
  }
  return null;
}

function renderEntity(entity) {
  const value = getEntityValue(entity);
  const base = value.base || {};
  const color = getColor(base.pen_color);
  const strokeWidth = Math.max((base.pen_width || 1) * 0.5, 0.5);
  const type = getEntityType(value);

  switch (type) {
    case 'Line':
      return `<line x1="${value.start_x}" y1="${value.start_y}" x2="${value.end_x}" y2="${value.end_y}" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;

    case 'Arc':
      const cx = value.center_x;
      const cy = value.center_y;
      const r = value.radius || 0;
      if (value.is_full_circle) {
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
      }
      // Arc - convert radians to degrees
      const startAngleDeg = (value.start_angle || 0) * 180 / Math.PI;
      const arcAngleDeg = (value.arc_angle || 0) * 180 / Math.PI;
      const endAngleDeg = startAngleDeg + arcAngleDeg;
      const x1 = cx + r * Math.cos(startAngleDeg * Math.PI / 180);
      const y1 = cy + r * Math.sin(startAngleDeg * Math.PI / 180);
      const x2 = cx + r * Math.cos(endAngleDeg * Math.PI / 180);
      const y2 = cy + r * Math.sin(endAngleDeg * Math.PI / 180);
      const largeArc = Math.abs(arcAngleDeg) > 180 ? 1 : 0;
      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;

    case 'Point':
      return `<circle cx="${value.x}" cy="${value.y}" r="2" fill="${color}"/>\n`;

    case 'Text':
      const textContent = (value.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<text x="${value.start_x}" y="${value.start_y}" font-size="${value.size_y || 10}" fill="${color}">${textContent}</text>\n`;

    case 'Solid':
      return `<polygon points="${value.point1_x},${value.point1_y} ${value.point2_x},${value.point2_y} ${value.point3_x},${value.point3_y} ${value.point4_x},${value.point4_y}" fill="${color}" stroke="none"/>\n`;

    case 'Block':
      return `<!-- Block entity: def_number=${value.def_number} -->\n`;

    default:
      return `<!-- Unhandled entity type: ${type} -->\n`;
  }
}

function getColor(penColor) {
  const idx = penColor || 1;
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
  return colors[Math.min(idx, colors.length - 1)];
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
    console.log('Parsed JWW data:', jwwData);
    console.log('Entities count:', jwwData.entities?.length);

    // Render to SVG
    const svgContent = renderJWWToSVG(jwwData);

    // Update app
    const app = document.getElementById('app');
    const appState = createDefaultAppState();
    app.innerHTML = render_app_html(appState, svgContent);

    console.log('JWW file loaded:', file.name);
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
