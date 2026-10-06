import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';

vi.mock('../src/config/db.js', () => ({ default: { query: vi.fn() } }));
import pool from '../src/config/db.js';
import plantaRoutes from '../src/routes/planta.routes.js';
import catalogoRoutes from '../src/routes/catalogo.routes.js';

let server;
let baseUrl;
let token;
const secret = 'secreto-local-endpoints';

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', secret);
  token = jwt.sign({ id_usuario: 7 }, secret);
  const app = express();
  app.use(express.json());
  app.use('/plantas', plantaRoutes);
  app.use('/catalogo', catalogoRoutes);
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(async () => {
  try {
    if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  }
});

const request = (path, authorization = token, method = 'GET') => fetch(`${baseUrl}${path}`, {
  method,
  headers: authorization ? { Authorization: `Bearer ${authorization}` } : {},
});

describe('DELETE /plantas/:id', () => {
  it.each([null, 'invalido'])('requiere JWT valido: %s', async authorization => {
    const res = await request('/plantas/12', authorization, 'DELETE');
    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it.each(['0', '-1', 'abc', '2147483648'])('rechaza id %s', async id => {
    const res = await request(`/plantas/${id}`, token, 'DELETE');
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it('elimina solo una planta del propietario y responde sin cuerpo', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_planta: 12 }] });
    const res = await request('/plantas/12', token, 'DELETE');
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM planta WHERE id_planta = $1 AND id_usuario_fk = $2'), ['12', 7]);
  });
  it('devuelve 404 si no coincide id y propietario', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request('/plantas/12', token, 'DELETE');
    expect(res.status).toBe(404);
    expect(pool.query.mock.calls[0][1]).toEqual(['12', 7]);
  });
  it('devuelve 409 ante una restriccion de clave foranea', async () => {
    pool.query.mockRejectedValue(Object.assign(new Error('FK'), { code: '23503' }));
    const res = await request('/plantas/12', token, 'DELETE');
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ message: 'La planta tiene registros asociados y no puede eliminarse' });
  });
  it('devuelve 500 sin exponer el error interno', async () => {
    pool.query.mockRejectedValue(new Error('detalle confidencial'));
    const res = await request('/plantas/12', token, 'DELETE');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'Error al eliminar la planta' });
  });
});

describe('GET /plantas/:id', () => {
  it.each([null, 'invalido'])('requiere JWT valido: %s', async authorization => {
    const res = await request('/plantas/12', authorization);
    expect(res.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it.each(['0', '-1', '1.5', 'abc', '2147483648', '1e2'])('rechaza id %s antes de consultar', async id => {
    const res = await request(`/plantas/${id}`);
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it('devuelve una planta propia como objeto', async () => {
    const planta = { id_planta: 12, id_usuario_fk: 7, pla_nombre: 'Menta' };
    pool.query.mockResolvedValue({ rows: [planta] });
    const res = await request('/plantas/12');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(planta);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('id_planta = $1 AND id_usuario_fk = $2'), ['12', 7]);
  });
  it('no revela plantas inexistentes o de otro propietario', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request('/plantas/12');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: 'Planta no encontrada.' });
    expect(pool.query.mock.calls[0][1]).toEqual(['12', 7]);
  });
  it('oculta los detalles internos de errores de base de datos', async () => {
    pool.query.mockRejectedValue(new Error('detalle confidencial'));
    const res = await request('/plantas/12');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'Error al obtener la planta' });
  });
});
