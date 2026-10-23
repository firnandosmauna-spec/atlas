import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Vite Configuration for ATLAS
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
  },
})
