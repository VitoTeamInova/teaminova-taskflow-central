import { useState } from "react";
import { Task } from "@/types/task";

export function useDialogState() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  const openCreateTask = () => setCreateTaskOpen(true);
  const closeCreateTask = () => setCreateTaskOpen(false);

  const openTaskDetail = (task: Task) => {
    setEditingTask(task);
    setTaskDetailOpen(true);
  };
  
  const closeTaskDetail = () => {
    setTaskDetailOpen(false);
    setEditingTask(null);
  };

  return {
    createTaskOpen,
    editingTask,
    taskDetailOpen,
    openCreateTask,
    closeCreateTask,
    openTaskDetail,
    closeTaskDetail,
    setCreateTaskOpen,
    setTaskDetailOpen
  };
}