"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { BellRing } from "lucide-react";
import { postJson } from "@/lib/api";

// Helper function to convert the VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     console.log("PushNotificationManager: Component mounted.");
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator) {
         console.error("PushNotificationManager: Service Worker not supported.");
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
        }
      }
      setIsLoading(false);
    };
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications are not supported by your browser.");
      return;
    }
    
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("You have denied notification permissions.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("VAPID public key not found.");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    try {
      await postJson('/api/notifications/subscribe', subscription);
      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  };

  if (isLoading) {
    return null; // Don't show anything while checking
  }

  if (isSubscribed) {
    return <p className="text-sm text-green-500">Push notifications are enabled.</p>;
  }

  return (
    <Button onClick={handleSubscribe}>
      <BellRing className="w-4 h-4 mr-2" />
      Enable Push Notifications
    </Button>
  );
}