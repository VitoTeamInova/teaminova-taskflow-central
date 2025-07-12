import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TaskBoard } from "@/components/TaskBoard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import Team from "./Team";
import Projects from "./Projects";
import ProjectDetail from "./ProjectDetail";
import { Task, TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState('tasks');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { toast } = useToast();
  const { 
    tasks, 
    projects, 
    profiles, 
    loading, 
    createTask, 
    updateTask 
  } = useSupabaseData();

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Convert frontend task data to database format
      const dbTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assignee ? profiles.find(p => p.name === taskData.assignee)?.id : undefined,
        project_id: taskData.projectId,
        due_date: taskData.dueDate,
        estimated_hours: taskData.estimatedHours || 0,
      };

      await createTask(dbTaskData);
      
      toast({
        title: "Task created",
        description: `"${taskData.title}" has been added to your tasks.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDetailOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert frontend updates to database format
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (updates.percentCompleted !== undefined) dbUpdates.percent_completed = updates.percentCompleted;
      if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) dbUpdates.actual_hours = updates.actualHours;
      if (updates.assignee) {
        dbUpdates.assignee_id = profiles.find(p => p.name === updates.assignee)?.id;
      }

      await updateTask(taskId, dbUpdates);
      
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Failed to update task. Please try again.",
      });
    }
  };

  const handleViewChange = (view: string) => {
    if (view.startsWith('project-')) {
      const projectId = view.replace('project-', '');
      setSelectedProjectId(projectId);
      setActiveView('project-detail');
    } else {
      setActiveView(view);
      setSelectedProjectId(null);
    }
  };

  const handleCreateProject = () => {
    setActiveView('projects');
    // The Projects component handles the creation dialog
  };

  // Convert database tasks to frontend format for backward compatibility
  const convertedTasks: Task[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status as TaskStatus,
    priority: task.priority as any,
    assignee: task.assignee?.name || '',
    projectId: task.project_id,
    dueDate: task.due_date || undefined,
    startDate: task.start_date || undefined,
    completionDate: task.completion_date || undefined,
    percentCompleted: task.percent_completed,
    estimatedHours: task.estimated_hours,
    actualHours: task.actual_hours,
    updateLog: [], // TODO: Fetch from update_log table
    relatedTasks: [], // TODO: Fetch from related_tasks table
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={() => setCreateTaskOpen(true)} />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar 
          projects={convertedProjects} 
          activeView={activeView} 
          onViewChange={handleViewChange}
          onCreateProject={handleCreateProject}
        />
        
        <main className="flex-1 overflow-hidden">
          {activeView === 'tasks' && (
            <TaskBoard
              tasks={convertedTasks}
              onEditTask={handleEditTask}
              onStatusChange={handleStatusChange}
              onCreateTask={() => setCreateTaskOpen(true)}
            />
          )}
          
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'calendar' && <Calendar />}
          {activeView === 'team' && <Team />}
          {activeView === 'projects' && <Projects />}
          
          {activeView === 'project-detail' && selectedProjectId && (
            <ProjectDetail 
              projectId={selectedProjectId} 
              onBack={() => setActiveView('projects')}
            />
          )}
          
          {activeView === 'reports' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onCreateTask={handleCreateTask}
        projects={convertedProjects}
        teamMembers={convertedProfiles}
      />

      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={editingTask}
        allTasks={convertedTasks}
        projects={convertedProjects}
        teamMembers={convertedProfiles}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
};

export default Index;
