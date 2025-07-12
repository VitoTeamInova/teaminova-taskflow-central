export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'on-hold' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface UpdateLogEntry {
  timestamp: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  projectId: string;
  dueDate?: string;
  startDate?: string;
  completionDate?: string;
  percentCompleted: number;
  estimatedHours: number;
  actualHours: number;
  updateLog: UpdateLogEntry[];
  relatedTasks: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planned' | 'started' | 'in-progress' | 'completed' | 'cancelled';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  projectManager: string;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  milestones: Milestone[];
  color: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  photo?: string;
}