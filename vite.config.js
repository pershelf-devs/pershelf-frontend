import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('/pershelf/etc/server.json');
if (!fs.existsSync(configPath)) {
  throw new Error(`Config file not found at ${configPath}`);
}

const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
if (!configData.server || !configData.server.serverIp || !configData.server.serverPort) {
  throw new Error('Invalid server configuration.');
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: `http://${configData.server.serverIp}:${configData.server.serverPort}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/restapi/v1.0'),
      },
    },
    /*
    https: {
      key: fs.readFileSync(configData.server.serverKey),
      cert: fs.readFileSync(configData.server.serverCrt),
    },
    */
    strictPort: true,
  },
})
