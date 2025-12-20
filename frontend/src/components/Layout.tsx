import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-20 sticky top-0">
         <div className="flex items-center space-x-2">
           <img src="/tasky.png" alt="Logo" className="h-8 w-8" />
           <h1 className="text-xl font-bold text-blue-600">Tasky</h1>
         </div>
         <div className="flex items-center space-x-3">
            <NotificationBell />
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                {user.username.charAt(0).toUpperCase()}
              </button>
              {/* Dropdown for user profile */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                <div className="px-4 py-2 border-b text-sm text-gray-700">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
         </div>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex bg-white shadow-md w-64 flex-col">
        <div className="p-4 border-b flex items-center space-x-2">
           <img src="/tasky.png" alt="Logo" className="h-8 w-8" />
           <h1 className="text-xl font-bold text-blue-600">Tasky</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${location.pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>All Tasks</span>
          </Link>
          <Link 
            to="/my-tasks" 
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${location.pathname === '/my-tasks' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <User className="w-5 h-5" />
            <span>My Tasks</span>
          </Link>

          <div className="pt-4 mt-4 border-t">
            <div className="px-4 py-2 flex items-center space-x-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                 {user.username.charAt(0).toUpperCase()}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                 <p className="text-xs text-gray-500 truncate">{user.email}</p>
               </div>
            </div>
             <div className="px-4">
              <div className="flex items-center justify-between mb-4">
                 <NotificationBell />
                 <span className="text-xs text-gray-500">Notifications</span>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <Outlet />
      </main>
    </div>
  );
};
