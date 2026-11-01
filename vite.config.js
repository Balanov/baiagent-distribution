import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    outDir: 'dist',
  },
  test: { environment: 'node', include: ['tests/**/*.test.js', 'shared/**/*.test.js'] },
});
