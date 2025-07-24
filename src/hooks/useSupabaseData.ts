import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DatabaseTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  project_id: string;
  due_date: string | null;
  start_date: string | null;
  completion_date: string | null;
  percent_completed: number;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    color: string;
  };
  update_logs?: Array<{
    id: string;
    text: string;
    created_at: string;
  }>;
  related_tasks?: Array<{
    related_task_id: string;
  }>;
}

export interface DatabaseProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  project_manager_id: string | null;
  start_date: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  project_manager?: {
    id: string;
    name: string;
    email: string;
  };
  milestones?: {
    id: string;
    title: string;
    due_date: string;
    completed: boolean;
  }[];
}

export interface DatabaseProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [profiles, setProfiles] = useState<DatabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email),
        project:projects(id, name, color),
        update_logs:update_log(id, text, created_at),
        related_tasks:related_tasks!related_tasks_task_id_fkey(related_task_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_manager:profiles!projects_project_manager_id_fkey(id, name, email),
        milestones(id, title, due_date, completed)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    setProfiles(data || []);
  };

  const createTask = async (taskData: any) => {
    if (!user) {
      throw new Error('User must be authenticated to create tasks');
    }

    console.log('Creating task with data:', taskData);
    console.log('Current user:', user.id);

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email),
        project:projects(id, name, color)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    console.log('Task created successfully:', data);
    setTasks(prev => [data, ...prev]);
    return data;
  };

  const updateTask = async (taskId: string, updates: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email),
        project:projects(id, name, color)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    setTasks(prev => prev.map(task => task.id === taskId ? data : task));
    return data;
  };

  const createUpdateLog = async (taskId: string, text: string) => {
    if (!user) {
      throw new Error('User must be authenticated to create update logs');
    }

    const { data, error } = await supabase
      .from('update_log')
      .insert({
        task_id: taskId,
        text: text
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating update log:', error);
      throw error;
    }

    console.log('Update log created successfully:', data);
    
    // Refresh tasks to get updated data
    await fetchTasks();
    
    return data;
  };

  const updateRelatedTasks = async (taskId: string, relatedTaskIds: string[]) => {
    if (!user) {
      throw new Error('User must be authenticated to update related tasks');
    }

    // First, delete existing related tasks for this task
    await supabase
      .from('related_tasks')
      .delete()
      .eq('task_id', taskId);

    // Then insert new related tasks
    if (relatedTaskIds.length > 0) {
      const { error } = await supabase
        .from('related_tasks')
        .insert(
          relatedTaskIds.map(relatedTaskId => ({
            task_id: taskId,
            related_task_id: relatedTaskId
          }))
        );

      if (error) {
        console.error('Error updating related tasks:', error);
        throw error;
      }
    }

    // Refresh tasks to get updated data
    await fetchTasks();
    
    return true;
  };

  const createProject = async (projectData: any) => {
    if (!user) {
      throw new Error('User must be authenticated to create projects');
    }

    console.log('Creating project with data:', projectData);
    console.log('Current user:', user.id);

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        project_manager:profiles!projects_project_manager_id_fkey(id, name, email),
        milestones(id, title, due_date, completed)
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    console.log('Project created successfully:', data);
    setProjects(prev => [data, ...prev]);
    return data;
  };

  const updateProject = async (projectId: string, updates: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select(`
        *,
        project_manager:profiles!projects_project_manager_id_fkey(id, name, email),
        milestones(id, title, due_date, completed)
      `)
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    setProjects(prev => prev.map(project => project.id === projectId ? data : project));
    return data;
  };

  const deleteProject = async (projectId: string) => {
    // First check if there are any tasks associated with this project
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', projectId);

    if (tasksError) {
      console.error('Error checking project tasks:', tasksError);
      throw tasksError;
    }

    if (tasks && tasks.length > 0) {
      throw new Error(`Cannot delete project. There are ${tasks.length} task(s) associated with this project. Please delete the tasks first.`);
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    setProjects(prev => prev.filter(project => project.id !== projectId));
    return true;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }

    setTasks(prev => prev.filter(task => task.id !== taskId));
    return true;
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchTasks(),
        fetchProjects(),
        fetchProfiles()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    tasks,
    projects,
    profiles,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    deleteProject,
    createUpdateLog,
    updateRelatedTasks,
    refetchTasks: fetchTasks,
    refetchProjects: fetchProjects,
    refetchProfiles: fetchProfiles,
  };
};