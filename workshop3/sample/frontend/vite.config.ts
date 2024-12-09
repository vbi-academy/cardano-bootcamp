import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      'node-fetch': 'node-fetch-polyfill',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    exclude: ['lucid-cardano'],
  },
  build: {
    target: 'es2020',
  },
})
