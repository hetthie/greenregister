import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const response = await api.get(`/my-plants/${id}`);
      setPlant(response.data);
    } catch (error) {
      console.error('Error cargando planta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta planta?')) {
      try {
        await api.delete(`/my-plants/${id}`);
        alert('Planta eliminada');
        navigate('/my-plants');
      } catch (error) {
        console.error('Error eliminando planta:', error);
        alert('Error al eliminar planta');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!plant) return <div>Planta no encontrada</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate('/my-plants')}>Volver</button>
      <button onClick={handleDelete} style={{ marginLeft: '10px', background: 'red', color: 'white' }}>
        Eliminar
      </button>
      
      <img 
        src={plant.image_url} 
        alt={plant.name}
        style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginTop: '20px' }}
      />
      
      <h2>{plant.nickname}</h2>
      <p>{plant.name}</p>
      <p>Adquirida: {new Date(plant.acquired_date).toLocaleDateString()}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Información de cuidados:</h3>
        <p><strong>Riego:</strong> Cada {plant.water_interval_days} días</p>
        <p>{plant.water_description}</p>
        
        <p><strong>Poda:</strong> Cada {plant.pruning_interval_days} días</p>
        <p>{plant.pruning_description}</p>
        
        <p><strong>Trasplante:</strong> Cada {plant.transplant_interval_days} días</p>
        <p>{plant.transplant_description}</p>
        
        <p><strong>Fertilización:</strong> Cada {plant.fertilization_interval_days} días</p>
        <p>{plant.fertilization_description}</p>
        
        <p><strong>Luz:</strong> {plant.light_requirement}</p>
        <p><strong>Notas:</strong> {plant.care_notes}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate(`/my-plants/${id}/register-activity`)}>
          Registrar Actividad
        </button>
        <button onClick={() => navigate(`/activities/${id}`)} style={{ marginLeft: '10px' }}>
          Ver Historial
        </button>
      </div>
    </div>
  );
}

export default PlantDetail;