// PostgreSQL INTEGER: identificador positivo dentro del rango int32.
export function validarId(id) {
    return typeof id === 'string' && /^[1-9]\d*$/.test(id)
        && Number(id) <= 2147483647;
}
