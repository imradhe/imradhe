import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'client',
  publicDir: false,
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true, assetsDir: 'static' },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8080',
      '/assets': 'http://127.0.0.1:8080',
      '/img': 'http://127.0.0.1:8080',
      '/health': 'http://127.0.0.1:8080'
    }
  },
  test: { environment: 'jsdom', include: ['src/**/*.test.{js,jsx}'], setupFiles: ['src/test-setup.js'] }
});
