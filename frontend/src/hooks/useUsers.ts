import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/auth/users', { withCredentials: true });
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers(); 
  }, []);
  return { users }; 
};
