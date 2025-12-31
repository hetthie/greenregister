import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

// Registro de usuario
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM public.users WHERE email = $1',  // ← CAMBIO AQUÍ
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      'INSERT INTO public.users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',  // ← CAMBIO AQUÍ
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM public.users WHERE email = $1',  // ← CAMBIO AQUÍ
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: 'Login exitoso',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};