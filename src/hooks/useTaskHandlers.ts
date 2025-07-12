import { Task, TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useTaskHandlers(
  createTask: (data: any) => Promise<any>,
  updateTask: (id: string, data: any) => Promise<any>,
  createUpdateLog: (taskId: string, text: string) => Promise<any>,
  profiles: any[]
) {
  const { toast } = useToast();

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Convert frontend task data to database format
      const dbTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assignee || null,
        project_id: taskData.projectId,
        due_date: taskData.dueDate,
        estimated_hours: taskData.estimatedHours || 0,
      };

      await createTask(dbTaskData);
      
      toast({
        title: "Task created",
        description: `"${taskData.title}" has been added to your tasks.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert frontend updates to database format
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (updates.percentCompleted !== undefined) dbUpdates.percent_completed = updates.percentCompleted;
      if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) dbUpdates.actual_hours = updates.actualHours;
      if (updates.assignee) {
        dbUpdates.assignee_id = profiles.find(p => p.name === updates.assignee)?.id;
      }

      await updateTask(taskId, dbUpdates);
      
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Failed to update task. Please try again.",
      });
    }
  };

  const handleAddUpdate = async (taskId: string, updateText: string) => {
    try {
      await createUpdateLog(taskId, updateText);
      
      toast({
        title: "Update added",
        description: "Task update has been successfully added.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding update",
        description: "Failed to add update. Please try again.",
      });
    }
  };

  return {
    handleCreateTask,
    handleStatusChange,
    handleUpdateTask,
    handleAddUpdate
  };
}