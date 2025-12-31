import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPlants();
  }, []);

  const fetchMyPlants = async () => {
    try {
      const response = await api.get('/my-plants');
      setPlants(response.data);
    } catch (error) {
      console.error('Error cargando plantas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando plantas...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mis Plantas</h2>
      <button onClick={() => navigate('/')}>Volver</button>
      <button onClick={() => navigate('/catalog')} style={{ marginLeft: '10px' }}>
        Agregar planta
      </button>

      {plants.length === 0 ? (
        <p>No tienes plantas todavía. Agrega una desde el catálogo.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {plants.map((plant) => (
            <div key={plant.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <img 
                src={plant.image_url} 
                alt={plant.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <h3>{plant.nickname}</h3>
              <p>{plant.name}</p>
              <p>Riego: cada {plant.water_interval_days} días</p>
              <button onClick={() => navigate(`/my-plants/${plant.id}`)}>
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPlants;