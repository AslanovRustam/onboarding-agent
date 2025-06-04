import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Минимальная конфигурация Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})