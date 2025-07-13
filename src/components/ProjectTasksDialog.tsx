import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Target } from "lucide-react";

interface ProjectTasksDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  tasks: any[];
}

export function ProjectTasksDialog({ isOpen, onOpenChange, project, tasks }: ProjectTasksDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            {project.name} - Tasks
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span> {project.status.replace('-', ' ')}
              </div>
              <div>
                <span className="font-medium">Manager:</span> {project.project_manager?.name || 'Unassigned'}
              </div>
              {project.start_date && (
                <div>
                  <span className="font-medium">Started:</span> {new Date(project.start_date).toLocaleDateString()}
                </div>
              )}
              {project.target_completion_date && (
                <div>
                  <span className="font-medium">Target:</span> {new Date(project.target_completion_date).toLocaleDateString()}
                </div>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Project Tasks ({tasks.length})</h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks assigned to this project yet.
                  </p>
                ) : (
                  tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        // Close project tasks dialog and open task detail
                        onOpenChange(false);
                        // Convert database task format to frontend format for the event
                        const frontendTask = {
                          id: task.id,
                          title: task.title,
                          description: task.description || '',
                          status: task.status,
                          priority: task.priority,
                          assignee: task.assignee?.name || '',
                          assigneeId: task.assignee_id || '',
                          projectId: task.project_id,
                          dueDate: task.due_date || '',
                          startDate: task.start_date || '',
                          completionDate: task.completion_date || '',
                          createdAt: task.created_at,
                          updatedAt: task.updated_at,
                          actualHours: task.actual_hours,
                          estimatedHours: task.estimated_hours,
                          percentCompleted: task.percent_completed,
                          project: task.project,
                          updateLog: (task.update_logs || []).map((log: any) => ({
                            timestamp: log.created_at,
                            text: log.text
                          })),
                          updateLogs: task.update_logs || [],
                          relatedTasks: task.related_tasks?.map((rt: any) => rt.related_task_id) || []
                        };
                        window.dispatchEvent(new CustomEvent('openTaskDetail', { detail: frontendTask }));
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{task.title}</h5>
                        <Badge 
                          variant={task.status === 'completed' ? 'default' : 'outline'}
                          className="ml-2"
                        >
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <Badge 
                          variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}
                        >
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee.name}</span>
                            </div>
                          )}
                          <span>{task.percent_completed}% complete</span>
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}