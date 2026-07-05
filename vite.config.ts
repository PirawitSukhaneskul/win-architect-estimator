import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is set for GitHub Pages project-site hosting at
// https://pirawitsukhaneskul.github.io/win-architect-estimator/
export default defineConfig({
  base: '/win-architect-estimator/',
  plugins: [react()],
})
