import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  projects: any[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProject: () => void;
  onCreateTask: () => void;
}

export function AppLayout({ 
  children, 
  projects, 
  activeView, 
  onViewChange, 
  onCreateProject, 
  onCreateTask 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={onCreateTask} />
      
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar 
          projects={projects} 
          activeView={activeView} 
          onViewChange={onViewChange}
          onCreateProject={onCreateProject}
        />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}