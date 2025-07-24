import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, X, Plus, CheckCircle, Calendar, User, Target, BarChart3, Trash2 } from "lucide-react";
import { Project, ProjectStatus, Milestone } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  projects: any[];
  profiles: any[];
  tasks: any[];
  updateProject: (projectId: string, updates: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
}

const ProjectDetail = ({ projectId, onBack, projects, profiles, tasks, updateProject, deleteProject, deleteTask }: ProjectDetailProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Project | null>(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });
  const { toast } = useToast();

  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setEditForm(foundProject);
    }
  }, [projectId, projects]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    try {
      // Convert frontend format to database format
      const updates = {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        project_manager_id: profiles.find(p => p.id === editForm.projectManager)?.id,
        start_date: editForm.startDate,
        target_completion_date: editForm.targetCompletionDate,
        actual_completion_date: editForm.actualCompletionDate,
      };

      await updateProject(projectId, updates);
      setProject(editForm);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: "Failed to update project. Please try again.",
      });
    }
  };

  const handleClose = () => {
    if (isEditing) {
      setEditForm(project);
      setIsEditing(false);
    } else {
      onBack();
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
      onBack(); // Go back to projects list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: error.message || "Failed to delete project. Please try again.",
      });
    }
  };

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.dueDate || !editForm) return;
    
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      dueDate: newMilestone.dueDate,
      completed: false
    };
    
    setEditForm({
      ...editForm,
      milestones: [...editForm.milestones, milestone]
    });
    setNewMilestone({ title: '', dueDate: '' });
  };

  const removeMilestone = (milestoneId: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      milestones: editForm.milestones.filter(m => m.id !== milestoneId)
    });
  };

  const toggleMilestone = (milestoneId: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      milestones: editForm.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
    });
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

  const getProjectProgress = () => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const manager = profiles.find(m => m.id === (editForm?.projectManager || project.projectManager));
  const progress = getProjectProgress();
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const projectTasks = tasks.filter(task => task.projectId === projectId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Back to Projects'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          ) : (
            <>
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Project Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-blue-100/80 p-6">
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm?.name || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value } : null)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-background rounded border">{project.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Project Status</Label>
                  {isEditing ? (
                    <Select
                      value={editForm?.status || ''}
                      onValueChange={(value: ProjectStatus) => setEditForm(editForm ? { ...editForm, status: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
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
                  ) : (
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Project Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm?.description || ''}
                    onChange={(e) => setEditForm(editForm ? { ...editForm, description: e.target.value } : null)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-2 bg-background rounded border">{project.description}</p>
                )}
              </div>

              <div>
                <Label>Project Manager</Label>
                {isEditing ? (
                  <Select
                    value={editForm?.projectManager || ''}
                    onValueChange={(value) => setEditForm(editForm ? { ...editForm, projectManager: value } : null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 p-2 bg-background rounded border">
                    {manager ? `${manager.name} (${manager.role})` : 'Unassigned'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm?.startDate || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, startDate: e.target.value } : null)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-background rounded border">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Target Completion</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm?.targetCompletionDate || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, targetCompletionDate: e.target.value } : null)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-background rounded border">
                      {project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Actual Completion</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm?.actualCompletionDate || ''}
                      onChange={(e) => setEditForm(editForm ? { ...editForm, actualCompletionDate: e.target.value } : null)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-background rounded border">
                      {project.actualCompletionDate ? new Date(project.actualCompletionDate).toLocaleDateString() : 'Not completed'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="bg-blue-100/80 p-6">
            <CardHeader>
              <CardTitle>Key Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(editForm?.milestones || project.milestones).map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-background rounded border">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => isEditing && toggleMilestone(milestone.id)}
                        disabled={!isEditing}
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300'
                        }`}
                      >
                        {milestone.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div>
                        <span className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {milestone.title}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="flex gap-2 pt-2">
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
                    <Button variant="outline" onClick={addMilestone}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
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
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{projectTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{projectTasks.filter(t => t.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Milestones</p>
                <p className="text-lg font-semibold">{completedMilestones}/{project.milestones.length} completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.targetCompletionDate && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Target: {new Date(project.targetCompletionDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.actualCompletionDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Completed: {new Date(project.actualCompletionDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;