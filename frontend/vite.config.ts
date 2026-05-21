import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/events': 'http://localhost:5000',
      '/leagues': 'http://localhost:5000',
      '/types': 'http://localhost:5000',
    }
  }
})
