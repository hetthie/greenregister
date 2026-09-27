import pool from "../config/db.js"

export async function listarCatalogo(req,res){

    try{
        const resultado = await pool.query(
            'SELECT * FROM catalogo ORDER BY id_catalogo'
        );

        return res.status(200).json(resultado.rows);
    }catch{
        console.error('error al consultar el catalogo de plantas');
        res.status(500).json({message: 'error al mostrar el catalogo'});
    }
}