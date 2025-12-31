import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

export default function RegisterActivity({ route, navigation }) {
  const { id } = route.params;
  const [activityType, setActivityType] = useState('Riego');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/activities', {
        my_plant_id: id,
        activity_type: activityType,
        activity_date: activityDate,
        notes
      });
      Alert.alert('Éxito', 'Actividad registrada');
      navigation.navigate('ActivityHistory', { id });
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Registrar Actividad</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Tipo de actividad:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={activityType}
            onValueChange={setActivityType}
            style={styles.picker}
          >
            <Picker.Item label="Riego" value="Riego" />
            <Picker.Item label="Poda" value="Poda" />
            <Picker.Item label="Trasplante" value="Trasplante" />
            <Picker.Item label="Fertilización" value="Fertilización" />
          </Picker>
        </View>

        <Text style={styles.label}>Fecha y hora:</Text>
        <TextInput
          style={styles.input}
          value={activityDate}
          onChangeText={setActivityDate}
          placeholder="YYYY-MM-DDTHH:MM"
        />

        <Text style={styles.label}>Notas (opcional):</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej: Regué en la mañana"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar Actividad'}
          </Text>
        </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});