import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Calendar, User, Target, CheckCircle, X } from "lucide-react";
import { Project, ProjectStatus, Milestone } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

const Projects = () => {
  const { projects: dbProjects, profiles, tasks, createProject, loading } = useSupabaseData();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });
  const { toast } = useToast();

  const [newProject, setNewProject] = useState({
    name: '',
    status: 'planned' as ProjectStatus,
    description: '',
    projectManager: '',
    startDate: '',
    targetCompletionDate: '',
    actualCompletionDate: '',
    milestones: [] as Milestone[]
  });

  const resetNewProject = () => {
    setNewProject({
      name: '',
      status: 'planned',
      description: '',
      projectManager: '',
      startDate: '',
      targetCompletionDate: '',
      actualCompletionDate: '',
      milestones: []
    });
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.projectManager) {
      toast({
        title: "Error",
        description: "Please fill in required fields (Name and Project Manager).",
        variant: "destructive"
      });
      return;
    }

    const projectData = {
      name: newProject.name,
      description: newProject.description || null,
      status: newProject.status,
      project_manager_id: newProject.projectManager,
      start_date: newProject.startDate || null,
      target_completion_date: newProject.targetCompletionDate || null,
      actual_completion_date: newProject.actualCompletionDate || null,
      color: '#3B82F6'
    };

    const project = await createProject(projectData);
    if (project) {
      // Handle milestones separately if any exist
      if (newProject.milestones.length > 0) {
        for (const milestone of newProject.milestones) {
          await supabase.from('milestones').insert({
            project_id: project.id,
            title: milestone.title,
            due_date: milestone.dueDate,
            completed: milestone.completed
          });
        }
      }
      
      resetNewProject();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Project "${project.name}" has been created.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;

    const updateData = {
      name: editingProject.name,
      description: editingProject.description || null,
      status: editingProject.status,
      project_manager_id: editingProject.projectManager,
      start_date: editingProject.startDate || null,
      target_completion_date: editingProject.targetCompletionDate || null,
      actual_completion_date: editingProject.actualCompletionDate || null,
    };

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', editingProject.id);

    if (!error) {
      // Trigger data refresh to show updated information immediately
      window.location.reload();
      setIsEditDialogOpen(false);
      setEditingProject(null);
      
      toast({
        title: "Success",
        description: "Project updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = dbProjects.find(p => p.id === projectId);
    
    // Check if project has tasks
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    
    if (projectTasks.length > 0) {
      toast({
        title: "Cannot delete project",
        description: `This project has ${projectTasks.length} task${projectTasks.length !== 1 ? 's' : ''} associated with it. Please delete or reassign the tasks before deleting the project.`,
        variant: "destructive"
      });
      return;
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!error) {
      // Trigger data refresh to show updated list immediately
      window.location.reload();
      toast({
        title: "Success",
        description: `Project "${project?.name}" has been deleted.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addMilestone = (milestones: Milestone[], setMilestones: (milestones: Milestone[]) => void) => {
    if (!newMilestone.title || !newMilestone.dueDate) return;
    
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      dueDate: newMilestone.dueDate,
      completed: false
    };
    
    setMilestones([...milestones, milestone]);
    setNewMilestone({ title: '', dueDate: '' });
  };

  const removeMilestone = (milestoneId: string, milestones: Milestone[], setMilestones: (milestones: Milestone[]) => void) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
  };

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'default';
      case 'started': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track project progress</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Project Status</Label>
                  <Select value={newProject.status} onValueChange={(value: ProjectStatus) => setNewProject({ ...newProject, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="manager">Project Manager *</Label>
                <Select value={newProject.projectManager} onValueChange={(value) => setNewProject({ ...newProject, projectManager: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role || 'Team Member'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Completion Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newProject.targetCompletionDate}
                    onChange={(e) => setNewProject({ ...newProject, targetCompletionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="actualDate">Actual Completion Date</Label>
                  <Input
                    id="actualDate"
                    type="date"
                    value={newProject.actualCompletionDate}
                    onChange={(e) => setNewProject({ ...newProject, actualCompletionDate: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Key Milestones</Label>
                <div className="space-y-2 mt-2">
                  {newProject.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <span className="font-medium">{milestone.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id, newProject.milestones, (milestones) => setNewProject({ ...newProject, milestones }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Milestone title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => addMilestone(newProject.milestones, (milestones) => setNewProject({ ...newProject, milestones }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddProject} className="flex-1">Create Project</Button>
                <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewProject();}} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dbProjects.map(project => {
          const manager = profiles.find(m => m.id === project.project_manager_id);
          const progress = getProjectProgress(project.id);
          const completedMilestones = 0; // TODO: implement milestones from database
          
          return (
            <Card key={project.id} className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                     <Badge 
                       variant={getStatusBadgeVariant(project.status as ProjectStatus)}
                       className="w-fit"
                     >
                       {project.status.replace('-', ' ')}
                     </Badge>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full ml-2" 
                    style={{ backgroundColor: project.color }}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{manager ? `${manager.name} (${manager.role || 'Team Member'})` : 'Unassigned'}</span>
                  </div>
                  
                  {project.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {project.target_completion_date && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Target: {new Date(project.target_completion_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${progress}%`, 
                        backgroundColor: project.color 
                      }}
                    />
                  </div>
                </div>

                {/* TODO: Implement milestones display from database */}

                <div className="flex gap-2 pt-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1"
                     onClick={() => {
                       // Create a dialog to view project tasks
                       const projectTasks = tasks.filter(task => task.project_id === project.id);
                       // We'll create a custom event to open task details similar to team page
                       const projectTasksEvent = new CustomEvent('openProjectTasks', { 
                         detail: { 
                           project, 
                           tasks: projectTasks 
                         } 
                       });
                       window.dispatchEvent(projectTasksEvent);
                     }}
                   >
                     <User className="h-4 w-4 mr-1" />
                     View Tasks
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1"
                      onClick={() => {
                        // Convert database project to local project format
                        const localProject: Project = {
                          id: project.id,
                          name: project.name,
                          description: project.description || '',
                          status: project.status as ProjectStatus,
                          projectManager: project.project_manager_id || '',
                          startDate: project.start_date || '',
                          targetCompletionDate: project.target_completion_date || '',
                          actualCompletionDate: project.actual_completion_date || '',
                          color: project.color,
                          createdAt: project.created_at,
                          milestones: []
                        };
                        setEditingProject(localProject);
                        setIsEditDialogOpen(true);
                      }}
                   >
                     <Pencil className="h-4 w-4 mr-1" />
                     Edit
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => handleDeleteProject(project.id)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
              {/* Similar form structure as add dialog but with editingProject data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Project Status</Label>
                  <Select value={editingProject.status} onValueChange={(value: ProjectStatus) => setEditingProject({ ...editingProject, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Project Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-manager">Project Manager</Label>
                <Select value={editingProject.projectManager} onValueChange={(value) => setEditingProject({ ...editingProject, projectManager: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.role || 'Team Member'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={editingProject.startDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-targetDate">Target Completion Date</Label>
                  <Input
                    id="edit-targetDate"
                    type="date"
                    value={editingProject.targetCompletionDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, targetCompletionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-actualDate">Actual Completion Date</Label>
                  <Input
                    id="edit-actualDate"
                    type="date"
                    value={editingProject.actualCompletionDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, actualCompletionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditProject} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;