import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/events': 'http://127.0.0.1:5000',
      '/leagues': 'http://127.0.0.1:5000',
      '/types': 'http://127.0.0.1:5000',
    }
  },
  resolve: {
    alias: {
      '@auth': fileURLToPath(new URL('./src/features/auth', import.meta.url)),
      '@calendar': fileURLToPath(new URL('./src/features/calendar', import.meta.url)),
      '@leaderboard': fileURLToPath(new URL('./src/features/leaderboard', import.meta.url)),
      '@map': fileURLToPath(new URL('./src/features/map', import.meta.url)),

      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url))
    }
  }
})

