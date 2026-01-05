// Theme management for JWW viewer

// Theme definitions
export const themes = {
  system: { name: 'System', bg: '#000000', textColor: '#ffffff' },
  solarizedLight: { name: 'Solarized Light', bg: '#fdf6e3', textColor: '#657b83' },
  solarizedDark: { name: 'Solarized Dark', bg: '#002b36', textColor: '#839496' }
};

export let currentTheme = 'system';

// Set theme and update SVG background, text colors, and placeholder colors
export function setTheme(themeName) {
  if (!themes[themeName]) return;
  currentTheme = themeName;

  const svg = document.querySelector('#jww-canvas svg');
  if (svg) {
    // Update SVG background rect
    const bgRect = svg.querySelector('rect:first-child');
    if (bgRect) {
      bgRect.setAttribute('fill', themes[themeName].bg);
    }

    // Update text colors
    svg.querySelectorAll('text.jww-text').forEach(textEl => {
      textEl.setAttribute('fill', themes[themeName].textColor);
    });

    // Update placeholder fill colors
    svg.querySelectorAll('rect[fill-opacity="0.3"]').forEach(rect => {
      rect.setAttribute('fill', themes[themeName].bg);
    });
  }
}
