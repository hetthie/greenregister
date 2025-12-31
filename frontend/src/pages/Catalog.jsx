import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Catalog() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await api.get('/catalog');
      setPlants(response.data);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando catálogo...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Catálogo de Plantas</h2>
      <button onClick={() => navigate('/')}>Volver</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {plants.map((plant) => (
          <div key={plant.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <img 
              src={plant.image_url} 
              alt={plant.name}
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <h3>{plant.name}</h3>
            <p>Riego: cada {plant.water_interval_days} días</p>
            <p>Luz: {plant.light_requirement}</p>
            <button onClick={() => navigate(`/catalog/${plant.id}`)}>
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;