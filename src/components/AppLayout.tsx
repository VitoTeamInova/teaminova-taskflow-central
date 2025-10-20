import { ReactNode, useState } from "react";
import { Header } from "@/components/Header";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Task, Project } from "@/types/task";

interface AppLayoutProps {
  children: ReactNode;
  projects: Project[];
  tasks: Task[];
  profiles: any[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProject: () => void;
  onCreateTask: () => void;
}

export function AppLayout({ 
  children, 
  projects,
  tasks,
  profiles, 
  activeView, 
  onViewChange, 
  onCreateProject, 
  onCreateTask 
}: AppLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Header 
        onViewChange={onViewChange} 
        onSettingsClick={() => setSettingsOpen(true)}
        onCreateProject={onCreateProject}
        projects={projects}
        activeView={activeView}
      />
      
      <SettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        projects={projects}
      />
      
      <main className="h-[calc(100vh-64px)] overflow-auto">
        {children}
      </main>
    </div>
  );
}