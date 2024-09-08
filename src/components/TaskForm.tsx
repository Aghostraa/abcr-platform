import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Task {
  id?: number;
  name: string;
  description: string;
  project_id: number;
  urgency: number;
  priority: number;
  difficulty: number;
  points: number;
  status: string;
}

interface FormData {
  name: string;
  description: string;
  project_id: string;
  urgency: string;
  priority: string;
  difficulty: string;
}

interface Project {
  id: number;
  name: string;
}

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    project_id: '',
    urgency: '3',
    priority: '3',
    difficulty: '3',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('id, name');
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, project_id, urgency, priority, difficulty } = formData;
    const points = (parseInt(urgency) + parseInt(priority) + parseInt(difficulty)) * 10;

    const newTask: Task = {
      name,
      description,
      project_id: parseInt(project_id),
      urgency: parseInt(urgency),
      priority: parseInt(priority),
      difficulty: parseInt(difficulty),
      points,
      status: 'pending',
    };

    const { error } = await supabase.from('tasks').insert(newTask);
    if (error) {
      console.error('Error creating task:', error);
    } else {
      setFormData({
        name: '',
        description: '',
        project_id: '',
        urgency: '3',
        priority: '3',
        difficulty: '3',
      });
      onTaskCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Task Name"
        className="input-field w-full"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Task Description"
        className="input-field w-full"
        required
      />
      <select
        name="project_id"
        value={formData.project_id}
        onChange={handleChange}
        className="input-field w-full"
        required
      >
        <option value="">Select Project</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>
      <div className="flex space-x-4">
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Urgency</option>
          <option value="2">Medium Urgency</option>
          <option value="3">High Urgency</option>
        </select>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Priority</option>
          <option value="2">Medium Priority</option>
          <option value="3">High Priority</option>
        </select>
        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="1">Low Difficulty</option>
          <option value="2">Medium Difficulty</option>
          <option value="3">High Difficulty</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-full">
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;