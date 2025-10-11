import { API_BASE_URL } from '@/lib/api';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Establish the connection. 'withCredentials' is crucial for sending cookies.
    const newSocket = io(API_BASE_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Clean up the connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};