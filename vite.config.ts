import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'My Awesome App',
        short_name: 'MyApp',
        description: 'My Awesome App description',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'src/assets/microphone.tsx',
            sizes: '192x192',
            type: 'image/svg'
          },
          {
            src: 'src/assets/microphone.tsx',
            sizes: '512x512',
            type: 'image/svg'
          }
        ]
      }
    })
  ]
})
