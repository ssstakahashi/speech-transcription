import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['st_transcription_opacity1.png', 'st_transcription_opacity0.png'],
      manifest: {
        name: 'MIERU 文字起こし',
        short_name: 'MIERU 文字起こし',
        description: '音声を文字に起こすアプリ',
        theme_color: '#004aad',
        icons: [
          {
            src: 'src/assets/st_transcription_opacity1.png',
            sizes: '192x192',
            type: 'image/svg'
          },
          {
            src: 'src/assets/st_transcription_opacity1.png',
            sizes: '512x512',
            type: 'image/svg'
          }
        ]
      }
    })
  ]
})
