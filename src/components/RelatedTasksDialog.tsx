import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/types/task";

interface RelatedTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  currentTaskId: string;
  selectedRelatedTasks: string[];
  onSubmit: (relatedTaskIds: string[]) => void;
}

export function RelatedTasksDialog({ 
  open, 
  onOpenChange, 
  tasks, 
  currentTaskId,
  selectedRelatedTasks,
  onSubmit 
}: RelatedTasksDialogProps) {
  const [selected, setSelected] = useState<string[]>(selectedRelatedTasks);

  // Filter out the current task from the list
  const availableTasks = tasks.filter(task => task.id !== currentTaskId);

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, taskId]);
    } else {
      setSelected(selected.filter(id => id !== taskId));
    }
  };

  const handleSubmit = () => {
    onSubmit(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Related Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            <div className="space-y-3">
              {availableTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No other tasks available in this project
                </p>
              ) : (
                availableTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted">
                    <Checkbox
                      id={task.id}
                      checked={selected.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label 
                        htmlFor={task.id} 
                        className="font-medium cursor-pointer leading-none"
                      >
                        {task.title}
                      </Label>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{task.status.replace('-', ' ')}</span>
                        <span>•</span>
                        <span className="capitalize">{task.priority}</span>
                        {task.assignee && (
                          <>
                            <span>•</span>
                            <span>{task.assignee}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-hover">
              Update Related Tasks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}