import { Stack } from 'expo-router';
import { AuthProvider } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="trips"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
