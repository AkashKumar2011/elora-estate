require('dotenv').config();

const createApp = require('./app');
const connectDB = require('./config/db');

const REQUIRED_ENV = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function assertRequiredEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[startup] Copy .env.example to .env and fill in real values before starting.');
    process.exit(1);
  }
}

async function start() {
  assertRequiredEnv();
  await connectDB();

  const app = createApp();
  const port = process.env.PORT || 5000;

  const server = app.listen(port, () => {
    console.log(`[server] EloraEstate backend listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('[startup] Fatal error during startup:', err);
  process.exit(1);
});
