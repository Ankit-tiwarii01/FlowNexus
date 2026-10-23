import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/flownexus_test';
  process.env.JWT_SECRET = 'integration-test-secret-with-more-than-32-characters';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.NODE_ENV = 'test';

  const { app } = await import('../app.js');
  server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('Express application', () => {
  it('reports healthy without requiring authentication', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('protects workflow resources', async () => {
    const response = await fetch(`${baseUrl}/api/workflows`);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { message: 'Authentication required', code: 'UNAUTHORIZED' } });
  });

  it('returns a consistent JSON error for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/not-a-route`);
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});
