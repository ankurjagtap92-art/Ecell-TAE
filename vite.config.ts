import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function syncStaticAssetsPlugin(): Plugin {
  const syncDirs = () => {
    const rootDir = process.cwd();
    const publicDir = path.resolve(rootDir, 'public');

    const copyRecursive = (src: string, dest: string) => {
      if (!fs.existsSync(src)) return;
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    ['js', 'css', 'assets'].forEach(dir => {
      const src = path.join(rootDir, dir);
      const dest = path.join(publicDir, dir);
      if (fs.existsSync(src)) {
        copyRecursive(src, dest);
      }
    });
  };

  return {
    name: 'sync-static-assets',
    buildStart() {
      syncDirs();
    },
    configureServer() {
      syncDirs();
    },
    closeBundle() {
      const rootDir = process.cwd();
      const distDir = path.resolve(rootDir, 'dist');
      if (fs.existsSync(distDir)) {
        const copyRecursive = (src: string, dest: string) => {
          if (!fs.existsSync(src)) return;
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
              copyRecursive(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };

        ['js', 'css', 'assets'].forEach(dir => {
          const src = path.join(rootDir, dir);
          const dest = path.join(distDir, dir);
          if (fs.existsSync(src)) {
            copyRecursive(src, dest);
          }
        });
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), syncStaticAssetsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
