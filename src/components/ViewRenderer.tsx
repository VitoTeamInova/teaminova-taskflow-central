import { TaskBoard } from "@/components/TaskBoard";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Team from "@/pages/Team";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import { Task, TaskStatus } from "@/types/task";

interface ViewRendererProps {
  activeView: string;
  selectedProjectId: string | null;
  tasks: Task[];
  projects: any[];
  profiles: any[];
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onCreateTask: () => void;
  onBackToProjects: () => void;
  updateProject: (projectId: string, updates: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
}

export function ViewRenderer({
  activeView,
  selectedProjectId,
  tasks,
  projects,
  profiles,
  onEditTask,
  onStatusChange,
  onCreateTask,
  onBackToProjects,
  updateProject,
  deleteProject,
  deleteTask
}: ViewRendererProps) {
  switch (activeView) {
    case 'tasks':
      return (
        <TaskBoard
          tasks={tasks}
          onEditTask={onEditTask}
          onViewTask={onEditTask}
          onStatusChange={onStatusChange}
          onCreateTask={onCreateTask}
          onDeleteTask={deleteTask}
        />
      );
    case 'dashboard':
      return <Dashboard />;
    case 'calendar':
      return <Calendar />;
    case 'team':
      return <Team />;
    case 'projects':
      return <Projects />;
    case 'project-detail':
      return selectedProjectId ? (
        <ProjectDetail 
          projectId={selectedProjectId} 
          onBack={onBackToProjects}
          projects={projects}
          profiles={profiles}
          tasks={tasks}
          updateProject={updateProject}
          deleteProject={deleteProject}
          deleteTask={deleteTask}
        />
      ) : null;
    case 'reports':
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}