import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this app from a subpath (/Race-Manager/), everything
// else (local dev, a future custom domain) uses the root.
const base = process.env.GITHUB_PAGES ? '/Race-Manager/' : '/'

// Fortlaufende Versionsnummer (Navigation): die Anzahl der Commits auf HEAD,
// verschoben um die Commits vor Einführung der Anzeige — so ergibt der
// Commit, der sie einführt, "01.01" und jeder weitere Push zählt hoch. Der
// Deploy-Workflow klont deshalb mit voller Historie (fetch-depth: 0).
const VERSION_OFFSET = 18

function appVersion(): string {
  try {
    const commits = Number(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim())
    if (!Number.isFinite(commits)) return 'Version 01.xx (Beta)'
    const nummer = Math.max(1, commits - VERSION_OFFSET)
    return `Version 01.${String(nummer).padStart(2, '0')} (Beta)`
  } catch {
    return 'Version 01.xx (Beta)'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Race Manager',
        short_name: 'Race Manager',
        description: 'Verwaltung von Segelregatten: Boote, Wettfahrten, Wertung',
        theme_color: '#0b3d59',
        background_color: '#0b3d59',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
