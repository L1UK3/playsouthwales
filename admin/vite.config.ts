import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/events': 'http://127.0.0.1:5000',
      '/leagues': 'http://127.0.0.1:5000',
      '/types': 'http://127.0.0.1:5000',
    }
  }
})
