import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mockeamos el módulo db.js ANTES de importar el controller.
// pool.query será una función falsa que nosotros controlamos.
vi.mock('../src/config/db.js', () => ({
  default: { query: vi.fn() },
}));

// Mockeamos bcrypt para no calcular un hash real en cada test (más rápido y controlable)
vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(() => Promise.resolve('hash_falso')) },
}));

// Importamos DESPUÉS de declarar los mocks (orden importante en ESM)
const { register } = await import('../src/controllers/authController.js');
const pool = (await import('../src/config/db.js')).default;

describe('registerUser', () => {
  // Antes de cada test, limpiamos el historial de llamadas de los mocks
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve 400 si faltan campos', async () => {
    const req = { body: { usuario_nombre: 'Juan' } }; // faltan campos
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('devuelve 409 si el email ya existe', async () => {
    // Simulamos que pool.query devuelve una fila (el email ya está registrado)
    pool.query.mockResolvedValueOnce({ rows: [{ id_usuario: 1 }] });

    const req = {
      body: {
        usuario_nombre: 'Juan',
        usuario_apellido: 'Pérez',
        usuario_email: 'juan@test.com',
        usuario_password: '123456',
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'El correo ya esta registrado' });
  });

  it('devuelve 201 si el registro es exitoso', async () => {
    // Primera llamada a pool.query: SELECT que confirma que el email NO existe (rows vacío)
    pool.query.mockResolvedValueOnce({ rows: [] });

    // Segunda llamada a pool.query: el INSERT, devuelve el usuario creado
    pool.query.mockResolvedValueOnce({
      rows: [{ id_usuario: 5, usuario_nombre: 'Juan', usuario_apellido: 'Pérez', usuario_email: 'juan@test.com' }],
    });

    const req = {
      body: {
        usuario_nombre: 'Juan',
        usuario_apellido: 'Pérez',
        usuario_email: 'juan@test.com',
        usuario_password: '123456',
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario registrado exitosamente',
      user: { id_usuario: 5, usuario_nombre: 'Juan', usuario_apellido: 'Pérez', usuario_email: 'juan@test.com' },
    });
  });
});
