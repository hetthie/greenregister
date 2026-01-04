import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../services/api';

export default function CatalogDetail({ route, navigation }) {
  const { id } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [acquiredDate, setAcquiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPlant();
  }, []);

  const fetchPlant = async () => {
    try {
      const response = await api.get(`/catalog/${id}`);
      setPlant(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async () => {
    if (!nickname) {
      Alert.alert('Error', 'Ingresa un apodo para tu planta');
      return;
    }

    setAdding(true);
    try {
      await api.post('/my-plants', {
        plant_id: id,
        nickname,
        acquired_date: acquiredDate
      });
      Alert.alert('Éxito', 'Planta agregada exitosamente');
      navigation.navigate('MyPlants');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la planta');
    } finally {
      setAdding(false);
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: plant.image_url }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{plant.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuidados:</Text>
          
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agregar a mis plantas:</Text>
          
          <Text style={styles.label}>Apodo/Identificador:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Rosa del patio"
            value={nickname}
            onChangeText={setNickname}
          />

          <Text style={styles.label}>Fecha de adquisición:</Text>
          <TextInput
            style={styles.input}
            value={acquiredDate}
            onChangeText={setAcquiredDate}
          />

          <TouchableOpacity 
            style={[styles.button, adding && styles.buttonDisabled]}
            onPress={handleAddPlant}
            disabled={adding}
          >
            <Text style={styles.buttonText}>
              {adding ? 'Agregando...' : 'Agregar planta'}
            </Text>
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
  },
  scrollContent: {        // ← AGREGAR ESTE ESTILO
    paddingBottom: 250,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
  },
  section: {
    marginBottom: 30,
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
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
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