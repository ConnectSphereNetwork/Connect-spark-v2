"use client"

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading or if there is no user, show a loading screen.
  // This prevents the content from flashing before the redirect.
  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Only if loading is false and a user exists, show the page content.
  return <>{children}</>;
};

export default ProtectedRoute;