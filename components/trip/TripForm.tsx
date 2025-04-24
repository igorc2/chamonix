import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { Trip } from '@/types/trip';
import citiesData from '@/assets/data/cities.json';

interface City {
  name?: string;
  city?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export default function TripForm() {
  const [formData, setFormData] = useState<Trip>({
    location: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filteredCities = citiesData.top_cities.filter(city => {
        const cityName = city.name || city.city || '';
        return cityName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleLocationSelect = (item: City) => {
    const cityName = item.name || item.city || '';
    setFormData({
      ...formData,
      location: `${cityName}, ${item.country}`,
      latitude: item.latitude,
      longitude: item.longitude
    });
    setSearchQuery(cityName);
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    if (formData.end_date < formData.start_date) {
      Alert.alert('Error', 'End date cannot be before start date');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('trips')
        .insert([{
          ...formData,
          user_id: user.id,
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Trip created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const renderSuggestionItem = ({ item }: { item: City }) => {
    const cityName = item.name || item.city || '';
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => {
          console.log('Suggestion item pressed:', item);
          handleLocationSelect(item);
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ThemedText style={styles.suggestionText}>
          {cityName}, {item.country}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Location</ThemedText>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for a city"
          placeholderTextColor="#666"
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => `${item.name || item.city}-${item.country}`}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
            />
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Description</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter trip description"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Start Date</ThemedText>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <ThemedText style={styles.dateText}>{formatDate(formData.start_date)}</ThemedText>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.start_date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowStartDatePicker(false);
              if (date) {
                setFormData({ ...formData, start_date: date });
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>End Date</ThemedText>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <ThemedText style={styles.dateText}>{formatDate(formData.end_date)}</ThemedText>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={formData.end_date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowEndDatePicker(false);
              if (date) {
                setFormData({ ...formData, end_date: date });
              }
            }}
            minimumDate={formData.start_date}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <ThemedText style={styles.submitButtonText}>
          {loading ? 'Creating...' : 'Create Trip'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 48,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
  },
}); 