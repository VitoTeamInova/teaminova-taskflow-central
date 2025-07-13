import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ViewRenderer } from "@/components/ViewRenderer";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { ProjectTasksDialog } from "@/components/ProjectTasksDialog";
import { useAppData } from "@/hooks/useAppData";
import { useDialogState } from "@/hooks/useDialogState";
import { useViewNavigation } from "@/hooks/useViewNavigation";
import { useTaskHandlers } from "@/hooks/useTaskHandlers";

const Index = () => {
  const { tasks, projects, profiles, loading, createTask, updateTask, createUpdateLog, updateRelatedTasks } = useAppData();
  const { 
    createTaskOpen, 
    editingTask, 
    taskDetailOpen, 
    openCreateTask, 
    openTaskDetail, 
    setCreateTaskOpen, 
    setTaskDetailOpen 
  } = useDialogState();
  
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isProjectTasksOpen, setIsProjectTasksOpen] = useState(false);

  // Listen for custom events to open task detail from Team page and Projects page
  useEffect(() => {
    const handleOpenTaskDetail = (event: CustomEvent) => {
      openTaskDetail(event.detail);
    };

    const handleOpenProjectTasks = (event: CustomEvent) => {
      setSelectedProject(event.detail.project);
      setProjectTasks(event.detail.tasks);
      setIsProjectTasksOpen(true);
    };

    window.addEventListener('openTaskDetail', handleOpenTaskDetail as EventListener);
    window.addEventListener('openProjectTasks', handleOpenProjectTasks as EventListener);
    
    return () => {
      window.removeEventListener('openTaskDetail', handleOpenTaskDetail as EventListener);
      window.removeEventListener('openProjectTasks', handleOpenProjectTasks as EventListener);
    };
  }, [openTaskDetail]);
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
    handleAddUpdate,
    handleUpdateRelatedTasks
  } = useTaskHandlers(createTask, updateTask, createUpdateLog, updateRelatedTasks, profiles);

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
        tasks={tasks}
        profiles={profiles}
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
        onUpdateRelatedTasks={handleUpdateRelatedTasks}
      />
      
      <ProjectTasksDialog
        project={selectedProject}
        tasks={projectTasks}
        isOpen={isProjectTasksOpen}
        onOpenChange={setIsProjectTasksOpen}
      />
    </>
  );
};

export default Index;
