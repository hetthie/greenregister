import pool from "../config/db.js"

export async function listarCatalogo(req,res){

    try{
        const resultado = await pool.query(
            'SELECT * FROM catalogo ORDER BY id_catalogo'
        );

        return res.status(200).json(resultado.rows);
    }catch(error){
        console.error('error al consultar el catalogo de plantas');
        res.status(500).json({message: 'error al mostrar el catalogo'});
    }
}

//obtiene la medicima para UNA especie en catalogo
//incluye los componentes en la relacion N:N
export async function obtenerMedicinaPorCatalogo(req,res){

    const {id} = req.params;

    try{
        const medicina = await pool.query(
            'SELECT * FROM medicina WHERE id_catalogo_fk = $1',
            [id]
        );

        if(medicina.rows.length === 0){
            return res.status(404).json({message: 'No hay informacion medicional'});

        }
        //por cada medicina traemos los componentes 
        const idsMedicina = medicina.rows.map((m) => m.id_medicina);

        const componentes = await pool.query(
            `SELECT mc.id_medicina_fk, c.*
            FROM medicina_componente mc
            JOIN componente c ON c.id_componente = mc.id_componente_fk
            WHERE mc.id_medicina_fk = ANY($1::int[])`,
            [idsMedicina]
        );

        //se une la medicina con su componente por medio del un map
        const resultado = medicina.rows.map((m) => ({
            ...m,
            componentes: componentes.rows.filter((c)=> c.id_medicina_fk === m.id_medicina),
        }));

        res.status(200).json(resultado);
    }catch(error){
        console.error('error al obtener la medicina',error);
        res.status(500).json({message:'Error al obtener informacion medicinal'});
    }
}