import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TripsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].header,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerTitle: 'Trip Details',
          headerTintColor: '#ffffff',
        }}
      />
    </Stack>
  );
} 