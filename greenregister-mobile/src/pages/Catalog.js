import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function Catalog({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await api.get('/catalog');
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
      onPress={() => navigation.navigate('CatalogDetail', { id: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <Text style={styles.plantName}>{item.name}</Text>
      <Text style={styles.info}>Riego: cada {item.water_interval_days} días</Text>
      <Text style={styles.info}>{item.light_requirement}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Catálogo de Plantas</Text>
      </View>

      <FlatList
        data={plants}
        renderItem={renderPlant}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
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
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  info: {
    fontSize: 12,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});