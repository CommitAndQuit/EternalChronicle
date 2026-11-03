import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repository-name>/.
// The deploy workflow overrides this with the real repository name so
// forks keep working without editing the config.
const base = process.env.VITE_BASE_PATH || '/EternalChronicle/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,
    open: false, // Don't auto-open browser
  },
})
