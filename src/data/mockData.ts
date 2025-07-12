import { Task, Project, TeamMember } from "@/types/task";

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'in-progress',
    projectManager: '1',
    startDate: '2024-01-15',
    targetCompletionDate: '2024-06-15',
    milestones: [
      {
        id: 'm1',
        title: 'Design Phase Complete',
        dueDate: '2024-03-15',
        completed: true
      },
      {
        id: 'm2', 
        title: 'Development Phase Complete',
        dueDate: '2024-05-15',
        completed: false
      }
    ],
    color: '#3B82F6',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'New mobile application development',
    status: 'started',
    projectManager: '2',
    startDate: '2024-02-01',
    targetCompletionDate: '2024-08-01',
    milestones: [
      {
        id: 'm3',
        title: 'MVP Release',
        dueDate: '2024-05-01',
        completed: false
      }
    ],
    color: '#10B981',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q1 2024 marketing initiatives',
    status: 'planned',
    projectManager: '3',
    startDate: '2024-03-01',
    targetCompletionDate: '2024-05-31',
    milestones: [],
    color: '#F59E0B',
    createdAt: '2024-02-01T10:00:00Z'
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@teaminova.com',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@teaminova.com',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@teaminova.com',
    role: 'Full Stack Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@teaminova.com',
    role: 'Marketing Specialist',
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
    startDate: '2024-01-15T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 65,
    estimatedHours: 20,
    actualHours: 12.5,
    updateLog: [
      { timestamp: '2024-01-22T15:30:00Z', text: 'Completed initial wireframes and started working on responsive design' },
      { timestamp: '2024-01-20T10:15:00Z', text: 'Research phase completed, moving to design phase' }
    ],
    relatedTasks: ['2'],
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
    startDate: '2024-01-18T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 0,
    estimatedHours: 16,
    actualHours: 0,
    updateLog: [],
    relatedTasks: ['1', '3'],
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
    startDate: '2024-01-10T00:00:00Z',
    completionDate: '2024-01-18T00:00:00Z',
    percentCompleted: 100,
    estimatedHours: 12,
    actualHours: 14,
    updateLog: [
      { timestamp: '2024-01-19T16:45:00Z', text: 'Documentation completed and reviewed by team' },
      { timestamp: '2024-01-15T11:20:00Z', text: 'Added examples for authentication endpoints' },
      { timestamp: '2024-01-12T14:00:00Z', text: 'Initial draft of API documentation created' }
    ],
    relatedTasks: ['2'],
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
    startDate: '2024-01-17T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 25,
    estimatedHours: 24,
    actualHours: 8,
    updateLog: [
      { timestamp: '2024-01-22T10:15:00Z', text: 'Blocked waiting for server access permissions' },
      { timestamp: '2024-01-19T09:30:00Z', text: 'Initial investigation started' }
    ],
    relatedTasks: [],
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
    startDate: '2024-01-19T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 10,
    estimatedHours: 32,
    actualHours: 3,
    updateLog: [
      { timestamp: '2024-01-20T13:00:00Z', text: 'Project planning phase started' }
    ],
    relatedTasks: [],
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
    startDate: '2024-01-17T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 40,
    estimatedHours: 15,
    actualHours: 6,
    updateLog: [
      { timestamp: '2024-01-21T14:20:00Z', text: 'Completed 4 out of 10 user interviews' },
      { timestamp: '2024-01-18T16:00:00Z', text: 'User research plan finalized, interviews started' }
    ],
    relatedTasks: ['1'],
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
    startDate: '2024-01-25T00:00:00Z',
    completionDate: undefined,
    percentCompleted: 0,
    estimatedHours: 10,
    actualHours: 0,
    updateLog: [],
    relatedTasks: ['3'],
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
    startDate: '2024-01-12T00:00:00Z',
    completionDate: '2024-01-23T00:00:00Z',
    percentCompleted: 100,
    estimatedHours: 8,
    actualHours: 7.5,
    updateLog: [
      { timestamp: '2024-01-22T09:00:00Z', text: 'Email campaign successfully launched to all subscribers' },
      { timestamp: '2024-01-20T14:30:00Z', text: 'Final testing completed, ready for launch' },
      { timestamp: '2024-01-15T10:00:00Z', text: 'Email content and design approved' }
    ],
    relatedTasks: ['5'],
    createdAt: '2024-01-12T15:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
  }
];