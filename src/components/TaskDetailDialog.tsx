import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, BarChart3, Edit, Save, X } from "lucide-react";
import { Task, UpdateLogEntry, TaskPriority, TaskStatus, Project, TeamMember } from "@/types/task";
import { UpdateLogDialog } from "./UpdateLogDialog";
import { RelatedTasksDialog } from "./RelatedTasksDialog";
import { CancellationDialog } from "./CancellationDialog";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  allTasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddUpdate: (taskId: string, updateText: string) => void;
  onUpdateRelatedTasks?: (taskId: string, relatedTaskIds: string[]) => void;
  initialEditMode?: boolean;
}

export function TaskDetailDialog({ 
  open, 
  onOpenChange, 
  task, 
  allTasks, 
  projects, 
  teamMembers, 
  onUpdateTask, 
  onAddUpdate,
  onUpdateRelatedTasks,
  initialEditMode = false,
}: TaskDetailDialogProps) {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateLogOpen, setUpdateLogOpen] = useState(false);
  const [relatedTasksOpen, setRelatedTasksOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [formData, setFormData] = useState<Task | null>(null);

useEffect(() => {
  if (task) {
    setFormData({ ...task });
    setIsEditMode(!!initialEditMode);
  }
}, [task, initialEditMode]);

  if (!task || !formData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getCompletionStatus = () => {
    if (task.status !== 'completed' || !task.completionDate || !task.dueDate) {
      return null;
    }

    const completionDate = new Date(task.completionDate);
    const dueDate = new Date(task.dueDate);
    const diffTime = completionDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { status: 'On-Time', className: 'bg-green-100 text-green-800' };
    } else if (diffDays > 0) {
      return { 
        status: `${diffDays} day${diffDays > 1 ? 's' : ''} late`, 
        className: 'bg-red-100 text-red-800' 
      };
    } else {
      return { 
        status: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} early`, 
        className: 'bg-blue-100 text-blue-800' 
      };
    }
  };

  const handleSave = () => {
    if (formData) {
      // Check if status is being changed to cancelled
      if (formData.status === 'cancelled' && task.status !== 'cancelled') {
        setCancellationOpen(true);
        return;
      }
      
      onUpdateTask(task.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setIsEditMode(false);
      // Close the dialog after saving
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...task });
    setIsEditMode(false);
  };

  const handleAddUpdate = (updateText: string) => {
    onAddUpdate(task.id, updateText);
  };

  const handleUpdateRelatedTasks = (relatedTaskIds: string[]) => {
    // Call the dedicated related tasks handler from props
    if (onUpdateRelatedTasks) {
      onUpdateRelatedTasks(task.id, relatedTaskIds);
    } else {
      // Fallback to the general update handler
      onUpdateTask(task.id, { 
        relatedTasks: relatedTaskIds,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleCancellation = (justification: string) => {
    if (formData) {
      const newUpdate: UpdateLogEntry = {
        timestamp: new Date().toISOString(),
        text: `Task cancelled: ${justification}`
      };
      
      const updatedLog = [newUpdate, ...task.updateLog];
      
      onUpdateTask(task.id, {
        ...formData,
        status: 'cancelled',
        updateLog: updatedLog,
        updatedAt: new Date().toISOString()
      });
      setIsEditMode(false);
    }
  };

  const projectTasks = allTasks.filter(t => t.projectId === task.projectId);
  const relatedTasksData = allTasks.filter(t => task.relatedTasks.includes(t.id));
  const currentProject = getProject(task.projectId);
  const completionStatus = getCompletionStatus();

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'blocked': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="bg-gray-200 p-4 rounded-lg w-full mr-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {currentProject && (
                      <span className="text-base font-bold text-black bg-gray-200 px-2 py-1 rounded">
                        {currentProject.name}
                      </span>
                    )}
                    <span className="text-sm font-semibold">{task.title}</span>
                    <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                      {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setUpdateLogOpen(true)}
                      className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200"
                    >
                      <Edit className="h-3 w-3" />
                      Update
                    </Button>
                    <Button onClick={handleSave} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Save className="h-4 w-4 mr-1" />
                      Save and Exit
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200">
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={() => onOpenChange(false)} variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200">
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Basic Info */}
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <h4 className="font-bold underline mb-3 text-sm">Basic Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Task Title</Label>
                    {isEditMode ? (
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{task.title}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    {isEditMode ? (
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description || "No description provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <h4 className="font-bold underline mb-3 text-sm">Task Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Priority</Label>
                      {isEditMode ? (
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
                      ) : (
                        <Badge variant="outline" className={`text-xs mt-1 ${priorityColors[task.priority]}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Status</Label>
                      {isEditMode ? (
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
                      ) : (
                        <Badge variant="secondary" className={`text-xs mt-1 ${statusColors[task.status]}`}>
                          {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Assignee</Label>
                      {isEditMode ? (
                        <Select 
                          value={formData.assignee} 
                          onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{task.assignee || "Unassigned"}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Project</Label>
                      {isEditMode ? (
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
                       ) : (
                         <p className="text-sm mt-1">{currentProject?.name || "No project assigned"}</p>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <h4 className="font-bold underline mb-3 text-sm">Date Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Start Date</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{task.startDate ? formatDate(task.startDate) : 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Due Date</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{task.dueDate ? formatDate(task.dueDate) : 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Completion Date</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={formData.completionDate || ''}
                        onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                        className="mt-1"
                        disabled={formData.status !== 'completed'}
                      />
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{task.completionDate ? formatDate(task.completionDate) : 'Not completed'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Status */}
                {completionStatus && (
                  <div className="mt-4">
                    <Label className="text-sm font-semibold">Completion Status</Label>
                    <div className="mt-1">
                      <Badge className={`text-xs ${completionStatus.className}`}>
                        {completionStatus.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress and Time Tracking */}
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <h4 className="font-bold underline mb-3 text-sm">Progress & Time Tracking</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Percent Completed (%)</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.percentCompleted}
                        onChange={(e) => setFormData({ ...formData, percentCompleted: Number(e.target.value) })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-sm">{task.percentCompleted}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${task.percentCompleted}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Estimated Hours</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Actual Hours</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.actualHours}
                        onChange={(e) => setFormData({ ...formData, actualHours: Number(e.target.value) })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{task.actualHours}h</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditMode && (
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Remaining Hours:</span>
                      <span className={task.actualHours > task.estimatedHours ? "text-red-600" : ""}>
                        {Math.max(0, task.estimatedHours - task.actualHours)}h
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference URL */}
              <div className="bg-blue-50/50 p-4 rounded-lg">
                <h4 className="font-bold underline mb-3 text-sm">Reference URL</h4>
                {isEditMode ? (
                  <div>
                    <Label className="text-sm font-semibold">Reference URL (Optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/task-reference"
                      value={formData.reference_url || ''}
                      onChange={(e) => setFormData({ ...formData, reference_url: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add a URL to external documentation or resources
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task.reference_url ? (
                      <>
                        <a 
                          href={task.reference_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all block"
                        >
                          {task.reference_url}
                        </a>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(task.reference_url || '');
                              toast({ title: "Copied!", description: "Reference URL copied to clipboard" });
                            }}
                            className="text-xs"
                          >
                            Copy URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const subject = encodeURIComponent(`Task: ${task.title}`);
                              const body = encodeURIComponent(`Reference URL: ${task.reference_url}`);
                              window.location.href = `mailto:?subject=${subject}&body=${body}`;
                            }}
                            className="text-xs"
                          >
                            Share via Email
                          </Button>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No reference URL set</span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Update Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-bold underline">Update Log</Label>
                  {!isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpdateLogOpen(true)}
                      className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200"
                    >
                      <Edit className="h-3 w-3" />
                      Update
                    </Button>
                  )}
                </div>
                
                {task.updateLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No updates yet</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {task.updateLog.map((update, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4 py-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          {formatDateTime(update.timestamp)}
                        </div>
                        <p className="text-sm">{update.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Related Tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-bold underline">Related Tasks</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRelatedTasksOpen(true)}
                    className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200"
                  >
                    <Edit className="h-3 w-3" />
                    Manage
                  </Button>
                </div>
                
                {relatedTasksData.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No related tasks</p>
                ) : (
                  <div className="space-y-2">
                    {relatedTasksData.map((relatedTask) => (
                      <div key={relatedTask.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="text-sm font-medium">{relatedTask.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {relatedTask.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {relatedTask.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {relatedTask.assignee}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UpdateLogDialog
        open={updateLogOpen}
        onOpenChange={setUpdateLogOpen}
        onSubmit={handleAddUpdate}
      />

      <RelatedTasksDialog
        open={relatedTasksOpen}
        onOpenChange={setRelatedTasksOpen}
        tasks={projectTasks}
        currentTaskId={task.id}
        selectedRelatedTasks={task.relatedTasks}
        onSubmit={handleUpdateRelatedTasks}
      />

      <CancellationDialog
        open={cancellationOpen}
        onOpenChange={setCancellationOpen}
        onSubmit={handleCancellation}
        taskTitle={task.title}
      />
    </>
  );
}