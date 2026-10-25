import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingAlert, setIncomingAlert] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket Engine] Connected to real-time server:', newSocket.id);
      if (user?._id) {
        newSocket.emit('join_user', user._id);
      }
    });

    newSocket.on('chat_notification', (data) => {
      setIncomingAlert(data);
      setTimeout(() => setIncomingAlert(null), 6000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        incomingAlert,
        clearAlert: () => setIncomingAlert(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
