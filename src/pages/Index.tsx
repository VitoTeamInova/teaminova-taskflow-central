import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ViewRenderer } from "@/components/ViewRenderer";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { useAppData } from "@/hooks/useAppData";
import { useDialogState } from "@/hooks/useDialogState";
import { useViewNavigation } from "@/hooks/useViewNavigation";
import { useTaskHandlers } from "@/hooks/useTaskHandlers";

const Index = () => {
  const { tasks, projects, profiles, loading, createTask, updateTask, createUpdateLog } = useAppData();
  const { 
    createTaskOpen, 
    editingTask, 
    taskDetailOpen, 
    openCreateTask, 
    openTaskDetail, 
    setCreateTaskOpen, 
    setTaskDetailOpen 
  } = useDialogState();
  const { 
    activeView, 
    selectedProjectId, 
    handleViewChange, 
    handleCreateProject, 
    setActiveView 
  } = useViewNavigation();
  const { 
    handleCreateTask, 
    handleStatusChange, 
    handleUpdateTask,
    handleAddUpdate
  } = useTaskHandlers(createTask, updateTask, createUpdateLog, profiles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppLayout
        projects={projects}
        activeView={activeView}
        onViewChange={handleViewChange}
        onCreateProject={handleCreateProject}
        onCreateTask={openCreateTask}
      >
        <ViewRenderer
          activeView={activeView}
          selectedProjectId={selectedProjectId}
          tasks={tasks}
          onEditTask={openTaskDetail}
          onStatusChange={handleStatusChange}
          onCreateTask={openCreateTask}
          onBackToProjects={() => setActiveView('projects')}
        />
      </AppLayout>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onCreateTask={handleCreateTask}
        projects={projects}
        teamMembers={profiles}
      />

      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={editingTask}
        allTasks={tasks}
        projects={projects}
        teamMembers={profiles}
        onUpdateTask={handleUpdateTask}
        onAddUpdate={handleAddUpdate}
      />
    </>
  );
};

export default Index;
