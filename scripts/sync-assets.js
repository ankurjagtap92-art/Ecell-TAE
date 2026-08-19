import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure public directories exist and sync files from root
const dirsToSync = ['js', 'css', 'assets'];
for (const dir of dirsToSync) {
  const srcDir = path.join(rootDir, dir);
  const destDir = path.join(publicDir, dir);
  if (fs.existsSync(srcDir)) {
    copyDirRecursive(srcDir, destDir);
    console.log(`[sync-assets] Synced ${dir}/ -> public/${dir}/`);
  }
}

console.log('[sync-assets] All static assets successfully synchronized for Vercel/Netlify deployment.');
