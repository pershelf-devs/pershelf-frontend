import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';
import https from 'https';

const configPath = path.resolve('/pershelf/etc/server.json');
if (!fs.existsSync(configPath)) {
  throw new Error(`Config file not found at ${configPath}`);
}

const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
if (!configData.serverIp || !configData.serverPort) {
  throw new Error('Invalid server configuration.');
}

// Custom HTTPS agent with SSL/TLS configuration
const customHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined,
  keepAlive: false,
  timeout: 10000,
});

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
        target: `http://45.84.191.83:443`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/restapi/v1.0'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            proxyReq.setHeader('Connection', 'close');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; Vite-Proxy)');
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
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