import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../src/config/db.js', () => ({ default: { query: vi.fn() } }));
vi.mock('bcrypt', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';
import { register, login } from '../src/controllers/authController.js';
import { crearPlanta, listarPlantas, actualizarPlanta } from '../src/controllers/plantaControllers.js';
import { listarCatalogo, obtenerMedicinaPorCatalogo, obtenerComidaPorCatalogo, obtenerHorticulturaPorCatalogo } from '../src/controllers/catalogoController.js';
import { authMiddleware } from '../src/middlewares/authMiddleware.js';

const response = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });
const credentials = { usuario_nombre: 'Ana', usuario_apellido: 'Perez', usuario_email: 'ana@example.com', usuario_password: 'clave-de-prueba' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('JWT_SECRET', 'secreto-exclusivo-de-pruebas');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('registro: hashing y errores', () => {
  it('inserta el hash y no devuelve la contraseña', async () => {
    const user = { id_usuario: 1, usuario_email: credentials.usuario_email };
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [user] });
    bcrypt.hash.mockResolvedValue('hash-seguro');
    const res = response();
    await register({ body: credentials }, res);
    expect(bcrypt.hash).toHaveBeenCalledWith(credentials.usuario_password, 10);
    expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO usuario'), ['Ana', 'Perez', credentials.usuario_email, 'hash-seguro']);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado exitosamente', user });
    expect(res.json.mock.calls[0][0].user).not.toHaveProperty('usuario_password');
  });

  it.each(['consulta', 'hash', 'insercion'])('devuelve 500 ante fallo de %s', async (stage) => {
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    bcrypt.hash.mockResolvedValue('hash');
    if (stage === 'consulta') pool.query.mockReset().mockRejectedValue(new Error('fallo'));
    if (stage === 'hash') bcrypt.hash.mockRejectedValue(new Error('fallo'));
    if (stage === 'insercion') pool.query.mockReset().mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error('fallo'));
    const res = response();
    await register({ body: credentials }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });
});

describe('login', () => {
  it.each(['usuario_email', 'usuario_password'])('rechaza la falta de %s sin consultar la base', async (field) => {
    const body = { ...credentials };
    delete body[field];
    const res = response();
    await login({ body }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each([false, true])('rechaza credenciales incorrectas (usuario existente: %s)', async (exists) => {
    pool.query.mockResolvedValue({ rows: exists ? [{ id_usuario: 1, usuario_password: 'hash' }] : [] });
    bcrypt.compare.mockResolvedValue(false);
    const res = response();
    await login({ body: credentials }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Correo o contraseña incorrectos' });
    if (!exists) expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('genera un JWT de dos dias sin incluir la contraseña', async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 7, usuario_password: 'hash' }] });
    bcrypt.compare.mockResolvedValue(true);
    const res = response();
    await login({ body: credentials }, res);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('usuario_email = $1'), [credentials.usuario_email]);
    expect(bcrypt.compare).toHaveBeenCalledWith(credentials.usuario_password, 'hash');
    const payload = jwt.verify(res.json.mock.calls[0][0].token, process.env.JWT_SECRET);
    expect(payload.id_usuario).toBe(7);
    expect(payload.exp - payload.iat).toBe(172800);
    expect(payload).not.toHaveProperty('usuario_password');
  });

  it.each(['consulta', 'comparacion', 'firma'])('devuelve 500 ante fallo de %s', async (stage) => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 7, usuario_password: 'hash' }] });
    bcrypt.compare.mockResolvedValue(true);
    if (stage === 'consulta') pool.query.mockRejectedValue(new Error('fallo'));
    if (stage === 'comparacion') bcrypt.compare.mockRejectedValue(new Error('fallo'));
    if (stage === 'firma') vi.stubEnv('JWT_SECRET', '');
    const res = response();
    await login({ body: credentials }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });
});

describe('middleware de autenticacion', () => {
  it.each([undefined, '', 'Basic credenciales'])('rechaza cabecera %s', (authorization) => {
    const res = response();
    const next = vi.fn();
    authMiddleware({ headers: { authorization } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['malformado', 'expirado', 'firma incorrecta', 'vacio'])('rechaza token %s', (kind) => {
    let token = 'no-es-jwt';
    if (kind === 'expirado') token = jwt.sign({ id_usuario: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
    if (kind === 'firma incorrecta') token = jwt.sign({ id_usuario: 1 }, 'otro-secreto');
    if (kind === 'vacio') token = '';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = vi.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.usuario).toBeUndefined();
  });

  it('adjunta el usuario verificado y continua', () => {
    const token = jwt.sign({ id_usuario: 7 }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = vi.fn();
    authMiddleware(req, res, next);
    expect(req.usuario.id_usuario).toBe(7);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('plantas', () => {
  const req = () => ({ usuario: { id_usuario: 7 }, params: { id: '12' }, body: { pla_nombre: 'Menta', id_catalogo_fk: 3, id_usuario_fk: 999 } });

  it('crea usando el propietario del token, ignorando el del cuerpo', async () => {
    const planta = { id_planta: 12, id_usuario_fk: 7 };
    pool.query.mockResolvedValue({ rows: [planta] });
    const res = response();
    await crearPlanta(req(), res);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('CURRENT_DATE'), ['Menta', 7, 3]);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Planta registrada exitosamente', planta });
  });

  it.each([[], [{ id_planta: 12 }]])('lista solo para el usuario autenticado: %j', async (rows) => {
    pool.query.mockResolvedValue({ rows });
    const res = response();
    await listarPlantas(req(), res);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id_usuario_fk = $1'), [7]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('actualiza condicionando el identificador y el propietario', async () => {
    const planta = { id_planta: 12, pla_nombre: 'Menta' };
    pool.query.mockResolvedValue({ rows: [planta] });
    const res = response();
    await actualizarPlanta(req(), res);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id_planta = $2 AND id_usuario_fk = $3'), ['Menta', '12', 7]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(planta);
  });

  it('devuelve 404 cuando ninguna planta coincide con id y propietario', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = response();
    await actualizarPlanta(req(), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Planta no encontrada.' });
  });

  it.each([crearPlanta, listarPlantas, actualizarPlanta])('maneja fallos de base de datos en %s', async (controller) => {
    pool.query.mockRejectedValue(new Error('fallo de conexion'));
    const res = response();
    await controller(req(), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toHaveProperty('message');
  });
});

describe('catalogo', () => {
  it.each([[], [{ id_catalogo: 3 }]])('lista el catalogo: %j', async (rows) => {
    pool.query.mockResolvedValue({ rows });
    const res = response();
    await listarCatalogo({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it.each([
    [obtenerMedicinaPorCatalogo, 'id_medicina', 'id_medicina_fk', 'componentes'],
    [obtenerComidaPorCatalogo, 'id_comida', 'id_comida_fk', 'ingredientes'],
  ])('agrupa las relaciones de %s sin mezclar registros', async (controller, id, foreignId, relation) => {
    const rows = [{ [id]: 1 }, { [id]: 2 }, { [id]: 3 }];
    const children = [{ [foreignId]: 2, nombre: 'B' }, { [foreignId]: 1, nombre: 'A' }, { [foreignId]: 1, nombre: 'C' }];
    pool.query.mockResolvedValueOnce({ rows }).mockResolvedValueOnce({ rows: children });
    const res = response();
    await controller({ params: { id: '5' } }, res);
    expect(pool.query).toHaveBeenNthCalledWith(1, expect.stringContaining('id_catalogo_fk = $1'), ['5']);
    expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining('ANY($1::int[])'), [[1, 2, 3]]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { ...rows[0], [relation]: [children[1], children[2]] },
      { ...rows[1], [relation]: [children[0]] },
      { ...rows[2], [relation]: [] },
    ]);
  });

  it('devuelve horticultura asociada al catalogo solicitado', async () => {
    const rows = [{ id_horticultura: 1 }];
    pool.query.mockResolvedValue({ rows });
    const res = response();
    await obtenerHorticulturaPorCatalogo({ params: { id: '5' } }, res);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('id_catalogo_fk = $1'), ['5']);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it.each([obtenerMedicinaPorCatalogo, obtenerComidaPorCatalogo, obtenerHorticulturaPorCatalogo])('devuelve 404 sin informacion en %s', async (controller) => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = response();
    await controller({ params: { id: '5' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(pool.query).toHaveBeenCalledOnce();
  });

  it.each([listarCatalogo, obtenerMedicinaPorCatalogo, obtenerComidaPorCatalogo, obtenerHorticulturaPorCatalogo])('maneja fallos de consulta en %s', async (controller) => {
    pool.query.mockRejectedValue(new Error('fallo'));
    const res = response();
    await controller({ params: { id: '5' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toHaveProperty('message');
  });

  it.each([obtenerMedicinaPorCatalogo, obtenerComidaPorCatalogo])('maneja fallos al consultar relaciones en %s', async (controller) => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_medicina: 1, id_comida: 1 }] }).mockRejectedValueOnce(new Error('fallo'));
    const res = response();
    await controller({ params: { id: '5' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
