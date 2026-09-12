import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // pinned, not auto-picked - the business's `frontend_url` (used by
  // redirectToFrontendAfterPayment() to send the browser back here after an
  // online payment) is a fixed DB value, so silently drifting to another
  // port when 5173 is busy would send customers to the wrong origin after
  // paying (a blank/different app, and a stale auth token) instead of a
  // clear "port already in use" error here.
  server: {
    port: 5173,
    strictPort: true,
  },
})
