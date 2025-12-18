import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export interface Notification {
  _id: string;
  recipientId: string;
  taskId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();
  
  // Create axios instance with credentials same as AuthContext
  const api = axios.create({
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  });

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', () => {
        // Since the socket event payload might differ from the full DB object, 
        // ideally we fetch again or construct a temporary object.
        // For now, let's fetch to be safe and get the full ID/timestamp.
        fetchNotifications();
    });

    return () => {
      socket.off('notification:new');
    };
  }, [socket]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
