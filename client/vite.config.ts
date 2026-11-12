import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The proxy sends every /api request to the Express server, so the browser
// sees one origin and you do not need to deal with CORS during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
