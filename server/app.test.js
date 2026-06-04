import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from './app.js';

test('GET /api/health reports that the backend is active', async (context) => {
  const server = createApp().listen(0, '127.0.0.1');
  context.after(() => server.close());

  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, message: 'Backend activo' });
});
