import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Agregar user_id a la request
    req.userId = decoded.userId;
    
    next(); // Continuar al siguiente middleware/controlador
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};