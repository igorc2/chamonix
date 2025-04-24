import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state changed:', { 
      hasSession: !!session, 
      loading,
      sessionId: session?.user?.id 
    });

    if (!loading && !session) {
      console.log('ProtectedRoute - No session, redirecting to login');
      router.replace('/login');
    }
  }, [session, loading]);

  if (loading) {
    console.log('ProtectedRoute - Loading state');
    // You might want to show a loading spinner here
    return null;
  }

  if (!session) {
    // Don't render anything while redirecting
    return null;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
}
