import pool from '../config/database.js';

// Obtener todas las plantas del catálogo
export const getCatalog = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.plants_catalog ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo catálogo:', error);
    res.status(500).json({ error: 'Error al obtener catálogo' });
  }
};

// Obtener detalle de una planta del catálogo
export const getCatalogPlant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM public.plants_catalog WHERE id = $1',
      [id]
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