import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/events': 'http://127.0.0.1:5000',
      '/leagues': 'http://127.0.0.1:5000',
      '/types': 'http://127.0.0.1:5000',
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@event-card': fileURLToPath(new URL('./src/components/calendar/event-card', import.meta.url))
    }
  }
})
