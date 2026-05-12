/**
 * PM2 — เสิร์ฟ production build ด้วย vite preview (พอร์ต 4173 ตรงกับ vite.config.ts)
 * ต้อง build ก่อน: npm run build
 * รัน: pm2 start ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: 'invoice-fe',
      cwd: __dirname,
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 127.0.0.1 --port 4173',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      merge_logs: true,
      out_file: './logs/pm2-fe-out.log',
      error_file: './logs/pm2-fe-error.log',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
