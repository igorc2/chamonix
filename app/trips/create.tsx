import React from 'react';
import { Stack } from 'expo-router';
import TripForm from '../../components/trip/TripForm';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CreateTrip() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Trip',
        }}
      />
      <TripForm />
    </>
  );
} 