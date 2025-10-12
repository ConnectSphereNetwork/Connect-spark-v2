"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/app/components/ui/spinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete
    if (!loading) {
      if (user) {
        // If a user is logged in, redirect them to the dashboard
        router.replace('/dashboard');
      } else {
        // If no user is logged in, redirect them to the login page
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Display a full-screen loading indicator while we check the auth status
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}