import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface ShareTripProps {
  tripId: string;
}

interface SharedUser {
  id: string;
  shared_with_email: string;
  created_at: string;
}

export default function ShareTrip({ tripId }: ShareTripProps) {
  const [email, setEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSharedUsers();
  }, []);

  const fetchSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_shares')
        .select('*')
        .eq('trip_id', tripId);

      if (error) throw error;
      setSharedUsers(data || []);
    } catch (error) {
      console.error('Error fetching shared users:', error);
      Alert.alert('Error', 'Failed to fetch shared users');
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('trip_shares')
        .insert([
          {
            trip_id: tripId,
            shared_with_email: email.trim().toLowerCase(),
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Trip shared successfully');
      setEmail('');
      fetchSharedUsers();
    } catch (error) {
      console.error('Error sharing trip:', error);
      Alert.alert('Error', 'Failed to share trip');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('trip_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      fetchSharedUsers();
    } catch (error) {
      console.error('Error removing share:', error);
      Alert.alert('Error', 'Failed to remove share');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email to share with"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={loading}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sharedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sharedUserItem}>
            <ThemedText>{item.shared_with_email}</ThemedText>
            <TouchableOpacity
              onPress={() => handleRemoveShare(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle-outline" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <ThemedText style={styles.emptyText}>
            No users shared with yet
          </ThemedText>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    color: '#000',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
}); 