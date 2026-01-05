// Utility functions for JWW viewer

// Get screen size for responsive layout
export function getScreenSize() {
  const width = window.innerWidth;
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  return 'desktop';
}

// Check if device supports touch
export function isTouchDevice() {
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         navigator.msMaxTouchPoints > 0;
}

// Calculate distance between two touch points for pinch zoom
export function getTouchDistance(touches) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get paper size name string
export function getPaperSizeString(paperSize) {
  const names = { 0: 'A0', 1: 'A1', 2: 'A2', 3: 'A3', 4: 'A4', 8: '2A', 9: '3A' };
  return names[paperSize] || 'Unknown';
}
