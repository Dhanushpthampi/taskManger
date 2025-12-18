import React from 'react';
import { type Task } from '../hooks/useTasks';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-blue-100 text-blue-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Review': 'bg-purple-50 text-purple-700',
  'Completed': 'bg-green-50 text-green-700 decoration-slate-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 truncate pr-2">{task.title}</h3>
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span className={clsx('px-2 py-0.5 rounded-md font-medium', statusColors[task.status])}>
            {task.status}
          </span>
          {task.assignedToId && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-md" title={`Assigned to ${task.assignedToId.username}`}>
              {task.assignedToId.username.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : ''}
        </div>
      </div>
    </div>
  );
};
