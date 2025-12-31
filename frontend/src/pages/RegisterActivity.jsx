import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    activity_type: 'Riego',
    activity_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/activities', {
        my_plant_id: id,
        ...formData
      });
      alert('Actividad registrada exitosamente');
      navigate(`/activities/${id}`);
    } catch (error) {
      console.error('Error registrando actividad:', error);
      alert('Error al registrar actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Registrar Actividad</h2>
      <button onClick={() => navigate(`/my-plants/${id}`)}>Volver</button>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Tipo de actividad:</label>
          <select
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="Riego">Riego</option>
            <option value="Poda">Poda</option>
            <option value="Trasplante">Trasplante</option>
            <option value="Fertilización">Fertilización</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Fecha y hora:</label>
          <input
            type="datetime-local"
            name="activity_date"
            value={formData.activity_date}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Notas (opcional):</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Ej: Regué en la mañana"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px' }}
        >
          {loading ? 'Guardando...' : 'Guardar Actividad'}
        </button>
      </form>
    </div>
  );
}

export default RegisterActivity;