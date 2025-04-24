import { Tabs, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetailLayout() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
        initialParams={{ id }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={24} color={color} />,
        }}
        initialParams={{ id }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
        initialParams={{ id }}
      />
    </Tabs>
  );
} 