import { Home, CheckSquare, Calendar, Users, BarChart3, Settings, FolderOpen, Plus, ChevronDown, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  projects: Project[];
  tasks: Task[];
  profiles: any[];
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProject?: () => void;
  onSettingsClick?: () => void;
}

const getNavigationItems = (taskCount: number, activeTaskCount: number) => [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ projects, tasks, profiles, activeView, onViewChange, onCreateProject, onSettingsClick }: SidebarProps) {
  const { user } = useAuth();
  const [tasksOpen, setTasksOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);
  
  // Get current user's profile to filter assigned tasks
  const currentUserProfile = profiles.find(p => p.user_id === user?.id);
  const userTasks = tasks.filter(task => 
    task.assignee === currentUserProfile?.name || 
    (task as any).assignee_id === currentUserProfile?.id
  );
  
  // Count only non-cancelled tasks
  const activeTaskCount = tasks.filter(t => t.status !== 'cancelled').length;
  
  const navigationItems = getNavigationItems(userTasks.length, activeTaskCount);
  return (
    <aside className="w-64 border-r bg-card h-full">
      <div className="p-4 flex flex-col h-full">
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          ))}

          {/* Tasks Section */}
          <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-10">
                {tasksOpen ? <ChevronDown className="h-4 w-4 mr-3" /> : <ChevronRight className="h-4 w-4 mr-3" />}
                <span className="flex-1 text-left">Tasks</span>
                <Badge variant="secondary" className="ml-auto">
                  {activeTaskCount}
                </Badge>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-1 space-y-1">
              <Button
                variant={activeView === 'tasks' ? "secondary" : "ghost"}
                className="w-full justify-start h-9 text-sm"
                onClick={() => onViewChange('tasks')}
              >
                <CheckSquare className="h-3 w-3 mr-3" />
                Kanban Board
              </Button>
              <Button
                variant={activeView === 'task-list' ? "secondary" : "ghost"}
                className="w-full justify-start h-9 text-sm"
                onClick={() => onViewChange('task-list')}
              >
                <List className="h-3 w-3 mr-3" />
                List View
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Team Section */}
          <Collapsible open={teamOpen} onOpenChange={setTeamOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-10">
                {teamOpen ? <ChevronDown className="h-4 w-4 mr-3" /> : <ChevronRight className="h-4 w-4 mr-3" />}
                <span className="flex-1 text-left">Team</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-1 space-y-1">
              <Button
                variant={activeView === 'team' ? "secondary" : "ghost"}
                className="w-full justify-start h-9 text-sm"
                onClick={() => onViewChange('team')}
              >
                <Users className="h-3 w-3 mr-3" />
                Card View
              </Button>
              <Button
                variant={activeView === 'team-list' ? "secondary" : "ghost"}
                className="w-full justify-start h-9 text-sm"
                onClick={() => onViewChange('team-list')}
              >
                <List className="h-3 w-3 mr-3" />
                List View
              </Button>
            </CollapsibleContent>
          </Collapsible>
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