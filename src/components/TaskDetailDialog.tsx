import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, BarChart3, Edit } from "lucide-react";
import { Task, UpdateLogEntry } from "@/types/task";
import { UpdateLogDialog } from "./UpdateLogDialog";
import { RelatedTasksDialog } from "./RelatedTasksDialog";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  allTasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailDialog({ 
  open, 
  onOpenChange, 
  task, 
  allTasks,
  onUpdateTask 
}: TaskDetailDialogProps) {
  const [updateLogOpen, setUpdateLogOpen] = useState(false);
  const [relatedTasksOpen, setRelatedTasksOpen] = useState(false);

  if (!task) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddUpdate = (updateText: string) => {
    const newUpdate: UpdateLogEntry = {
      timestamp: new Date().toISOString(),
      text: updateText
    };
    
    const updatedLog = [newUpdate, ...task.updateLog];
    onUpdateTask(task.id, { 
      updateLog: updatedLog,
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateRelatedTasks = (relatedTaskIds: string[]) => {
    onUpdateTask(task.id, { 
      relatedTasks: relatedTaskIds,
      updatedAt: new Date().toISOString()
    });
  };

  const projectTasks = allTasks.filter(t => t.projectId === task.projectId);
  const relatedTasksData = allTasks.filter(t => task.relatedTasks.includes(t.id));

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'blocked': 'bg-red-100 text-red-800'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{task.title}</span>
              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description || "No description provided"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Assignee:</span>
                      <span>{task.assignee || "Unassigned"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    {task.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Start:</span>
                        <span>{formatDate(task.startDate)}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Due:</span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Progress and Time Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Progress ({task.percentCompleted}%)
                  </Label>
                  <Progress value={task.percentCompleted} className="mt-2" />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Tracking
                  </Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Hours:</span>
                      <span>{task.estimatedHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Hours:</span>
                      <span>{task.actualHours}h</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Remaining:</span>
                      <span className={task.actualHours > task.estimatedHours ? "text-red-600" : ""}>
                        {Math.max(0, task.estimatedHours - task.actualHours)}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Update Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Update Log</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpdateLogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Update
                  </Button>
                </div>
                
                {task.updateLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No updates yet</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {task.updateLog.map((update, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4 py-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          {formatDateTime(update.timestamp)}
                        </div>
                        <p className="text-sm">{update.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Related Tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Related Tasks</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRelatedTasksOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Manage
                  </Button>
                </div>
                
                {relatedTasksData.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No related tasks</p>
                ) : (
                  <div className="space-y-2">
                    {relatedTasksData.map((relatedTask) => (
                      <div key={relatedTask.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="text-sm font-medium">{relatedTask.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {relatedTask.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {relatedTask.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {relatedTask.assignee}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UpdateLogDialog
        open={updateLogOpen}
        onOpenChange={setUpdateLogOpen}
        onSubmit={handleAddUpdate}
      />

      <RelatedTasksDialog
        open={relatedTasksOpen}
        onOpenChange={setRelatedTasksOpen}
        tasks={projectTasks}
        currentTaskId={task.id}
        selectedRelatedTasks={task.relatedTasks}
        onSubmit={handleUpdateRelatedTasks}
      />
    </>
  );
}