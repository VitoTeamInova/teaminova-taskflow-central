import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskPriority, TaskStatus, Project, TeamMember } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projects: Project[];
  teamMembers: TeamMember[];
}

export function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  onCreateTask, 
  projects, 
  teamMembers 
}: CreateTaskDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: '',
    projectId: '',
    dueDate: '',
    startDate: '',
    completionDate: '',
    percentCompleted: 0,
    estimatedHours: 0,
    actualHours: 0,
    updateLog: [],
    relatedTasks: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!formData.title.trim()) missingFields.push("Title");
    if (!formData.description.trim()) missingFields.push("Description");
    if (!formData.projectId) missingFields.push("Project");
    
    if (missingFields.length > 0) {
      toast({
        title: "Save failed",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    onCreateTask({
      ...formData,
      dueDate: formData.dueDate || undefined,
      startDate: formData.startDate || undefined,
      completionDate: formData.completionDate || undefined
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      projectId: '',
      dueDate: '',
      startDate: '',
      completionDate: '',
      percentCompleted: 0,
      estimatedHours: 0,
      actualHours: 0,
      updateLog: [],
      relatedTasks: []
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-100/80 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Basic Information</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the task..."
                    className="mt-1"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-100/80 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Task Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-blue-100/80 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Assignment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project *</Label>
                  <Select 
                    value={formData.projectId} 
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assignee</Label>
                  <Select 
                    value={formData.assignee} 
                    onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-blue-100/80 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Date Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="mt-1"
                    disabled={formData.status !== 'completed'}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-100/80 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-sm">Progress & Time Tracking</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="percentCompleted">Percent Completed (%)</Label>
                  <Input
                    id="percentCompleted"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentCompleted}
                    onChange={(e) => setFormData({ ...formData, percentCompleted: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="actualHours">Actual Hours</Label>
                  <Input
                    id="actualHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actualHours}
                    onChange={(e) => setFormData({ ...formData, actualHours: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-blue-100 hover:bg-blue-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}