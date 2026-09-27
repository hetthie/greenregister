import  pool  from "../config/db.js"; //importamos la conexion a la base de datos

export async function crearPlanta(req,res){
    //nombre y catalogo de la planta en lapeticion
    const { pla_nombre, id_catalogo_fk } = req.body;

    const id_usuario_fk = req.usuario.id_usuario; // obtenemos el id del usuario desde el token
    try{
        //insertamos la planta, con la fecha actual 
        const resultado = await pool.query(
            'INSERT INTO planta (pla_nombre, pla_fecharegistro, id_usuario_fk, id_catalogo_fk) VALUES ($1, CURRENT_DATE, $2, $3) RETURNING *',
            [pla_nombre, id_usuario_fk, id_catalogo_fk]
        );

        res.status(201).json({ message: 'Planta registrada exitosamente', planta: resultado.rows[0] });
    }catch(error){
        console.error('Error al registrar planta:', error);
        res.status(500).json({ message: 'Error interno al crear la planta' }
        );
    }
}



export async function listarPlantas(req,res){
    const id_usuario_fk = req.usuario.id_usuario

    try{
        const resultado = await pool.query(
            'SELECT * FROM planta WHERE id_usuario_fk = $1 ORDER BY pla_fecharegistro DESC',
            [id_usuario_fk]
        );

        res.status(200).json(resultado.rows);
    }catch(error){
        console.error('error al listar las plantas',error.message);
        res.status(500).json({message: 'error al obtener las plantas'})
    }
}