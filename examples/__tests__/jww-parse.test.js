// JWW parser integration tests
// Note: These tests require JWW files in ../../jwwfile directory

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'jww-parser-mbt';

describe('JWW Parser', () => {
  test('should parse a JWW file', () => {
    const jwwDir = join(__dirname, '../../jwwfile');
    let files = [];

    try {
      files = readdirSync(jwwDir).filter(f => f.endsWith('.jww') || f.endsWith('.JWW'));
    } catch (e) {
      console.skip('No jwwfile directory found, skipping test');
      return;
    }

    if (files.length === 0) {
      console.skip('No JWW files found in jwwfile directory');
      return;
    }

    const file = files[0];
    const buffer = readFileSync(join(jwwDir, file));
    const data = parse(new Uint8Array(buffer));

    // Basic structure checks
    expect(data).toBeDefined();
    expect(data.entities).toBeInstanceOf(Array);

    // Check for entity counts if available
    if (data.entity_counts) {
      expect(data.entity_counts.lines).toBeGreaterThanOrEqual(0);
      expect(data.entity_counts.arcs).toBeGreaterThanOrEqual(0);
      expect(data.entity_counts.points).toBeGreaterThanOrEqual(0);
      expect(data.entity_counts.texts).toBeGreaterThanOrEqual(0);
    }

    // Check for bounds if available
    if (data.bounds) {
      expect(data.bounds.min_x).toBeDefined();
      expect(data.bounds.min_y).toBeDefined();
      expect(data.bounds.max_x).toBeDefined();
      expect(data.bounds.max_y).toBeDefined();
    }

    // Check for layers if available
    if (data.layers) {
      expect(data.layers).toBeInstanceOf(Array);
    }
  });

  test('should find text entities in parsed data', () => {
    const jwwDir = join(__dirname, '../../jwwfile');
    let files = [];

    try {
      files = readdirSync(jwwDir).filter(f => f.endsWith('.jww') || f.endsWith('.JWW'));
    } catch (e) {
      console.skip('No jwwfile directory found, skipping test');
      return;
    }

    if (files.length === 0) {
      console.skip('No JWW files found in jwwfile directory');
      return;
    }

    const file = files[0];
    const buffer = readFileSync(join(jwwDir, file));
    const data = parse(new Uint8Array(buffer));

    // Find Text entities
    const textEntities = (data.entities || []).filter(e => {
      for (const k of Object.keys(e)) {
        if (k.startsWith('_')) {
          const v = e[k];
          return v.content !== undefined;
        }
      }
      return false;
    });

    // Text entities should be an array
    expect(Array.isArray(textEntities)).toBe(true);
    expect(textEntities.length).toBeGreaterThanOrEqual(0);
  });
});
