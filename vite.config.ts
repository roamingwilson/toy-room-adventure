import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build: dist/index.html contains everything, so it can be
// opened straight from a USB stick / desktop with no server or internet.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
});
