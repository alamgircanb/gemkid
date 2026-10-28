import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites live under /<repo>/. Override with VITE_BASE=/ for a custom domain.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/gemkid/',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: true },
  preview: { port: 4173, strictPort: true },
});
