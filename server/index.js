import { pathToFileURL } from 'node:url';
import { createApp } from './app.js';
import { assertServerConfig, getConfig } from './config.js';
import { closeDatabase, initializeDatabase } from './db.js';

export async function startServer() {
  assertServerConfig();
  await initializeDatabase();

  const { host, port } = getConfig();
  const app = createApp();
  const server = app.listen(port, host, () => {
    console.log(`Kiryus server listening on ${host}:${port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer().catch(() => {
    console.error('Server startup failed. Check environment variables and database access.');
    process.exitCode = 1;
  });
}
