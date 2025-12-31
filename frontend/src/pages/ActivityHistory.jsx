import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ActivityHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [id]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/activities/${id}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando historial...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Historial de Actividades</h2>
      <button onClick={() => navigate(`/my-plants/${id}`)}>Volver</button>
      <button onClick={() => navigate(`/my-plants/${id}/register-activity`)} style={{ marginLeft: '10px' }}>
        Registrar Nueva
      </button>

      {activities.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No hay actividades registradas todavía.</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>{activity.activity_type}</strong>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {new Date(activity.activity_date).toLocaleString()}
                </span>
              </div>
              {activity.notes && (
                <p style={{ margin: 0, color: '#555' }}>{activity.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityHistory;