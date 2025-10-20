import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Issue, IssueSeverity, IssueStatus, IssueItemType } from "@/types/issue";
import { Project, TeamMember } from "@/types/task";
import { toast } from "sonner";

interface IssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (issue: Partial<Issue>) => void;
  issue?: Issue | null;
  projects: Project[];
  teamMembers: TeamMember[];
}

export function IssueDialog({ open, onOpenChange, onSave, issue, projects, teamMembers }: IssueDialogProps) {
  const [formData, setFormData] = useState<Partial<Issue>>({
    projectId: '',
    dateIdentified: new Date().toISOString().split('T')[0],
    severity: 'medium',
    itemType: 'issue',
    status: 'open',
    description: '',
    ownerId: '',
    targetResolutionDate: '',
    recommendedAction: '',
    comments: '',
    resolutionNotes: '',
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        projectId: issue.projectId,
        dateIdentified: issue.dateIdentified,
        severity: issue.severity,
        itemType: issue.itemType,
        status: issue.status,
        description: issue.description,
        ownerId: issue.ownerId,
        targetResolutionDate: issue.targetResolutionDate,
        recommendedAction: issue.recommendedAction,
        comments: issue.comments,
        resolutionNotes: issue.resolutionNotes,
      });
    } else {
      setFormData({
        projectId: '',
        dateIdentified: new Date().toISOString().split('T')[0],
        severity: 'medium',
        itemType: 'issue',
        status: 'open',
        description: '',
        ownerId: '',
        targetResolutionDate: '',
        recommendedAction: '',
        comments: '',
        resolutionNotes: '',
      });
    }
  }, [issue, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      toast.error("Please select a project");
      return;
    }
    
    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...formData,
      ownerId: formData.ownerId || undefined,
      targetResolutionDate: formData.targetResolutionDate || undefined,
      recommendedAction: formData.recommendedAction || undefined,
      comments: formData.comments || undefined,
      resolutionNotes: formData.resolutionNotes || undefined,
    };
    
    onSave(cleanedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
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
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateIdentified">Date Identified *</Label>
              <Input
                id="dateIdentified"
                type="date"
                value={formData.dateIdentified}
                onChange={(e) => setFormData({ ...formData, dateIdentified: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value as IssueSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type *</Label>
              <Select
                value={formData.itemType}
                onValueChange={(value) => setFormData({ ...formData, itemType: value as IssueItemType })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as IssueStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="being_worked">Being Worked</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => setFormData({ ...formData, ownerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
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

            <div className="space-y-2">
              <Label htmlFor="targetResolutionDate">Target Resolution Date</Label>
              <Input
                id="targetResolutionDate"
                type="date"
                value={formData.targetResolutionDate || ''}
                onChange={(e) => setFormData({ ...formData, targetResolutionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendedAction">Recommended Action</Label>
            <Textarea
              id="recommendedAction"
              value={formData.recommendedAction || ''}
              onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments || ''}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolutionNotes">Resolution Notes</Label>
            <Textarea
              id="resolutionNotes"
              value={formData.resolutionNotes || ''}
              onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {issue ? 'Update Issue' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
