import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { useTasks, type Task } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all');

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    
    // Optimistic update locally? 
    // Ideally we update local state immediately, but since we rely on socket/refetch hooks, 
    // let's just trigger the API. The socket event will update the UI. 
    // If we want instant feedback we'd manually update 'tasks' state here too.
    
    try {
      await axios.put(`/api/tasks/${draggableId}`, { status: newStatus }, { withCredentials: true });
    } catch (error) {
      console.error('Failed to update task status', error);
      // maybe revert optimistic update if we did one
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'assigned') return t.assignedToId?._id === user?._id;
    if (filter === 'created') return t.creatorId._id === user?._id;
    return true;
  });

  const columns = {
    'To Do': filteredTasks.filter(t => t.status === 'To Do'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Review': filteredTasks.filter(t => t.status === 'Review'),
    'Completed': filteredTasks.filter(t => t.status === 'Completed'),
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
        <div className="flex space-x-2">
           <select 
             className="border rounded-md px-2 py-1 text-sm mr-2"
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
           >
             <option value="all">All Tasks</option>
             <option value="assigned">Assigned to Me</option>
             <option value="created">Created by Me</option>
           </select>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full"> 
          {Object.entries(columns).map(([status, columnTasks]) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-50 rounded-lg p-4 min-w-[280px] w-full md:w-1/4 flex flex-col h-fit max-h-full"
                >
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between sticky top-0 bg-gray-50 z-10 p-1">
                    {status}
                    <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-xs py-0.5">
                      {columnTasks.length}
                    </span>
                  </h3>
                  <div className="space-y-3 overflow-y-auto min-h-[50px]">
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard task={task} onClick={() => handleEdit(task)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                   {columnTasks.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg">
                        No tasks
                      </div>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        taskToEdit={selectedTask} 
      />
    </div>
  );
};
