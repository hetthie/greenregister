import jwt from 'jsonwebtoken'; //importar jsonwebtoken para generar el token

//midleware para proteger rutas, , va antes de controller
export function authMiddleware(req, res, next) {
    //token viaja en el header "AUTHORIZATION: Bearer <token>"
    const authHeader = req.headers.authorization; //se extrae el header de la solicitud

    if(!authHeader || authHeader.startsWith('Bearer ')){
        return rest.status(401).json({ message: 'No autorizado, token no proporcionado' });

    }
    const token = authHeader.split(' ')[1]; //se extrae el token del header
    try{
        const peyload = jwt.verify(token, process.env.JWT_SECRET); //se verifica el token con la clave secreta

        //se guardan datos del usuario
        req.usuario = payload;

        next(); //se pasa al siguiente middleware o controlador
    }catch(error){
        //token invalido o expirado
        return res.status(401).json({ message: 'No autorizado, token invalido' });
    }
}