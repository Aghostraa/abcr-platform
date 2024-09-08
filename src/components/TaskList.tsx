import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  points: number;
  applicant_id: string | null;
}


export interface TaskListProps {
  tasks: Task[];
}


const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchTasks();
    fetchUserInfo();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) console.error('Error fetching tasks:', error);
  };

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data, error } = await supabase.rpc('user_role', { user_id: user.id });
      if (error) console.error('Error fetching user role:', error);
      else setUserRole(data);
    }
  };

  const applyForTask = async (taskId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ applicant_id: userId, status: 'applied' })
      .eq('id', taskId);
    if (error) console.error('Error applying for task:', error);
    else fetchTasks();
  };

  const approveApplication = async (taskId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', taskId);
    if (error) console.error('Error approving application:', error);
    else fetchTasks();
  };

  const markTaskAsDone = async (taskId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'pending_approval', completed_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) console.error('Error marking task as done:', error);
    else fetchTasks();
  };

  const approveTaskCompletion = async (taskId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        approved_by: userId, 
        approved_at: new Date().toISOString() 
      })
      .eq('id', taskId);
    if (error) console.error('Error approving task completion:', error);
    else fetchTasks();
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <motion.div
          key={task.id}
          className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-md"
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.25)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold">{task.name}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>Points: {task.points}</p>
          {(userRole === 'Member' || userRole === 'Manager' || userRole === 'Admin') && 
           task.status === 'pending' && !task.applicant_id && (
            <button 
              onClick={() => applyForTask(task.id)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'applied' && (
            <button 
              onClick={() => approveApplication(task.id)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve Application
            </button>
          )}
          {task.applicant_id === userId && task.status === 'in_progress' && (
            <button 
              onClick={() => markTaskAsDone(task.id)}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Mark as Done
            </button>
          )}
          {(userRole === 'Manager' || userRole === 'Admin') && task.status === 'pending_approval' && (
            <button 
              onClick={() => approveTaskCompletion(task.id)}
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Approve Completion
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;