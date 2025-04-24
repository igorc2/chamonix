import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';
import ShareTrip from '@/components/trip/ShareTrip';

interface TripDetailsProps {
  tripId: string;
}

export default function TripDetails({ tripId }: TripDetailsProps) {
  const colorScheme = useColorScheme();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        console.log('Fetching trip with ID:', tripId);
        
        if (!tripId) {
          throw new Error('No trip ID provided');
        }

        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Trip not found');
        }

        console.log('Trip data:', data);
        setTrip(data);
      } catch (error) {
        console.error('Error fetching trip:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Trip not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = () => (
    <View style={styles.content}>
      <Text style={styles.title}>{trip.location}</Text>
      <Text style={styles.description}>{trip.description}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Trip</Text>
        <ShareTrip tripId={trip.id!} />
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={[1]} // Single item since we're using it as a container
      renderItem={renderItem}
      keyExtractor={() => 'trip-detail'}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 