import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function MyPlants({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyPlants();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMyPlants = async () => {
    try {
      const response = await api.get('/my-plants');
      setPlants(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlant = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PlantDetail', { id: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <Text style={styles.nickname}>{item.nickname}</Text>
      <Text style={styles.plantName}>{item.name}</Text>
      <Text style={styles.info}>Riego: cada {item.water_interval_days} días</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando plantas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Plantas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
          <Text style={styles.addButton}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {plants.length === 0 ? (
        <View style={styles.center}>
          <Text>No tienes plantas todavía</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Catalog')}
          >
            <Text style={styles.buttonText}>Agregar desde catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlant}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  plantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  info: {
    fontSize: 12,
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});