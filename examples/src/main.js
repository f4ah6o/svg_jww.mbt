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

// Coordinate transform: JWW (Y-up) to SVG (Y-down)
class CoordinateTransform {
  constructor(jwwBounds) {
    this.minY = jwwBounds.minY;
    this.maxY = jwwBounds.maxY;
  }

  // Transform Y coordinate from JWW (Y-up) to SVG (Y-down)
  transformY(y) {
    return this.maxY - (y - this.minY);
  }
}

// Get the actual entity value (handle MoonBit enum encoding)
function getEntityValue(entity) {
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

// Group entities by layer
function groupEntitiesByLayer(jwwData) {
  const layers = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    name: `Layer ${i}`,
    entities: [],
    visible: true
  }));

  if (jwwData.entities && jwwData.entities.length > 0) {
    for (const entity of jwwData.entities) {
      const value = getEntityValue(entity);
      const base = value.base || {};
      const layerId = base.layer ?? 0;
      if (layers[layerId]) {
        layers[layerId].entities.push(entity);
      }
    }
  }

  return layers.filter(l => l.entities.length > 0);
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

  if (value.start_x !== undefined && value.end_x !== undefined && value.center_x === undefined) {
    return {
      minX: Math.min(value.start_x, value.end_x),
      minY: Math.min(value.start_y, value.end_y),
      maxX: Math.max(value.start_x, value.end_x),
      maxY: Math.max(value.start_y, value.end_y),
    };
  }
  if (value.center_x !== undefined && value.radius !== undefined) {
    const r = value.radius || 0;
    return {
      minX: value.center_x - r,
      minY: value.center_y - r,
      maxX: value.center_x + r,
      maxY: value.center_y + r,
    };
  }
  if (value.x !== undefined && value.y !== undefined && value.start_x === undefined) {
    return {
      minX: value.x - 5,
      minY: value.y - 5,
      maxX: value.x + 5,
      maxY: value.y + 5,
    };
  }
  if (value.content !== undefined) {
    return {
      minX: value.start_x,
      minY: value.start_y,
      maxX: value.end_x || value.start_x,
      maxY: value.end_y || value.start_y,
    };
  }
  return null;
}

// Render SVG for JWW data
function renderJWWToSVG(jwwData) {
  console.log('Rendering JWW data, entities:', jwwData.entities?.length);

  const bounds = calculateBounds(jwwData);
  const padding = 20;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;

  const coordTransform = new CoordinateTransform(bounds);
  const layerGroups = groupEntitiesByLayer(jwwData);

  // Calculate transformed bounds for viewBox
  const transformedMinY = coordTransform.transformY(bounds.maxY);
  const transformedMaxY = coordTransform.transformY(bounds.minY);

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX - padding} ${transformedMinY - padding} ${width} ${height}">
  <rect x="${bounds.minX - padding}" y="${transformedMinY - padding}" width="${width}" height="${height}" fill="white"/>
`;

  // Render each layer as a group
  for (const layer of layerGroups) {
    svg += `<g id="layer-${layer.id}" class="jww-layer" data-layer="${layer.id}">\n`;
    for (const entity of layer.entities) {
      svg += renderEntity(entity, coordTransform);
    }
    svg += `</g>\n`;
  }

  svg += `</svg>`;
  return { svgContent: svg, layerGroups };
}

function renderEntity(entity, coordTransform) {
  const value = getEntityValue(entity);
  const base = value.base || {};
  const color = getColor(base.pen_color);
  const strokeWidth = Math.max((base.pen_width || 1) * 0.5, 0.5);
  const type = getEntityType(value);

  switch (type) {
    case 'Line': {
      const x1 = value.start_x;
      const y1 = coordTransform.transformY(value.start_y);
      const x2 = value.end_x;
      const y2 = coordTransform.transformY(value.end_y);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
    }

    case 'Arc': {
      const cx = value.center_x;
      const cy = coordTransform.transformY(value.center_y);
      const r = value.radius || 0;
      if (value.is_full_circle) {
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
      }
      // Arc angles in radians - convert to degrees
      const startAngleRad = value.start_angle || 0;
      const arcAngleRad = value.arc_angle || 0;

      // Calculate start and end points
      const x1 = cx + r * Math.cos(startAngleRad);
      const y1 = cy - r * Math.sin(startAngleRad); // Y-flip for sine
      const endAngleRad = startAngleRad + arcAngleRad;
      const x2 = cx + r * Math.cos(endAngleRad);
      const y2 = cy - r * Math.sin(endAngleRad); // Y-flip for sine

      // SVG arc angle direction is opposite when Y is flipped
      const largeArc = Math.abs(arcAngleRad * 180 / Math.PI) > 180 ? 1 : 0;
      const sweep = arcAngleRad > 0 ? 0 : 1; // Sweep flag flips when Y is flipped

      return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>\n`;
    }

    case 'Point': {
      const x = value.x;
      const y = coordTransform.transformY(value.y);
      return `<circle cx="${x}" cy="${y}" r="2" fill="${color}"/>\n`;
    }

    case 'Text': {
      const textContent = (value.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const x = value.start_x;
      const y = coordTransform.transformY(value.start_y);
      const fontSize = Math.abs(value.size_y || 10);
      const angle = value.angle || 0;

      // Flip angle direction due to Y-axis flip
      const svgAngle = -angle;

      return `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" transform="rotate(${svgAngle}, ${x}, ${y})" style="font-family: sans-serif;">${textContent}</text>\n`;
    }

    case 'Solid': {
      const x1 = value.point1_x;
      const y1 = coordTransform.transformY(value.point1_y);
      const x2 = value.point2_x;
      const y2 = coordTransform.transformY(value.point2_y);
      const x3 = value.point3_x;
      const y3 = coordTransform.transformY(value.point3_y);
      const x4 = value.point4_x;
      const y4 = coordTransform.transformY(value.point4_y);
      return `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" fill="${color}" stroke="none"/>\n`;
    }

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

// Render layer control panel
function renderLayerControl(layerGroups) {
  let html = '<div id="layer-panel" style="position:fixed;top:10px;right:10px;background:rgba(255,255,255,0.95);padding:12px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;">';
  html += '<div style="font-weight:600;margin-bottom:10px;font-size:14px;color:#333;">Layers</div>';

  for (const layer of layerGroups) {
    const checked = layer.visible ? 'checked' : '';
    html += `<label style="display:flex;align-items:center;gap:8px;margin:6px 0;cursor:pointer;font-size:13px;color:#444;">
      <input type="checkbox" ${checked} data-layer="${layer.id}" class="layer-toggle" style="cursor:pointer;">
      <span>L${layer.id}</span>
      <span style="color:#999;font-size:11px;">(${layer.entities.length})</span>
    </label>`;
  }
  html += '</div>';
  return html;
}

// Setup layer toggle handlers
function setupLayerToggle() {
  document.querySelectorAll('.layer-toggle').forEach(cb => {
    cb.addEventListener('change', e => {
      const layerId = e.target.dataset.layer;
      const layerGroup = document.getElementById(`layer-${layerId}`);
      if (layerGroup) {
        layerGroup.style.visibility = e.target.checked ? 'visible' : 'hidden';
      }
    });
  });
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
    const { svgContent, layerGroups } = renderJWWToSVG(jwwData);

    // Update app
    const app = document.getElementById('app');
    const appState = createDefaultAppState();
    app.innerHTML = render_app_html(appState, svgContent);

    // Add layer control panel
    app.insertAdjacentHTML('beforeend', renderLayerControl(layerGroups));
    setupLayerToggle();

    console.log('JWW file loaded:', file.name);
    console.log('Layers:', layerGroups.map(l => `${l.id}:${l.entities.length}`).join(', '));
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
