import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../services/api';

export default function PlantDetail({ route, navigation }) {
  const { id } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPlant();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPlant = async () => {
    try {
      const response = await api.get(`/my-plants/${id}`);
      setPlant(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Eliminar planta',
      '¿Estás seguro de eliminar esta planta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/my-plants/${id}`);
              Alert.alert('Éxito', 'Planta eliminada');
              navigation.navigate('MyPlants');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la planta');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text>Planta no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: plant.image_url }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.nickname}>{plant.nickname}</Text>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.date}>
          Adquirida: {new Date(plant.acquired_date).toLocaleDateString()}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de cuidados:</Text>
          
          <Text style={styles.careTitle}>Riego: Cada {plant.water_interval_days} días</Text>
          <Text style={styles.careDescription}>{plant.water_description}</Text>

          <Text style={styles.careTitle}>Poda: Cada {plant.pruning_interval_days} días</Text>
          <Text style={styles.careDescription}>{plant.pruning_description}</Text>

          <Text style={styles.careTitle}>Trasplante: Cada {plant.transplant_interval_days} días</Text>
          <Text style={styles.careDescription}>{plant.transplant_description}</Text>

          <Text style={styles.careTitle}>Fertilización: Cada {plant.fertilization_interval_days} días</Text>
          <Text style={styles.careDescription}>{plant.fertilization_description}</Text>

          <Text style={styles.careTitle}>Luz: {plant.light_requirement}</Text>
          <Text style={styles.careTitle}>Notas: {plant.care_notes}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('RegisterActivity', { id })}
          >
            <Text style={styles.buttonText}>Registrar Actividad</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('ActivityHistory', { id })}
          >
            <Text style={styles.buttonText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    color: '#ffcdd2',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  nickname: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  plantName: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  careTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  careDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: '#66bb6a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});