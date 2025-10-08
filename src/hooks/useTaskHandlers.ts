import { Task, TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";

export function useTaskHandlers(
  createTask: (data: any) => Promise<any>,
  updateTask: (id: string, data: any) => Promise<any>,
  deleteTask: (id: string) => Promise<any>,
  createUpdateLog: (taskId: string, text: string) => Promise<any>,
  updateRelatedTasks: (taskId: string, relatedTaskIds: string[]) => Promise<any>,
  profiles: any[]
) {
  const { toast } = useToast();
  const { defaultProjectId } = useSettings();

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Use default project if no project is specified
      const projectId = taskData.projectId || defaultProjectId;
      
      // Convert frontend task data to database format
      // Resolve assignee id from provided fields (id > name/email > none)
      const resolvedAssigneeId = (taskData as any).assigneeId
        || (taskData.assignee
          ? (profiles.find((p) => p.id === (taskData as any).assignee || p.name === taskData.assignee || p.email === (taskData as any).assignee)?.id ?? null)
          : null);

      const dbTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: resolvedAssigneeId,
        project_id: projectId,
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
      if (!taskId || typeof taskId !== 'string') {
        throw new Error('Invalid task ID provided');
      }
      if (!newStatus || typeof newStatus !== 'string') {
        throw new Error('Invalid status provided');
      }
      
      await updateTask(taskId, { status: newStatus });
      
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
      });
    } catch (error) {
      console.error('Task status update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task status. Please try again.",
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert frontend updates to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.completionDate !== undefined) dbUpdates.completion_date = updates.completionDate;
      if (updates.percentCompleted !== undefined) dbUpdates.percent_completed = updates.percentCompleted;
      if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) dbUpdates.actual_hours = updates.actualHours;
      if (updates.reference_url !== undefined) dbUpdates.reference_url = updates.reference_url;
      if (updates.assigneeId !== undefined) {
        dbUpdates.assignee_id = updates.assigneeId || null;
      } else if (updates.assignee !== undefined) {
        dbUpdates.assignee_id = updates.assignee ? profiles.find(p => p.name === updates.assignee || p.email === updates.assignee)?.id : null;
      }

      await updateTask(taskId, dbUpdates);
      
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    } catch (error) {
      console.error('Task update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task. Please try again.",
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

  const handleUpdateRelatedTasks = async (taskId: string, relatedTaskIds: string[]) => {
    try {
      await updateRelatedTasks(taskId, relatedTaskIds);
      
      toast({
        title: "Related tasks updated",
        description: "Task relationships have been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating related tasks",
        description: "Failed to update related tasks. Please try again.",
      });
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await deleteTask(taskId);
      
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted.",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: "Failed to delete task. Please try again.",
      });
      return false;
    }
  };

  return {
    handleCreateTask,
    handleStatusChange,
    handleUpdateTask,
    handleAddUpdate,
    handleUpdateRelatedTasks,
    handleDeleteTask
  };
}