import type { ServerResponse } from 'http'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:4000',
          changeOrigin: true,
          configure(proxy) {
            proxy.on('error', (err, _req, res) => {
              console.warn('[vite proxy /api]', err.message)
              const out = res as ServerResponse | undefined
              if (out && !out.headersSent) {
                out.writeHead(502, {
                  'Content-Type': 'application/json; charset=utf-8',
                })
                out.end(
                  JSON.stringify({
                    error:
                      'API ไม่ตอบ — รัน backend ที่พอร์ต 4000 ก่อน: จากรากโปรเจกต์รัน npm install แล้ว npm run dev หรือในโฟลเดอร์ BE รัน npm run dev',
                  }),
                )
              }
            })
          },
        },
      },
    },
  }
})
