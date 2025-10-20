import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, Edit, Trash2 } from "lucide-react";
import { IssueDialog } from "@/components/IssueDialog";
import { useIssueManagement } from "@/hooks/useIssueManagement";
import { Issue } from "@/types/issue";
import { Project, TeamMember } from "@/types/task";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface IssuesViewProps {
  view: 'all' | 'by-project' | 'by-severity' | 'by-date' | 'by-owner';
  projects: Project[];
  teamMembers: TeamMember[];
}

export function IssuesView({ view, projects, teamMembers }: IssuesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const { issues, loading, createIssue, updateIssue, deleteIssue } = useIssueManagement();
  const { user } = useAuth();

  const sortedIssues = useMemo(() => {
    let sorted = [...issues];
    
    switch (view) {
      case 'by-project':
        sorted.sort((a, b) => a.project?.name.localeCompare(b.project?.name || '') || 0);
        break;
      case 'by-severity':
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        break;
      case 'by-date':
        sorted.sort((a, b) => new Date(b.dateIdentified).getTime() - new Date(a.dateIdentified).getTime());
        break;
      case 'by-owner':
        sorted.sort((a, b) => (a.owner?.name || '').localeCompare(b.owner?.name || ''));
        break;
    }
    
    return sorted;
  }, [issues, view]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'under_investigation': return 'default';
      case 'being_worked': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSave = (issueData: Partial<Issue>) => {
    if (editingIssue) {
      updateIssue(editingIssue.id, issueData);
    } else {
      createIssue(issueData);
    }
    setEditingIssue(null);
  };

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setDialogOpen(true);
  };

  const handleDelete = (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      deleteIssue(issueId);
    }
  };

  const canEditIssue = (issue: Issue) => {
    // User can edit if they are the author
    return issue.author?.email === user?.email;
  };

  if (loading) {
    return <div className="p-6">Loading issues...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Issues</h2>
          <p className="text-muted-foreground">
            {view === 'all' && 'All Issues'}
            {view === 'by-project' && 'Issues by Project'}
            {view === 'by-severity' && 'Issues by Severity'}
            {view === 'by-date' && 'Issues by Date'}
            {view === 'by-owner' && 'Issues by Owner'}
          </p>
        </div>
        <Button onClick={() => { setEditingIssue(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Issue
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedIssues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No issues found</p>
            </CardContent>
          </Card>
        ) : (
          sortedIssues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(issue.status)}>
                        {formatStatus(issue.status)}
                      </Badge>
                      <Badge variant="outline">
                        {issue.itemType.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{issue.description}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {issue.project && (
                        <span className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: issue.project.color }}
                          />
                          {issue.project.name}
                        </span>
                      )}
                      <span>Author: {issue.author?.name}</span>
                      {issue.owner && <span>Owner: {issue.owner.name}</span>}
                      <span>Identified: {format(new Date(issue.dateIdentified), 'MMM dd, yyyy')}</span>
                      {issue.targetResolutionDate && (
                        <span>Target: {format(new Date(issue.targetResolutionDate), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canEditIssue(issue) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(issue)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(issue.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(issue.recommendedAction || issue.comments || issue.resolutionNotes) && (
                <CardContent className="space-y-2">
                  {issue.recommendedAction && (
                    <div>
                      <p className="text-sm font-medium">Recommended Action:</p>
                      <p className="text-sm text-muted-foreground">{issue.recommendedAction}</p>
                    </div>
                  )}
                  {issue.comments && (
                    <div>
                      <p className="text-sm font-medium">Comments:</p>
                      <p className="text-sm text-muted-foreground">{issue.comments}</p>
                    </div>
                  )}
                  {issue.resolutionNotes && (
                    <div>
                      <p className="text-sm font-medium">Resolution Notes:</p>
                      <p className="text-sm text-muted-foreground">{issue.resolutionNotes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <IssueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        issue={editingIssue}
        projects={projects}
        teamMembers={teamMembers}
      />
    </div>
  );
}
