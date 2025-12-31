import pool from '../config/database.js';

// Obtener historial de actividades de una planta
export const getPlantActivities = async (req, res) => {
  const { plant_id } = req.params;
  
  try {
    // Verificar que la planta pertenece al usuario
    const plantCheck = await pool.query(
      'SELECT * FROM public.my_plants WHERE id = $1 AND user_id = $2',
      [plant_id, req.userId]
    );
    
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    const result = await pool.query(
      `SELECT * FROM public.activities 
       WHERE my_plant_id = $1 
       ORDER BY activity_date DESC`,
      [plant_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};

// Registrar nueva actividad
export const createActivity = async (req, res) => {
  const { my_plant_id, activity_type, activity_date, notes } = req.body;
  
  try {
    // Verificar que la planta pertenece al usuario
    const plantCheck = await pool.query(
      'SELECT * FROM public.my_plants WHERE id = $1 AND user_id = $2',
      [my_plant_id, req.userId]
    );
    
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }
    
    const result = await pool.query(
      `INSERT INTO public.activities (my_plant_id, activity_type, activity_date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [my_plant_id, activity_type, activity_date || new Date(), notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
};