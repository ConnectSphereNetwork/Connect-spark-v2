"use client"

import NotificationBanner from '@/app/components/NotificationBanner';
import React, { createContext, useContext, useState, ReactNode } from 'react';



interface NotificationPayload {
  title: string;
  description: string;
}

interface INotificationContext {
  showNotification: (payload: NotificationPayload) => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const showNotification = (payload: NotificationPayload) => {
    setNotification(payload);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NotificationBanner
          title={notification.title}
          description={notification.description}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};