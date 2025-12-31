import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>GreenRegister</h1>
      <p>Bienvenido, {user?.name}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/catalog')} style={{ marginRight: '10px' }}>
          Ver Catálogo
        </button>
        <button onClick={() => navigate('/my-plants')} style={{ marginRight: '10px' }}>
          Mis Plantas
        </button>
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;