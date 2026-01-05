// Image management for JWW viewer

import { themes, currentTheme } from './theme.js';

// Image state management
export const imageState = {
  images: new Map()
};

// Placeholder visibility state
export const placeholderVisibility = new Map();

// Extract filename from image path
export function extractFileName(imagePath) {
  // Remove %temp% prefix and convert backslashes to forward slashes
  const cleanPath = imagePath.replace(/^%[^%]*%/, '').replace(/\\/g, '/');
  // Extract filename from path
  const parts = cleanPath.split('/');
  return parts[parts.length - 1] || imagePath;
}

// Resolve image path relative to JWW file directory
export function resolveImagePath(imagePath, jwwFileName) {
  if (!jwwFileName) return imagePath;

  // JWWファイルのディレクトリを取得
  const lastSlash = Math.max(jwwFileName.lastIndexOf('/'), jwwFileName.lastIndexOf('\\'));
  const jwwDir = lastSlash >= 0 ? jwwFileName.substring(0, lastSlash + 1) : '';

  // パスから%temp%等のプレフィックスを削除
  let cleanPath = imagePath.replace(/^%[^%]*%/, '');

  // Windowsパス区切りをスラッシュに変換
  cleanPath = cleanPath.replace(/\\/g, '/');

  // 相対パスを解決
  return jwwDir + cleanPath;
}

// Setup image load detection and placeholders
export function setupImageLoadDetection() {
  const images = document.querySelectorAll('image.jww-image');

  // Clear previous state
  imageState.images.clear();

  images.forEach(imgEl => {
    const imagePath = imgEl.dataset.imagePath;
    const imageId = imgEl.id;
    const fileName = imgEl.dataset.fileName;

    // Register image in state
    imageState.images.set(imageId, {
      id: imageId,
      originalPath: imagePath,
      resolvedPath: imgEl.getAttribute('href'),
      status: 'loading',
      blobUrl: null,
      fileName: fileName
    });

    // Load success handler
    imgEl.addEventListener('load', () => {
      const imgData = imageState.images.get(imageId);
      if (imgData) {
        imgData.status = 'loaded';
      }
      imgEl.dataset.status = 'loaded';
      renderImageList();
    });

    // Load error handler - show placeholder
    imgEl.addEventListener('error', () => {
      const imgData = imageState.images.get(imageId);
      if (imgData) {
        imgData.status = 'missing';
      }
      imgEl.dataset.status = 'missing';
      showImagePlaceholder(imgEl);
      renderImageList();
    });
  });

  // Update image count
  const countEl = document.getElementById('jww-image-count');
  if (countEl) {
    countEl.textContent = imageState.images.size;
  }

  renderImageList();
}

// Show placeholder for missing image
export function showImagePlaceholder(imgEl) {
  const x = imgEl.getAttribute('x');
  const y = imgEl.getAttribute('y');
  const width = parseFloat(imgEl.getAttribute('width'));
  const height = parseFloat(imgEl.getAttribute('height'));
  const fileName = imgEl.dataset.fileName;
  const placeholderId = `${imgEl.id}-placeholder`;

  // Check if placeholder already exists
  if (document.getElementById(placeholderId)) return;

  const theme = themes[currentTheme];
  const placeholder = `
    <g id="${placeholderId}" class="image-placeholder">
      <rect x="${x}" y="${y}" width="${width}" height="${height}"
            fill="${theme.bg}" fill-opacity="0.3" stroke="#e53e3e" stroke-width="2" stroke-dasharray="5,5"/>
    </g>
  `;

  imgEl.insertAdjacentHTML('beforebegin', placeholder);
  imgEl.style.display = 'none';
}

// Toggle placeholder visibility
export function togglePlaceholder(id) {
  const current = placeholderVisibility.get(id) ?? true;
  placeholderVisibility.set(id, !current);
  const placeholder = document.getElementById(`${id}-placeholder`);
  if (placeholder) {
    placeholder.style.display = !current ? 'inline' : 'none';
  }
  renderImageList();
}

// Truncate text to max length
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Render image list in control panel
export function renderImageList() {
  const container = document.getElementById('jww-image-list');
  if (!container) return;

  if (imageState.images.size === 0) {
    container.innerHTML = '<div style="font-size: 12px; color: #999;">画像なし</div>';
    return;
  }

  let html = '';
  for (const [id, img] of imageState.images) {
    let statusIcon, statusColor;
    switch (img.status) {
      case 'loaded':
        statusIcon = '✓';
        statusColor = '#28a745';
        break;
      case 'missing':
        statusIcon = '✗';
        statusColor = '#dc3545';
        break;
      case 'replaced':
        statusIcon = '↻';
        statusColor = '#007bff';
        break;
      default:
        statusIcon = '⋯';
        statusColor = '#999';
    }

    html += `
      <div style="
        padding: 6px;
        margin-bottom: 4px;
        border-radius: 4px;
        background: ${img.status === 'missing' ? '#fff5f5' : 'transparent'};
        border: 1px solid ${img.status === 'missing' ? '#fed7d7' : 'transparent'};
      ">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
          <span style="color: ${statusColor}; font-weight: bold;">${statusIcon}</span>
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${truncateText(img.fileName, 20)}</span>
        </div>
        ${img.status === 'missing' ? `
          <div style="display: flex; gap: 4px; margin-top: 4px;">
            <label style="
              display: inline-block;
              padding: 4px 8px;
              font-size: 11px;
              background: #007bff;
              color: white;
              border-radius: 4px;
              cursor: pointer;
            ">
              選択
              <input type="file" accept="image/*" data-image-id="${id}" class="img-upload" style="display: none;">
            </label>
            <button type="button" data-placeholder-id="${id}" class="placeholder-toggle" style="
              display: inline-block;
              padding: 4px 8px;
              font-size: 11px;
              background: #6c757d;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">
              ${placeholderVisibility.get(id) === false ? '表示' : '非表示'}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  container.innerHTML = html;

  // Setup upload handlers
  container.querySelectorAll('.img-upload').forEach(input => {
    input.addEventListener('change', handleImageUpload);
  });

  // Setup toggle handlers
  container.querySelectorAll('.placeholder-toggle').forEach(btn => {
    btn.addEventListener('click', () => togglePlaceholder(btn.dataset.placeholderId));
  });
}

// Handle image file upload
export function handleImageUpload(e) {
  const input = e.target;
  const imageId = input.dataset.imageId;
  const file = input.files[0];

  if (!file || !imageId) return;

  const imgData = imageState.images.get(imageId);
  if (!imgData) return;

  // Create blob URL for uploaded file
  const blobUrl = URL.createObjectURL(file);

  // Revoke old blob URL if exists
  if (imgData.blobUrl) {
    URL.revokeObjectURL(imgData.blobUrl);
  }

  imgData.blobUrl = blobUrl;
  imgData.status = 'replaced';

  // Update SVG element
  const imgEl = document.getElementById(imageId);
  if (imgEl) {
    imgEl.setAttribute('href', blobUrl);
    imgEl.style.display = '';
    imgEl.dataset.status = 'replaced';
  }

  // Remove placeholder
  const placeholder = document.getElementById(`${imageId}-placeholder`);
  if (placeholder) {
    placeholder.remove();
  }

  // Update list UI
  renderImageList();
}
