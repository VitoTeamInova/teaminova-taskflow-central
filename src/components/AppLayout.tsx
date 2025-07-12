import { ReactNode, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Task, Project } from "@/types/task";

interface AppLayoutProps {
  children: ReactNode;
  projects: Project[];
  tasks: Task[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProject: () => void;
  onCreateTask: () => void;
}

export function AppLayout({ 
  children, 
  projects,
  tasks, 
  activeView, 
  onViewChange, 
  onCreateProject, 
  onCreateTask 
}: AppLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={onCreateTask} />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar 
          projects={projects}
          tasks={tasks}
          activeView={activeView}
          onViewChange={onViewChange}
          onCreateProject={onCreateProject}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        
        <SettingsDialog 
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          projects={projects}
        />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}