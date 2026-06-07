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
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@constant': fileURLToPath(new URL('./src/constant', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      '@icons': fileURLToPath(new URL('./src/assets/icons', import.meta.url)),
      '@event-card': fileURLToPath(new URL('./src/components/calendar/event-card', import.meta.url)),
      '@calendar': fileURLToPath(new URL('./src/components/calendar', import.meta.url)),
      '@header': fileURLToPath(new URL('./src/layouts/Header', import.meta.url)),
      '~features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '~components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '~types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '~hooks': fileURLToPath(new URL('./src/hooks', import.meta.url))
    }
  }
})
