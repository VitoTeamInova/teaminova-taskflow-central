import { Home, CheckSquare, Calendar, Users, BarChart3, Settings, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project, Task } from "@/types/task";

interface SidebarProps {
  projects: Project[];
  tasks: Task[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProject?: () => void;
  onSettingsClick?: () => void;
}

const getNavigationItems = (taskCount: number) => [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tasks', label: 'All Tasks', icon: CheckSquare, count: taskCount },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ projects, tasks, activeView, onViewChange, onCreateProject, onSettingsClick }: SidebarProps) {
  const navigationItems = getNavigationItems(tasks.length);
  return (
    <aside className="w-64 border-r bg-card h-full">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <Badge variant="secondary" className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Projects
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={onCreateProject}
              title="Create new project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className="w-full justify-start h-9 text-sm"
                onClick={() => onViewChange(`project-${project.id}`)}
              >
                <FolderOpen className="h-4 w-4 mr-3" style={{ color: project.color }} />
                <span className="truncate">{project.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start" onClick={onSettingsClick}>
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </div>
      </div>
    </aside>
  );
}