import React, { useContext,useState,useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Home({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [plantCount, setPlantCount] = useState(0);
  useEffect(() => {
  const loadCount = async () => {
    const response = await api.get('/my-plants');
    setPlantCount(response.data.length);
  };
  loadCount();
}, []);
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GreenRegister</Text>
      <Text style={styles.welcome}>Bienvenido, {user?.name}</Text>

      <Text style={styles.plantCount}>Tienes {plantCount} plantas registradas</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Catalog')}
      >
        <Text style={styles.buttonText}>Ver Catálogo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('MyPlants')}
      >
        <Text style={styles.buttonText}>Mis Plantas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  plantCount: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2e7d32',
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});