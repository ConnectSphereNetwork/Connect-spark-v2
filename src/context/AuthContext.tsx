"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// User ke data ka structure
interface User {
  _id: string;
  username: string;
  email: string;
  tokens: number;
}

// Context ka structure
interface IAuthContext {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

// Context create karna
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Provider component banana
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Backend se check karo ki user logged in hai ya nahi
        const response = await axios.get('http://localhost:5001/api/auth/me', {
          withCredentials: true, // Cookies bhejne ke liye zaroori
        });
        setUser(response.data.data.user);
      } catch (error) {
        setUser(null); // Agar error aaye toh user null set kardo
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []); // Yeh sirf app load hone par ek baar chalega

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook banana taaki context ko use karna aasaan ho
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};