import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/types/issue";
import { format } from "date-fns";
import { Pencil } from "lucide-react";

interface IssueViewDialogProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
  onSave: (issueData: Partial<Issue>) => void;
  canEdit: boolean;
  projects: Array<{ id: string; name: string; color: string }>;
  teamMembers: Array<{ id: string; name: string }>;
}

export function IssueViewDialog({
  issue,
  open,
  onClose,
  onSave,
  canEdit,
  projects,
  teamMembers,
}: IssueViewDialogProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [formData, setFormData] = useState<Partial<Issue>>({});

  const handleEdit = () => {
    if (issue) {
      setFormData({
        projectId: issue.projectId,
        severity: issue.severity,
        itemType: issue.itemType,
        status: issue.status,
        description: issue.description,
        dateIdentified: issue.dateIdentified,
        ownerId: issue.ownerId,
        targetResolutionDate: issue.targetResolutionDate,
        recommendedAction: issue.recommendedAction,
        comments: issue.comments,
        resolutionNotes: issue.resolutionNotes,
      });
      setMode('edit');
    }
  };

  const handleSave = () => {
    if (issue) {
      const cleanedData = {
        ...formData,
        recommendedAction: formData.recommendedAction || undefined,
        comments: formData.comments || undefined,
        resolutionNotes: formData.resolutionNotes || undefined,
        targetResolutionDate: formData.targetResolutionDate || undefined,
        ownerId: formData.ownerId || undefined,
      };
      onSave(cleanedData);
      setMode('view');
      onClose();
    }
  };

  const handleCancel = () => {
    setMode('view');
    setFormData({});
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'under_investigation': return 'default';
      case 'being_worked': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Issue Details</span>
            {mode === 'view' && canEdit && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Project</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: issue.project?.color }}
                  />
                  <span className="font-medium">{issue.project?.name}</span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Author</Label>
                <p className="mt-1 font-medium">{issue.author?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Severity</Label>
                <div className="mt-1">
                  <Badge variant={getSeverityColor(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(issue.status)}>
                    {formatStatus(issue.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="mt-1 font-medium capitalize">{issue.itemType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Date Identified</Label>
                <p className="mt-1 font-medium">
                  {format(new Date(issue.dateIdentified), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Target Resolution Date</Label>
                <p className="mt-1 font-medium">
                  {issue.targetResolutionDate
                    ? format(new Date(issue.targetResolutionDate), "MMM dd, yyyy")
                    : "Not set"}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Owner</Label>
              <p className="mt-1 font-medium">{issue.owner?.name || "Unassigned"}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1 whitespace-pre-wrap">{issue.description}</p>
            </div>

            {issue.recommendedAction && (
              <div>
                <Label className="text-muted-foreground">Recommended Action</Label>
                <p className="mt-1 whitespace-pre-wrap">{issue.recommendedAction}</p>
              </div>
            )}

            {issue.comments && (
              <div>
                <Label className="text-muted-foreground">Comments</Label>
                <p className="mt-1 whitespace-pre-wrap">{issue.comments}</p>
              </div>
            )}

            {issue.resolutionNotes && (
              <div>
                <Label className="text-muted-foreground">Resolution Notes</Label>
                <p className="mt-1 whitespace-pre-wrap">{issue.resolutionNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type *</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value) => setFormData({ ...formData, itemType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="dependency">Dependency</SelectItem>
                    <SelectItem value="blocker">Blocker</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="being_worked">Being Worked</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Owner</Label>
                <Select
                  value={formData.ownerId || "unassigned"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      ownerId: value === "unassigned" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date Identified *</Label>
                <Input
                  type="date"
                  value={formData.dateIdentified}
                  onChange={(e) =>
                    setFormData({ ...formData, dateIdentified: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Target Resolution Date</Label>
                <Input
                  type="date"
                  value={formData.targetResolutionDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, targetResolutionDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <Label>Recommended Action</Label>
              <Textarea
                value={formData.recommendedAction || ""}
                onChange={(e) =>
                  setFormData({ ...formData, recommendedAction: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label>Comments</Label>
              <Textarea
                value={formData.comments || ""}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label>Resolution Notes</Label>
              <Textarea
                value={formData.resolutionNotes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, resolutionNotes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        )}

        {mode === 'edit' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
