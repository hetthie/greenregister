import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function Catalog({ navigation }) {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemons();
  }, []);

  const fetchPokemons = async () => {
    try {
      // Obtener lista de 20 pokémon
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20');
      
      // Obtener detalles de cada uno
      const pokemonDetails = await Promise.all(
        response.data.results.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return {
            id: details.data.id,
            name: details.data.name,
            image: details.data.sprites.front_default,
            types: details.data.types.map(t => t.type.name).join(', '),
            height: details.data.height,
            weight: details.data.weight,
          };
        })
      );
      
      setPokemons(pokemonDetails);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPokemon = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.pokemonName}>#{item.id} - {item.name}</Text>
      <Text style={styles.info}>Tipo: {item.types}</Text>
      <Text style={styles.info}>Altura: {item.height / 10}m</Text>
      <Text style={styles.info}>Peso: {item.weight / 10}kg</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text>Cargando Pokémon...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PokéAPI - Pokémon</Text>
      </View>

      <FlatList
        data={pokemons}
        renderItem={renderPokemon}
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
    backgroundColor: '#e74c3c',
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
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  info: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});