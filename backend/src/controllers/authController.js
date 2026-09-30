import bcrypt from 'bcrypt';// para hashear la contrasenia
import pool from '../config/db.js';// para la conexion a la base de datos
import jwt from 'jsonwebtoken';

//control del registro de usuarios
export async function register(req, res) {
    const { usuario_nombre,usuario_apellido, usuario_email,usuario_password} = req.body; // se extraen los datos del cuerpo de la solicitud
    
    //validacion basica
    if(!usuario_nombre || !usuario_apellido || !usuario_email || !usuario_password){
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }//comprobamos que fueron ingresados todos los datos.

    try{
        const existe = await pool.query(
            'SELECT * FROM usuario WHERE usuario_email = $1',
            [usuario_email]
        );//extraemos al usuario existente

        if(existe.rows.length > 0){
            return res.status(400).json({ message: 'El correo ya esta registrado' });
        }//comprobamos que el correo no este registrado

        const passwordHasheada = await bcrypt.hash(usuario_password, 10); // se hashea la contraseña con un salt de 10

        //SE INSERTA AL NUEVO USUARIO
        const resultado = await pool.query(
            'INSERT INTO usuario (usuario_nombre, usuario_apellido, usuario_email, usuario_password) VALUES ($1, $2, $3, $4) RETURNING id_usuario, usuario_nombre , usuario_apellido, usuario_email',
            [usuario_nombre, usuario_apellido, usuario_email, passwordHasheada]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: resultado.rows[0] });
    } catch (error) {//revisamos si hubo algun error en la conexion a la base de datos
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
    
}


//funciones de login que verifica las credenciales y devuelve un JWT si son correstas.
export async function login(req,res){
    //extraemos el email y password
    const {
        usuario_email,usuario_password
    } = req.body;

    //validamos los campos extraidos
    if(!usuario_email || !usuario_password){
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try{
        const resultado = await pool.query(
            'SELECT * FROM usuario WHERE usuario_email = $1',
            [usuario_email]
        );//buscamos al usuario en la base de datos

        if(resultado.rows.length === 0){
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }//si no existe el usuario retornamos un error

        const user = resultado.rows[0];//extraemos al usuario

        const passwordValida = await bcrypt.compare(usuario_password, user.usuario_password);//comparamos la contraseña ingresada con la hasheada

        if(!passwordValida){
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        //si la contraseña es correcta generamos un token JWT
        //expiresIN: det el tiempo en el que el token expira, en este caso 2 dias
        const token = jwt.sign(
            {
                id_usuario: user.id_usuario,
            },process.env.JWT_SECRET,
            { expiresIn: '2d' }
        );

        //Devolvemos el token el token
        res.json({token});

    }catch(error){
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }

}

