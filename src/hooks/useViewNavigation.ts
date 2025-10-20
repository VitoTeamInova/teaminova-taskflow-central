import { useState } from "react";

export function useViewNavigation() {
  const [activeView, setActiveView] = useState('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleViewChange = (view: string) => {
    if (view.startsWith('project-')) {
      const projectId = view.replace('project-', '');
      setSelectedProjectId(projectId);
      setActiveView('project-detail');
    } else if (view.startsWith('issues-')) {
      setActiveView(view);
      setSelectedProjectId(null);
    } else {
      setActiveView(view);
      setSelectedProjectId(null);
    }
  };

  const handleCreateProject = () => {
    setActiveView('projects');
    // The Projects component handles the creation dialog
  };

  return {
    activeView,
    selectedProjectId,
    handleViewChange,
    handleCreateProject,
    setActiveView
  };
}