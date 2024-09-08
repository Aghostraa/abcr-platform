'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: number;
  name: string;
  description: string;
  project_id: number;
  category_id: number;
  urgency: number;
  priority: number;
  difficulty: number;
  points: number;
  status: string;
  applicant_id: string | null;
}

interface Project {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface TasksPageProps {
  userRole?: string;
}

const TasksPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      if (user && ['Admin', 'Manager', 'Member'].includes(user.role)) {
        await Promise.all([fetchTasks(), fetchProjects(), fetchCategories()]);
      }
    };
  
    fetchData();
  }, [user, userLoading]);

  const fetchTasks = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => 
    (!selectedProject || task.project_id === selectedProject) &&
    (!selectedCategory || task.category_id === selectedCategory)
  );

  if (userLoading) {
    return <DashboardLayout><div>Loading user data...</div></DashboardLayout>;
  }

  if (!user || !['Admin', 'Manager', 'Member'].includes(user.role)) {
    return null;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Tasks Management
        </h1>

        {(user.role === 'Admin' || user.role === 'Manager') && (
          <motion.div
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Create New Task
            </h2>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </motion.div>
        )}

        <motion.div
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Task List
          </h2>

          <div className="mb-4 flex space-x-4">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
              className="bg-white bg-opacity-20 rounded p-2"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="bg-white bg-opacity-20 rounded p-2"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <TaskList tasks={filteredTasks} />
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TasksPage;