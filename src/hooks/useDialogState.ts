import { useState } from "react";
import { Task } from "@/types/task";

export function useDialogState() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [taskDetailInitialEdit, setTaskDetailInitialEdit] = useState(false);

  const openCreateTask = () => setCreateTaskOpen(true);
  const closeCreateTask = () => setCreateTaskOpen(false);

  const openTaskDetail = (task: Task, edit: boolean = false) => {
    setEditingTask(task);
    setTaskDetailInitialEdit(!!edit);
    setTaskDetailOpen(true);
  };
  
  const closeTaskDetail = () => {
    setTaskDetailOpen(false);
    setEditingTask(null);
    setTaskDetailInitialEdit(false);
  };

  return {
    createTaskOpen,
    editingTask,
    taskDetailOpen,
    taskDetailInitialEdit,
    openCreateTask,
    closeCreateTask,
    openTaskDetail,
    closeTaskDetail,
    setCreateTaskOpen,
    setTaskDetailOpen,
    setTaskDetailInitialEdit,
  };
}