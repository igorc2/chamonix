import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import TripDetails from '@/components/TripDetails';
import AddBooking from '@/components/AddBooking';
import BookingDetail from '@/app/components/BookingDetail';

interface Booking {
  id?: string;
  trip_id: string;
  type: 'hotel' | 'flight' | 'activity' | 'other';
  title: string;
  confirmation_number?: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
}

export default function TripBookings() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  console.log('Trip ID:', id); // Debug log

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchBookings();
    
    const subscription = supabase
      .channel('bookings')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            console.log('Change received!', payload);
            fetchBookings();
          }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchBookings = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', id)
        .order('date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bed';
      case 'transport':
        return 'navigate';
      case 'activity':
        return 'ticket';
      default:
        return 'calendar';
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', bookingId);

              if (error) throw error;
              
              // Update local state immediately
              setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
            } catch (error) {
              console.error('Error deleting booking:', error);
              Alert.alert('Error', 'Failed to delete booking');
            }
          }
        }
      ]
    );
  };

  if (loading || !trip) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (showTripDetails) {
    return <TripDetails tripId={id} />;
  }

  if (showAddBooking) {
    return <AddBooking 
      tripId={id} 
      onClose={() => setShowAddBooking(false)} 
      onBookingAdded={(newBooking) => {
        setBookings(prevBookings => [...prevBookings, newBooking]);
      }}
    />;
  }

  if (selectedBookingId) {
    return <BookingDetail   bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{trip.location}</Text>
          <Text style={styles.subtitle}>Your Bookings</Text>
          <TouchableOpacity 
            style={styles.tripDetailsButton}
            onPress={() => setShowTripDetails(true)}
          >
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.tripDetailsButtonText}>View Trip Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bookingsContainer}>
          {bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => setSelectedBookingId(booking.id!)}
            >
              <View style={styles.bookingIcon}>
                <Ionicons name={getBookingIcon(booking.type)} size={24} color="#007AFF" />
              </View>
              <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>{booking.title}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteBooking(booking.id!);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                {booking.confirmation_number && !booking.file_url && (
                  <Text style={styles.bookingConfirmation}>
                    Confirmation: {booking.confirmation_number}
                  </Text>
                )}
                <View style={styles.bookingDetails}>
                  {booking.date && (
                    <Text style={styles.bookingDetail}>
                      <Ionicons name="calendar" size={16} color="#666" /> {booking.date}
                    </Text>
                  )}
                  {booking.time && (
                    <Text style={styles.bookingDetail}>
                      <Ionicons name="time" size={16} color="#666" /> {booking.time}
                    </Text>
                  )}
                  {booking.location && (
                    <Text style={styles.bookingDetail}>
                      <Ionicons name="location" size={16} color="#666" /> {booking.location}
                    </Text>
                  )}
                </View>
                {booking.file_url && (
                  <View style={styles.fileIndicator}>
                    <Ionicons 
                      name={booking.file_name?.endsWith('.pdf') ? 'document' : 'image'} 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.fileIndicatorText}>
                      {booking.file_name || 'Attached file'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddBooking(true)}
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
  scrollView: {
    flex: 1,
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
  bookingsContainer: {
    padding: 16,
  },
  bookingCard: {
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
  bookingIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  bookingContent: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingConfirmation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  bookingDetail: {
    fontSize: 14,
    color: '#666',
  },
  bookingNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  fileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fileIndicatorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  tripDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  tripDetailsButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
}); 