import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Task, TaskStatus } from "@/types/task";

export function useAppData() {
  const { 
    tasks, 
    projects, 
    profiles, 
    loading, 
    createTask, 
    updateTask,
    createUpdateLog,
    updateRelatedTasks
  } = useSupabaseData();

  // Convert database tasks to frontend format for backward compatibility
  const convertedTasks: Task[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status as TaskStatus,
    priority: task.priority as any,
    assignee: task.assignee?.name || '',
    assigneeId: task.assignee_id || '',
    projectId: task.project_id,
    project: task.project ? {
      id: task.project.id,
      name: task.project.name,
      color: task.project.color
    } : undefined,
    dueDate: task.due_date || undefined,
    startDate: task.start_date || undefined,
    completionDate: task.completion_date || undefined,
    percentCompleted: task.percent_completed,
    estimatedHours: task.estimated_hours,
    actualHours: task.actual_hours,
    updateLog: (task.update_logs || []).map((log: any) => ({
      timestamp: log.created_at,
      text: log.text
    })),
    updateLogs: task.update_logs?.map(log => ({
      id: log.id,
      text: log.text,
      createdAt: log.created_at
    })) || [],
    relatedTasks: (task.related_tasks || []).map((rt: any) => rt.related_task_id),
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }));

  // Convert database projects to frontend format
  const convertedProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description || '',
    status: project.status as any,
    projectManager: project.project_manager?.id || '',
    startDate: project.start_date || undefined,
    targetCompletionDate: project.target_completion_date || undefined,
    actualCompletionDate: project.actual_completion_date || undefined,
    milestones: project.milestones?.map(m => ({
      id: m.id,
      title: m.title,
      dueDate: m.due_date,
      completed: m.completed,
    })) || [],
    color: project.color,
    createdAt: project.created_at,
  }));

  // Convert database profiles to frontend format
  const convertedProfiles = profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar || '',
  }));

  return {
    tasks: convertedTasks,
    projects: convertedProjects,
    profiles: convertedProfiles,
    loading,
    createTask,
    updateTask,
    createUpdateLog,
    updateRelatedTasks
  };
}