/**
 * Custom Server for Next.js + Socket.IO
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Let Next.js handle all requests - Socket.IO will intercept WebSocket upgrades
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO - it will attach its own middleware to the server
  const socketServer = initSocketServer(httpServer);
  console.log('✅ Socket.IO server ready');

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 VaporLink Server Running          ║
║                                        ║
║   URL: http://${hostname}:${port}      ║
║   Environment: ${dev ? 'Development' : 'Production'}          ║
║   Socket.IO: ✅ Enabled                ║
║   Memory Store: ✅ Active              ║
╚════════════════════════════════════════╝
      `);
    });
});
