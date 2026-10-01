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


export async function obtenerComidaPorCatalogo(req,res){

    const {id} = req.params;

    try{
        const comida = await pool.query(
            'SELECT * FROM comida WHERE id_catalogo_fk = $1',
            [id]
        );

        if(comida.rows.length === 0){
            return res.status(404).json({message: 'no se encontro el elemento'});
        }

        const idComida = comida.rows.map((c) => c.id_comida);
        
        const ingredientes = await pool.query(
            `SELECT ci.id_comida_fk, i.*
            FROM comida_ingrediente ci
            JOIN ingrediente i ON i.id_ingrediente = ci.id_ingrediente_fk
            WHERE ci.id_comida_fk = ANY($1::int[])`,
            [idComida]
        );

        const resultado = comida.rows.map((c) => ({
            ...c,
            ingredientes: ingredientes.rows.filter((i)=> i.id_comida_fk === c.id_comida),
        }));

        res.status(200).json(resultado);
    }catch(error){
        console.error('Error al optener los componetes',error);
        res.status(500).json({message: 'Error al obtener los componetes de la comida.'});
    }
}

export async function obtenerHorticulturaPorCatalogo(req,res){
    const {id} = req.params;
     try{
        const resultado = await pool.query(
            'SELECT * FROM horticultura WHERE id_catalogo_fk = $1',
            [id]
        );

        if(resultado.rows.length === 0){
            return res.status(404).json({message:'El elemento de horticultura asociada a la planta no existe.'});
        }

        res.status(200).json(resultado.rows);
     }catch(error){
        console.error("El no se pudo realizar la busqueda",error);
        res.status(500).json({message: "El no se pudo realizar la busqueda"});
     }
}