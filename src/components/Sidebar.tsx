import { Home, CheckSquare, Calendar, Users, BarChart3, Settings, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  projects: Project[];
  tasks: Task[];
  profiles: any[];
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

export function Sidebar({ projects, tasks, profiles, activeView, onViewChange, onCreateProject, onSettingsClick }: SidebarProps) {
  const { user } = useAuth();
  
  // Get current user's profile to filter assigned tasks
  const currentUserProfile = profiles.find(p => p.user_id === user?.id);
  const userTasks = tasks.filter(task => 
    task.assignee === currentUserProfile?.name || 
    (task as any).assignee_id === currentUserProfile?.id
  );
  
  const navigationItems = getNavigationItems(userTasks.length);
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
              Projects Covered
            </h3>
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className="w-full flex items-center h-9 text-sm px-3 py-2 text-muted-foreground"
              >
                <FolderOpen className="h-4 w-4 mr-3" style={{ color: project.color }} />
                <span className="truncate">{project.name}</span>
              </div>
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