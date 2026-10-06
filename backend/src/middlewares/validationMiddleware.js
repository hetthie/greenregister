import { validarId } from '../utils/validarId.js';

function objeto(body) {
    return body !== null && typeof body === 'object' && !Array.isArray(body);
}
function texto(value, max) {
    return typeof value === 'string' && value.trim().length > 0
        && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value);
}
function correo(value) {
    return typeof value === 'string' && value.trim().length <= 254
        && !/[\u0000-\u001f\u007f]/.test(value)
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
function password(value, registro) {
    // bcrypt procesa hasta 72 bytes; no recortar ni normalizar la contraseña.
    return typeof value === 'string' && value.length >= (registro ? 8 : 1)
        && value.trim().length > 0
        && Buffer.byteLength(value, 'utf8') <= 72 && !value.includes('\u0000');
}
export function validarAutenticacion(registro = false) {
    return (req, res, next) => {
        if (!objeto(req.body)) return res.status(400).json({ message: 'El cuerpo debe ser un objeto JSON' });
        const body = req.body;
        if (!correo(body.usuario_email)) return res.status(400).json({ message: 'El correo no es valido' });
        if (!password(body.usuario_password, registro)) {
            return res.status(400).json({ message: registro
                ? 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes'
                : 'La contraseña debe ser un texto de entre 1 y 72 bytes' });
        }
        if (registro && (!texto(body.usuario_nombre, 100) || !texto(body.usuario_apellido, 100))) {
            return res.status(400).json({ message: 'Nombre y apellido deben tener entre 1 y 100 caracteres' });
        }
        // Conservar mayúsculas por compatibilidad con los correos ya almacenados.
        body.usuario_email = body.usuario_email.trim();
        if (registro) {
            body.usuario_nombre = body.usuario_nombre.trim();
            body.usuario_apellido = body.usuario_apellido.trim();
        }
        return next();
    };
}
export function validarPlanta(creacion = false) {
    return (req, res, next) => {
        if (!objeto(req.body)) return res.status(400).json({ message: 'El cuerpo debe ser un objeto JSON' });
        if (!texto(req.body.pla_nombre, 100)) return res.status(400).json({ message: 'El nombre de planta debe tener entre 1 y 100 caracteres' });
        if (creacion) {
            const id = req.body.id_catalogo_fk;
            const valido = typeof id === 'number'
                ? Number.isInteger(id) && id > 0 && id <= 2147483647
                : validarId(id);
            if (!valido) return res.status(400).json({ message: 'Identificador de catalogo invalido' });
        }
        req.body.pla_nombre = req.body.pla_nombre.trim();
        return next();
    };
}
export function validarParametroId(req, res, next) {
    if (!validarId(req.params.id)) return res.status(400).json({ message: 'Identificador invalido' });
    return next();
}
