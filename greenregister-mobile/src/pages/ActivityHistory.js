import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function ActivityHistory({ route, navigation }) {
  const { id } = route.params;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchActivities();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/activities/${id}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivity = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.activityType}>{item.activity_type}</Text>
        <Text style={styles.date}>
          {new Date(item.activity_date).toLocaleString()}
        </Text>
      </View>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterActivity', { id })}>
          <Text style={styles.addButton}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {activities.length === 0 ? (
        <View style={styles.center}>
          <Text>No hay actividades registradas</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('RegisterActivity', { id })}
          >
            <Text style={styles.buttonText}>Registrar primera actividad</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id.toString()}
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
    padding: 15,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  notes: {
    fontSize: 14,
    color: '#555',
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