export function responderError(error, res, fallback = 'Error interno del servidor') {
    let status = 500;
    let message = fallback;
    if (error.code === '23505') {
        status = 409; message = 'El registro ya existe';
    } else if (error.code === '23503') {
        status = 409; message = 'La operacion entra en conflicto con registros relacionados';
    } else if (['23502', '23514', '22P02', '22003', '22001'].includes(error.code)) {
        status = 400; message = 'Los datos enviados no son validos';
    } else if (error.type === 'entity.parse.failed') {
        status = 400; message = 'El cuerpo contiene JSON invalido';
    } else if (error.type === 'entity.too.large') {
        status = 413; message = 'El cuerpo de la solicitud excede el limite permitido';
    } else if (['encoding.unsupported', 'charset.unsupported'].includes(error.type)) {
        status = 415; message = 'Codificacion del cuerpo no admitida';
    }
    if (status === 500) console.error('Error interno:', error);
    return res.status(status).json({ message });
}

export function rutaNoEncontrada(req, res) {
    return res.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorMiddleware(error, req, res, next) {
    if (res.headersSent) return next(error);
    return responderError(error, res);
}
