import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Pause } from "lucide-react";
import { Task, TaskStatus } from "@/types/task";

interface ProjectTasksViewProps {
  projectId: string;
  projectName: string;
  tasks: Task[];
  onBack: () => void;
}

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'completed', 'blocked', 'on-hold', 'cancelled'];

const statusConfig = {
  'todo': { label: 'To Do', icon: Clock, color: 'bg-gray-500' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'bg-blue-500' },
  'completed': { label: 'Completed', icon: CheckCircle2, color: 'bg-green-500' },
  'blocked': { label: 'Blocked', icon: XCircle, color: 'bg-red-500' },
  'on-hold': { label: 'On Hold', icon: Pause, color: 'bg-yellow-500' },
  'cancelled': { label: 'Cancelled', icon: XCircle, color: 'bg-gray-400' },
};

const ProjectTasksView = ({ projectId, projectName, tasks, onBack }: ProjectTasksViewProps) => {
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  
  const tasksByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = projectTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleTaskClick = (task: Task) => {
    window.dispatchEvent(new CustomEvent('openTaskDetail', { detail: task }));
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="h-full bg-background p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{projectName}</h1>
            <p className="text-muted-foreground">{projectTasks.length} total tasks</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {statusOrder.map(status => {
          const statusTasks = tasksByStatus[status];
          if (statusTasks.length === 0) return null;
          
          const config = statusConfig[status];
          const Icon = config.icon;
          
          return (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  {config.label}
                  <Badge variant="secondary" className="ml-2">
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {task.assignee && (
                            <span>Assigned to: {task.assignee}</span>
                          )}
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <span>{task.percentCompleted}% complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {projectTasks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No tasks found for this project</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksView;
