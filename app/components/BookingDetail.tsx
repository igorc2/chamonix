import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Booking {
  id: string;
  trip_id: string;
  type: 'hotel' | 'transport' | 'activity' | 'other';
  title: string;
  confirmation_number?: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
}

interface BookingDetailProps {
  bookingId: string;
  onClose: () => void;
}

export default function BookingDetail({ bookingId, onClose }: BookingDetailProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) {
          throw new Error('No booking ID provided');
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        Alert.alert('Error', 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleDownloadFile = async () => {
    if (!booking?.file_url) return;

    try {
      const supported = await Linking.canOpenURL(booking.file_url);
      if (supported) {
        await Linking.openURL(booking.file_url);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file');
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Booking Details</ThemedText>
        </View>

        <View style={styles.bookingHeader}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getBookingIcon(booking.type)} 
              size={32} 
              color="#007AFF" 
            />
          </View>
          <ThemedText style={styles.title}>{booking.title}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Details</ThemedText>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <ThemedText style={styles.detailText}>{booking.date}</ThemedText>
          </View>
          {booking.time && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#666" />
              <ThemedText style={styles.detailText}>{booking.time}</ThemedText>
            </View>
          )}
          {booking.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#666" />
              <ThemedText style={styles.detailText}>{booking.location}</ThemedText>
            </View>
          )}
          {booking.confirmation_number && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={20} color="#666" />
              <ThemedText style={styles.detailText}>
                Confirmation: {booking.confirmation_number}
              </ThemedText>
            </View>
          )}
        </View>

        {booking.notes && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <ThemedText style={styles.notes}>{booking.notes}</ThemedText>
          </View>
        )}

        {booking.file_url && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Attached File</ThemedText>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={handleDownloadFile}
            >
              <View style={styles.fileButtonContent}>
                <Ionicons 
                  name={booking.file_name?.endsWith('.pdf') ? 'document' : 'image'} 
                  size={24} 
                  color="#007AFF" 
                />
                <ThemedText style={styles.fileButtonText}>
                  {booking.file_name || 'Download File'}
                </ThemedText>
              </View>
              <Ionicons name="download" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bookingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  notes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  fileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileButtonText: {
    marginLeft: 12,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 