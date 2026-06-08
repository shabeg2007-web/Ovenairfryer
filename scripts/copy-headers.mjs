import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const src = path.join(cwd, 'public', '_headers');
const destDir = path.join(cwd, 'dist');
const dest = path.join(destDir, '_headers');

if (!fs.existsSync(src)) {
  console.warn('[copy-headers] public/_headers not found; skipping copy.');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

console.log(`[copy-headers] Copied ${src} -> ${dest}`);
