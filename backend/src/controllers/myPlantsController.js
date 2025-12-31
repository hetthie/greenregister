import pool from '../config/database.js';

export const getMyPlants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        mp.id,
        mp.nickname,
        mp.acquired_date,
        pc.name,
        pc.image_url,
        pc.water_interval_days,
        pc.light_requirement
      FROM public.my_plants mp
      JOIN public.plants_catalog pc ON mp.plant_id = pc.id
      WHERE mp.user_id = $1
      ORDER BY mp.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo plantas:', error);
    res.status(500).json({ error: 'Error al obtener plantas' });
  }
};



export const getMyPlant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        mp.*,
        pc.name,
        pc.image_url,
        pc.water_interval_days,
        pc.water_description,
        pc.pruning_interval_days,
        pc.pruning_description,
        pc.transplant_interval_days,
        pc.transplant_description,
        pc.fertilization_interval_days,
        pc.fertilization_description,
        pc.light_requirement,
        pc.care_notes
      FROM public.my_plants mp
      JOIN public.plants_catalog pc ON mp.plant_id = pc.id
      WHERE mp.id = $1 AND mp.user_id = $2`,
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo planta:', error);
    res.status(500).json({ error: 'Error al obtener planta' });
  }
};

// Agregar planta
export const addMyPlant = async (req, res) => {
  const { plant_id, nickname, acquired_date } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO public.my_plants (user_id, plant_id, nickname, acquired_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, plant_id, nickname, acquired_date || new Date()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error agregando planta:', error);
    res.status(500).json({ error: 'Error al agregar planta' });
  }
};

// Eliminar planta
export const deleteMyPlant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM public.my_plants WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    res.json({ message: 'Planta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando planta:', error);
    res.status(500).json({ error: 'Error al eliminar planta' });
  }
};