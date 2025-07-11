import { Task, Project, TeamMember } from "@/types/task";

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    color: '#3B82F6',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'New mobile application development',
    color: '#10B981',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q1 2024 marketing initiatives',
    color: '#F59E0B',
    createdAt: '2024-02-01T10:00:00Z'
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@teaminova.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@teaminova.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@teaminova.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@teaminova.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face&auto=format'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new homepage layout',
    description: 'Create wireframes and mockups for the new homepage design focusing on user experience and conversion optimization.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    projectId: '1',
    dueDate: '2024-01-25T00:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T15:30:00Z'
  },
  {
    id: '2',
    title: 'Set up CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline for the project using GitHub Actions.',
    status: 'todo',
    priority: 'medium',
    assignee: 'Mike Chen',
    projectId: '1',
    dueDate: '2024-01-30T00:00:00Z',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples and response schemas.',
    status: 'completed',
    priority: 'medium',
    assignee: 'John Smith',
    projectId: '2',
    dueDate: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    id: '4',
    title: 'Fix authentication bug',
    description: 'Resolve issue with user sessions timing out unexpectedly in the mobile app.',
    status: 'blocked',
    priority: 'critical',
    assignee: 'Mike Chen',
    projectId: '2',
    dueDate: '2024-01-24T00:00:00Z',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-22T10:15:00Z'
  },
  {
    id: '5',
    title: 'Create social media content calendar',
    description: 'Plan and schedule social media posts for Q1 2024 across all platforms.',
    status: 'todo',
    priority: 'low',
    assignee: 'Emily Davis',
    projectId: '3',
    dueDate: '2024-02-05T00:00:00Z',
    createdAt: '2024-01-20T13:00:00Z',
    updatedAt: '2024-01-20T13:00:00Z'
  },
  {
    id: '6',
    title: 'Conduct user research',
    description: 'Interview 10 users about their pain points with the current website navigation.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    projectId: '1',
    dueDate: '2024-01-28T00:00:00Z',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-21T14:20:00Z'
  },
  {
    id: '7',
    title: 'Optimize database queries',
    description: 'Improve performance of slow-running queries in the user dashboard.',
    status: 'todo',
    priority: 'medium',
    assignee: 'John Smith',
    projectId: '2',
    dueDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-19T08:30:00Z',
    updatedAt: '2024-01-19T08:30:00Z'
  },
  {
    id: '8',
    title: 'Launch email campaign',
    description: 'Send out newsletter announcing new product features to all subscribers.',
    status: 'completed',
    priority: 'medium',
    assignee: 'Emily Davis',
    projectId: '3',
    dueDate: '2024-01-22T00:00:00Z',
    createdAt: '2024-01-12T15:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
  }
];