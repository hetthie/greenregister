import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function CatalogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [acquiredDate, setAcquiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const response = await api.get(`/catalog/${id}`);
      setPlant(response.data);
    } catch (error) {
      console.error('Error cargando planta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      await api.post('/my-plants', {
        plant_id: id,
        nickname,
        acquired_date: acquiredDate
      });
      alert('Planta agregada exitosamente');
      navigate('/my-plants');
    } catch (error) {
      console.error('Error agregando planta:', error);
      alert('Error al agregar planta');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!plant) return <div>Planta no encontrada</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate('/catalog')}>Volver</button>
      
      <img 
        src={plant.image_url} 
        alt={plant.name}
        style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginTop: '20px' }}
      />
      
      <h2>{plant.name}</h2>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Cuidados:</h3>
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

      <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h3>Agregar a mis plantas</h3>
        <form onSubmit={handleAddPlant}>
          <div style={{ marginBottom: '15px' }}>
            <label>Apodo/Identificador:</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              placeholder="Ej: Rosa del patio"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Fecha de adquisición:</label>
            <input
              type="date"
              value={acquiredDate}
              onChange={(e) => setAcquiredDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={adding}
            style={{ width: '100%', padding: '10px' }}
          >
            {adding ? 'Agregando...' : 'Agregar planta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CatalogDetail;