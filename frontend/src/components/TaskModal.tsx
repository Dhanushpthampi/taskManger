import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedToId: z.string().optional(), // We'll just input ID or email for now if no list
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: any; // Task type
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'Medium',
    }
  });

  const { users } = useUsers();
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      reset({
        ...taskToEdit,
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
        assignedToId: taskToEdit.assignedToId?._id 
      });
    } else {
      reset({ priority: 'Medium', title: '', description: '', dueDate: '' });
    }
  }, [taskToEdit, reset, isOpen]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setServerError('');
      if (taskToEdit) {
        await axios.put(`/api/tasks/${taskToEdit._id}`, data, { withCredentials: true });
      } else {
        await axios.post('/api/tasks', data, { withCredentials: true });
      }
      onClose();
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">{taskToEdit ? 'Edit Task' : 'Create Task'}</h2>
        
        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title')} error={errors.title?.message} />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              {...register('description')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>

          <Input label="Due Date" type="date" {...register('dueDate')} error={errors.dueDate?.message} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select 
                {...register('priority')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            
             <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <select 
                {...register('assignedToId')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {taskToEdit ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
