"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { getJson } from '@/lib/api';

interface IOnlineStatusContext {
  onlineUsers: Set<string>;
}

const OnlineStatusContext = createContext<IOnlineStatusContext | undefined>(undefined);

export const OnlineStatusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // 1. Shuru mein online users ki list fetch karo
  useEffect(() => {
    if (user) {
      const fetchOnlineUsers = async () => {
        try {
          const res = await getJson<{ data: { onlineUserIds: string[] } }>('/api/users/online');
          setOnlineUsers(new Set(res.data.onlineUserIds));
        } catch (error) {
          console.error("Failed to fetch online users:", error);
        }
      };
      fetchOnlineUsers();
    }
  }, [user]);

  // 2. Real-time status updates ke liye listen karo
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = ({ userId }: { userId: string }) => {
          console.log('--- FRONTEND RECEIVED: userOnline event for', userId, '---'); 
      setOnlineUsers(prev => new Set(prev).add(userId));
    };
    const handleUserOffline = ({ userId }: { userId: string }) => {
       console.log('--- FRONTEND RECEIVED: userOffline event for', userId, '---');
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);

    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, [socket]);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};