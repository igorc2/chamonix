import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';
import { Ionicons } from '@expo/vector-icons';

interface Location {
  id?: string;
  trip_id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'hotel' | 'activity' | 'restaurant' | 'other';
  notes?: string;
}

export default function TripMap() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  
  console.log('Trip ID:', id); // Debug log

  const [trip, setTrip] = useState<Trip | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.06,
    longitudeDelta: 0.03,
  });

  useEffect(() => {
    if (!id) {
      console.error('No trip ID provided');
      return;
    }

    const fetchTrip = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTrip(data);

        // If trip has coordinates, set them as the initial region
        if (data.latitude && data.longitude) {
          setRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.03,
          });
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      }
    };

    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchLocations();
    
    const subscription = supabase
      .channel('locations')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'locations' },
          (payload) => {
            console.log('Change received!', payload);
            fetchLocations();
          }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchLocations = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('trip_id', id);

      if (error) throw error;
      setLocations(data || []);

      // Only set region to first location if trip doesn't have coordinates
      if (data && data.length > 0 && (!trip?.latitude || !trip?.longitude)) {
        setRegion({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return '#FF6B6B';
      case 'activity':
        return '#4ECDC4';
      case 'restaurant':
        return '#FFD166';
      default:
        return '#6C5CE7';
    }
  };

  if (loading || !trip) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{trip.location}</Text>
        <Text style={styles.subtitle}>Trip Locations</Text>
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Add other location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name}
            description={location.notes}
          >
            <View style={[styles.marker, { backgroundColor: getMarkerColor(location.type) }]}>
              <Ionicons name="location" size={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Hotel</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>Activity</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD166' }]} />
          <Text style={styles.legendText}>Restaurant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6C5CE7' }]} />
          <Text style={styles.legendText}>Other</Text>
        </View>
      </View>
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
}); 