import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/Button';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li 
                    key={notification._id} 
                    className={`px-4 py-3 border-b hover:bg-gray-50 flex items-start justify-between group ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}>
                           <Check className="w-3 h-3 text-blue-600" />
                         </Button>
                       </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
