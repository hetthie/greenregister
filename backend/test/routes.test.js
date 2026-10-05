import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';

vi.mock('../src/config/db.js', () => ({ default: { query: vi.fn() } }));
vi.mock('bcrypt', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';
import authRoutes from '../src/routes/auth.routes.js';
import plantaRoutes from '../src/routes/planta.routes.js';
import catalogoRoutes from '../src/routes/catalogo.routes.js';

let server;
let baseUrl;
const secret = 'secreto-para-pruebas-http';
const protectedRoutes = [
  ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: 3 }],
  ['GET', '/plantas'],
  ['PUT', '/plantas/12', { pla_nombre: 'Menta' }],
  ['GET', '/catalogo'],
  ['GET', '/catalogo/3/medicina'],
  ['GET', '/catalogo/3/comida'],
  ['GET', '/catalogo/3/horticultura'],
];

async function request(method, path, body, token) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${baseUrl}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', secret);
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/plantas', plantaRoutes);
  app.use('/catalogo', catalogoRoutes);
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => vi.resetAllMocks());
afterAll(async () => {
  try {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  } finally {
    vi.unstubAllEnvs();
  }
});

describe('rutas HTTP con base de datos simulada', () => {
  it.each(protectedRoutes)('protege %s %s sin token', async (method, path, body) => {
    const res = await request(method, path, body);
    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(protectedRoutes)('protege %s %s con token invalido', async (method, path, body) => {
    const res = await request(method, path, body, 'token-invalido');
    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(protectedRoutes)('permite %s %s con JWT valido', async (method, path, body) => {
    pool.query.mockResolvedValue({ rows: [{ id_planta: 12, id_medicina: 1, id_comida: 1 }] });
    const token = jwt.sign({ id_usuario: 7 }, secret);
    const res = await request(method, path, body, token);
    expect(res.status).toBe(method === 'POST' ? 201 : 200);
    expect(pool.query).toHaveBeenCalled();
  });

  it('registra por HTTP sin requerir JWT', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id_usuario: 7 }] });
    bcrypt.hash.mockResolvedValue('hash');
    const res = await request('POST', '/auth/register', {
      usuario_nombre: 'Ana', usuario_apellido: 'Perez', usuario_email: 'ana@example.com', usuario_password: 'clave',
    });
    expect(res.status).toBe(201);
    expect((await res.json()).user.id_usuario).toBe(7);
  });

  it('inicia sesion por HTTP y entrega un JWT verificable', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 7, usuario_password: 'hash' }] });
    bcrypt.compare.mockResolvedValue(true);
    const res = await request('POST', '/auth/login', { usuario_email: 'ana@example.com', usuario_password: 'clave' });
    expect(res.status).toBe(200);
    expect(jwt.verify((await res.json()).token, secret).id_usuario).toBe(7);
  });

  it('no actualiza una planta si la consulta no encuentra id y propietario', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request('PUT', '/plantas/12', { pla_nombre: 'Otro', id_usuario_fk: 99 }, jwt.sign({ id_usuario: 7 }, secret));
    expect(res.status).toBe(404);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('AND id_usuario_fk = $3'), ['Otro', '12', 7]);
  });
});
