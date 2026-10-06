import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../src/config/db.js', () => ({ default: { query: vi.fn() } }));
vi.mock('bcrypt', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));
import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { errorMiddleware } from '../src/middlewares/errorMiddleware.js';

let server;
let baseUrl;
let token;
const secret = 'secreto-de-tests-validacion';
const user = { usuario_nombre: 'Ana', usuario_apellido: 'Perez', usuario_email: 'ana@example.com', usuario_password: 'clave-segura' };

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', secret);
  token = jwt.sign({ id_usuario: 7 }, secret);
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
afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  try {
    if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  } finally {
    vi.unstubAllEnvs();
  }
});

const request = (method, path, body, authorization = token, raw = false) => fetch(`${baseUrl}${path}`, {
  method,
  headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}) },
  body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
});
async function expectError(res, status) {
  expect(res.status).toBe(status);
  expect(res.headers.get('content-type')).toContain('application/json');
  const data = await res.json();
  expect(Object.keys(data)).toEqual(['message']);
  expect(typeof data.message).toBe('string');
  expect(data.message).not.toContain('confidencial');
}

describe('validacion de autenticacion', () => {
  it.each([
    {}, null, [], 1,
    { ...user, usuario_email: 'sin-arroba' },
    { ...user, usuario_email: 5 },
    { ...user, usuario_email: 'a b@example.com' },
    { ...user, usuario_email: 'ana\u0000@example.com' },
    { ...user, usuario_email: `${'a'.repeat(250)}@example.com` },
    { ...user, usuario_nombre: '   ' },
    { ...user, usuario_apellido: {} },
    { ...user, usuario_nombre: 'a'.repeat(101) },
    { ...user, usuario_apellido: 'A\nB' },
    { ...user, usuario_password: 'corta' },
    { ...user, usuario_password: '        ' },
    { ...user, usuario_password: 12345678 },
    { ...user, usuario_password: 'a'.repeat(73) },
    { ...user, usuario_password: 'á'.repeat(37) },
    { ...user, usuario_password: 'clave\u0000segura' },
  ])('rechaza registro invalido: %j', async body => {
    await expectError(await request('POST', '/auth/register', body, null), 400);
    expect(pool.query).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('rechaza cuerpo ausente', async () => {
    await expectError(await request('POST', '/auth/register', undefined, null), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('recorta nombres y correo sin alterar la contraseña ni mayusculas', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id_usuario: 7 }] });
    bcrypt.hash.mockResolvedValue('hash');
    const res = await request('POST', '/auth/register', { ...user, usuario_nombre: ' Ana ', usuario_apellido: ' Perez ', usuario_email: ' Ana@example.com ', usuario_password: ' clave-segura ' }, null);
    expect(res.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith(' clave-segura ', 10);
    expect(pool.query.mock.calls[1][1]).toEqual(['Ana', 'Perez', 'Ana@example.com', 'hash']);
  });

  it.each([{}, [], { usuario_email: 'incorrecto', usuario_password: 'clave' }, { usuario_email: user.usuario_email, usuario_password: {} }, { usuario_email: user.usuario_email, usuario_password: 'a'.repeat(73) }])('rechaza login invalido: %j', async body => {
    await expectError(await request('POST', '/auth/login', body, null), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('permite login de una cuenta antigua con contraseña corta', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 7, usuario_password: 'hash' }] });
    bcrypt.compare.mockResolvedValue(true);
    const res = await request('POST', '/auth/login', { usuario_email: user.usuario_email, usuario_password: 'clave' }, null);
    expect(res.status).toBe(200);
  });
});

describe('plantas e identificadores', () => {
  it.each([
    ['POST', '/plantas', {}],
    ['POST', '/plantas', { pla_nombre: '   ', id_catalogo_fk: 3 }],
    ['POST', '/plantas', { pla_nombre: 2, id_catalogo_fk: 3 }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: null }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: true }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: 1.5 }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: 0 }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: '01' }],
    ['POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: 2147483648 }],
    ['PUT', '/plantas/3', {}],
    ['PUT', '/plantas/3', { pla_nombre: 'a'.repeat(101) }],
    ['PUT', '/plantas/3', { pla_nombre: 'Menta\u0000' }],
  ])('rechaza %s %s con %j', async (method, path, body) => {
    await expectError(await request(method, path, body), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(['/plantas/abc', '/catalogo/abc', '/catalogo/0/medicina', '/catalogo/-1/comida', '/catalogo/2147483648/horticultura'])('rechaza GET %s', async path => {
    await expectError(await request('GET', path), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it.each(['PUT', 'DELETE'])('rechaza id invalido en %s', async method => {
    await expectError(await request(method, '/plantas/abc', method === 'PUT' ? { pla_nombre: 'Menta' } : undefined), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it('acepta catalogo como cadena y recorta el nombre', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_planta: 1 }] });
    const res = await request('POST', '/plantas', { pla_nombre: ' Menta ', id_catalogo_fk: '3', id_usuario_fk: 99 });
    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[0][1]).toEqual(['Menta', 7, '3']);
  });
  it.each([{}, { id_usuario: '7' }, { id_usuario: -1 }, { id_usuario: 1.5 }])('rechaza JWT firmado con payload invalido: %j', async payload => {
    await expectError(await request('GET', '/plantas', undefined, jwt.sign(payload, secret)), 401);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('errores de la aplicacion real', () => {
  it('devuelve JSON para una ruta inexistente', async () => {
    await expectError(await request('GET', '/desconocida'), 404);
  });
  it('devuelve JSON para un cuerpo malformado', async () => {
    await expectError(await request('POST', '/auth/login', '{malformado', null, true), 400);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it('rechaza cuerpos mayores a 100kb', async () => {
    await expectError(await request('POST', '/auth/register', { contenido: 'a'.repeat(110000) }, null), 413);
    expect(pool.query).not.toHaveBeenCalled();
  });
  it('devuelve conflicto cuando el correo ya existe', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 1 }] });
    await expectError(await request('POST', '/auth/register', user, null), 409);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
  it('maneja conflicto concurrente de unicidad sin exponer SQL', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(Object.assign(new Error('confidencial'), { code: '23505' }));
    bcrypt.hash.mockResolvedValue('hash');
    await expectError(await request('POST', '/auth/register', user, null), 409);
  });
  it('rechaza catalogo inexistente mediante su restriccion FK', async () => {
    pool.query.mockRejectedValue(Object.assign(new Error('confidencial'), { code: '23503', constraint: 'planta_id_catalogo_fk_fkey' }));
    await expectError(await request('POST', '/plantas', { pla_nombre: 'Menta', id_catalogo_fk: 3 }), 400);
  });
  it.each([['23503', 409], ['23502', 400], ['23514', 400], ['22P02', 400], ['22003', 400], ['22001', 400], ['XX000', 500]])('mapea PostgreSQL %s a %s', async (code, status) => {
    pool.query.mockRejectedValue(Object.assign(new Error('confidencial'), { code }));
    await expectError(await request('PUT', '/plantas/3', { pla_nombre: 'Menta' }), status);
  });
  it('delega si la respuesta ya se envio', () => {
    const next = vi.fn();
    const error = new Error('fallo');
    errorMiddleware(error, {}, { headersSent: true }, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
