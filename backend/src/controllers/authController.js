import bcrypt from 'bcrypt';// para hashear la contrasenia
import pool from '../config/db.js';// para la conexion a la base de datos

//control del registro de usuarios
export async function registerUser(req, res) {
    const { usuario_nombre,usuario_apellido, usuario_email,usuario_password} = req.body; // se extraen los datos del cuerpo de la solicitud
    
    //validacion basica
    if(!usuario_nombre || !usuario_apellido || !usuario_email || !usuario_password){
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }//comprobamos que fueron ingresados todos los datos.

    try{
        const existe = await pool.query(
            'SELECT * FROM usuarios WHERE usuario_email = $1',
            [usuario_email]
        );//extraemos al usuario existente

        if(existe.rows.length > 0){
            return res.status(400).json({ message: 'El correo ya esta registrado' });
        }//comprobamos que el correo no este registrado

        const passwordHasheada = await bcrypt.hash(usuario_password, 10); // se hashea la contraseña con un salt de 10

        //SE INSERTA AL NUEVO USUARIO
        const resultado = await pool.query(
            'INSERT INTO usuarios (usuario_nombre, usuario_apellido, usuario_email, usuario_password) VALUES ($1, $2, $3, $4) RETURNING id_usuario, usuario_nombre , usuario_apellido, usuario_email',
            [usuario_nombre, usuario_apellido, usuario_email, passwordHasheada]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: resultado.rows[0] });
    } catch (error) {//revisamos si hubo algun error en la conexion a la base de datos
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }

    
}