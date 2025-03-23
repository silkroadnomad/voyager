import http from 'http';
import { register, collectDefaultMetrics } from 'prom-client';

export const startMetricsServer = async () => {
  // Initialize default metrics collection
  // collectDefaultMetrics(); // TODO: remove already in libp2p-config

  // Create an HTTP server to expose metrics
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  // Start the server
  const port = 9090; // Default Prometheus port
  server.listen(port, () => {
    console.log(`Metrics server running at http://localhost:${port}/metrics`);
  });

  return server;
};