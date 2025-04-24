import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Booking {
  id?: string;
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

interface AddBookingProps {
  tripId: string;
  onClose: () => void;
  onBookingAdded?: (booking: Booking) => void;
}

export default function AddBooking({ tripId, onClose, onBookingAdded }: AddBookingProps) {
  const [newBooking, setNewBooking] = useState<Booking>({
    trip_id: tripId,
    type: 'hotel',
    title: '',
    confirmation_number: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    notes: '',
    file_url: '',
    file_name: '',
  });

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name || 'document',
          type: asset.mimeType || '',
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !tripId) return;

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${tripId}/${Date.now()}.${fileExt}`;
      const filePath = `bookings/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      } as any);

      const { data, error } = await supabase.storage
        .from('bookings')
        .upload(filePath, formData, {
          contentType: selectedFile.type,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bookings')
        .getPublicUrl(filePath);

      setNewBooking({
        ...newBooking,
        file_url: publicUrl,
        file_name: selectedFile.name,
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const handleAddBooking = async () => {
    if (!newBooking.title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      let fileUrl = newBooking.file_url;
      let fileName = newBooking.file_name;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `bookings/${tripId}/${Date.now()}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bookings')
          .upload(filePath, formData, {
            contentType: selectedFile.type,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('bookings')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7);

        if (signedUrlError) throw signedUrlError;
        if (!signedUrlData?.signedUrl) throw new Error('Failed to get signed URL');

        fileUrl = signedUrlData.signedUrl;
        fileName = selectedFile.name;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...newBooking,
          file_url: fileUrl,
          file_name: fileName,
        }])
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Booking added successfully!');
      if (data && onBookingAdded) {
        onBookingAdded(data);
      }
      onClose();
    } catch (error) {
      console.error('Error adding booking:', error);
      Alert.alert('Error', 'Failed to add booking. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Add Booking</ThemedText>
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Type</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
            {['transport', 'hotel', 'activity', 'other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newBooking.type === type && styles.typeButtonSelected,
                ]}
                onPress={() => setNewBooking({ ...newBooking, type: type as Booking['type'] })}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={
                    type === 'hotel' ? 'bed' :
                    type === 'transport' ? 'navigate' :
                    type === 'activity' ? 'ticket' : 'calendar'
                  }
                  size={24}
                  color={newBooking.type === type ? '#fff' : '#007AFF'}
                />
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    newBooking.type === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            value={newBooking.title}
            onChangeText={(text) => setNewBooking({ ...newBooking, title: text })}
            placeholder="Enter booking title"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Confirmation Number</ThemedText>
          <TextInput
            style={styles.input}
            value={newBooking.confirmation_number}
            onChangeText={(text) => setNewBooking({ ...newBooking, confirmation_number: text })}
            placeholder="Enter confirmation number"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Date</ThemedText>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>{newBooking.date}</ThemedText>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(newBooking.date)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setNewBooking({
                    ...newBooking,
                    date: selectedDate.toISOString().split('T')[0],
                  });
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Time</ThemedText>
          <TextInput
            style={styles.input}
            value={newBooking.time}
            onChangeText={(text) => setNewBooking({ ...newBooking, time: text })}
            placeholder="Enter time (optional)"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Location</ThemedText>
          <TextInput
            style={styles.input}
            value={newBooking.location}
            onChangeText={(text) => setNewBooking({ ...newBooking, location: text })}
            placeholder="Enter location (optional)"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newBooking.notes}
            onChangeText={(text) => setNewBooking({ ...newBooking, notes: text })}
            placeholder="Enter notes (optional)"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fileUploadContainer}>
          <TouchableOpacity
            style={styles.fileButton}
            onPress={pickImage}
          >
            <Ionicons name="image" size={24} color="#007AFF" />
            <ThemedText style={styles.fileButtonText}>Add Image</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.fileButton}
            onPress={pickDocument}
          >
            <Ionicons name="document" size={24} color="#007AFF" />
            <ThemedText style={styles.fileButtonText}>Add PDF</ThemedText>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.selectedFileContainer}>
            <ThemedText style={styles.selectedFileText}>
              Selected: {selectedFile.name}
            </ThemedText>
            <TouchableOpacity
              onPress={() => setSelectedFile(null)}
              style={styles.removeFileButton}
            >
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddBooking}
        >
          <ThemedText style={styles.submitButtonText}>Add Booking</ThemedText>
        </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 100,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  fileUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  fileButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedFileText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  removeFileButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 