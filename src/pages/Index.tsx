import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TaskBoard } from "@/components/TaskBoard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { Task, TaskStatus } from "@/types/task";
import { mockTasks, mockProjects, mockTeamMembers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeView, setActiveView] = useState('tasks');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      percentCompleted: taskData.percentCompleted || 0,
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      updateLog: taskData.updateLog || [],
      relatedTasks: taskData.relatedTasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTask]);
    toast({
      title: "Task created",
      description: `"${newTask.title}" has been added to your tasks.`,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ));
    
    toast({
      title: "Task updated",
      description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDetailOpen(true);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates }
        : task
    ));
    
    toast({
      title: "Task updated",
      description: "Task has been successfully updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={() => setCreateTaskOpen(true)} />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar 
          projects={mockProjects} 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        
        <main className="flex-1 overflow-hidden">
          {activeView === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              onEditTask={handleEditTask}
              onStatusChange={handleStatusChange}
              onCreateTask={() => setCreateTaskOpen(true)}
            />
          )}
          
          {activeView === 'dashboard' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          )}
          
          {activeView === 'calendar' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Calendar View</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          )}
          
          {activeView === 'team' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Team Management</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
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
        projects={mockProjects}
        teamMembers={mockTeamMembers}
      />

      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={editingTask}
        allTasks={tasks}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
};

export default Index;
