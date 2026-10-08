import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { needleWorkerPlugin } from './vite-plugin-needle-worker'

export default defineConfig({
  plugins: [vue(), needleWorkerPlugin()],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['needle2', 'needle3']
  }
})