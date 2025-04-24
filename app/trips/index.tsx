import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';
import { Ionicons } from '@expo/vector-icons';

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setTrips(data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() => router.push(`/trips/${item.id}`)}
    >
      <Text style={styles.tripLocation}>{item.location}</Text>
      <Text style={styles.tripDate}>
        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/trips/create')}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  tripItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 