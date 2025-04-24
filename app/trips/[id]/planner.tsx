import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';

interface Activity {
  id?: string;
  trip_id: string;
  day: number;
  time: string;
  title: string;
  description: string;
  location?: string;
}

export default function TripPlanner() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  
  console.log('Trip ID:', id); // Debug log

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({
    trip_id: id || '',
    time: '',
    title: '',
    description: '',
    location: '',
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
      } catch (error) {
        console.error('Error fetching trip:', error);
      }
    };

    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchActivities();
    
    const subscription = supabase
      .channel('activities')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'activities' },
          (payload) => {
            console.log('Change received!', payload);
            fetchActivities();
          }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchActivities = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', id)
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.time || !newActivity.title) return;

    try {
      const { error } = await supabase
        .from('activities')
        .insert([{
          ...newActivity,
          day: 1, // Default to first day, can be made dynamic later
        }]);

      if (error) throw error;
      setNewActivity({ time: '', title: '', description: '', location: '' });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <Text style={styles.dates}>
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </Text>
      </View>

      <View style={styles.newActivityContainer}>
        <TextInput
          style={styles.input}
          placeholder="Time (e.g., 09:00)"
          value={newActivity.time}
          onChangeText={(text) => setNewActivity({ ...newActivity, time: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Activity Title"
          value={newActivity.title}
          onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location (optional)"
          value={newActivity.location}
          onChangeText={(text) => setNewActivity({ ...newActivity, location: text })}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={newActivity.description}
          onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddActivity}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.activitiesContainer}>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <Text style={styles.activityTime}>{activity.time}</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              {activity.location && (
                <Text style={styles.activityLocation}>
                  <Ionicons name="location" size={16} color="#666" /> {activity.location}
                </Text>
              )}
              {activity.description && (
                <Text style={styles.activityDescription}>{activity.description}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
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
  dates: {
    fontSize: 16,
    color: '#666',
  },
  newActivityContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activitiesContainer: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 