import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function TestConnection() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Conectando...');
    
    try {
      const response = await api.get('/catalog');
      setResult(`Conexión exitosa. ${response.data.length} plantas encontradas.`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test de Conexión</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Probar Conexión</Text>
      </TouchableOpacity>

      {result ? (
        <Text style={styles.result}>{result}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});