import { useState, useMemo } from "react";
import { useIssueManagement } from "@/hooks/useIssueManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types/issue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueDialog } from "@/components/IssueDialog";
import { IssueViewDialog } from "@/components/IssueViewDialog";
import { format } from "date-fns";
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react";
import { Project, TeamMember } from "@/types/task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface IssuesViewProps {
  view: 'all' | 'by-project' | 'by-severity' | 'by-date' | 'by-owner';
  projects: Project[];
  teamMembers: TeamMember[];
}

export function IssuesView({ view, projects, teamMembers }: IssuesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { issues, loading, createIssue, updateIssue, deleteIssue } = useIssueManagement();
  const { user } = useAuth();

  const groupedIssues = useMemo(() => {
    switch (view) {
      case 'by-project':
        return issues.reduce((acc, issue) => {
          const key = issue.project?.name || 'No Project';
          if (!acc[key]) acc[key] = [];
          acc[key].push(issue);
          return acc;
        }, {} as Record<string, Issue[]>);
      
      case 'by-severity':
        const severityGroups: Record<string, Issue[]> = {
          critical: [],
          high: [],
          medium: [],
          low: []
        };
        issues.forEach(issue => {
          severityGroups[issue.severity].push(issue);
        });
        // Remove empty severity groups
        Object.keys(severityGroups).forEach(key => {
          if (severityGroups[key].length === 0) {
            delete severityGroups[key];
          }
        });
        return severityGroups;
      
      case 'by-date':
        return issues
          .sort((a, b) => {
            const dateA = new Date(a.targetResolutionDate || a.dateIdentified);
            const dateB = new Date(b.targetResolutionDate || b.dateIdentified);
            return dateA.getTime() - dateB.getTime();
          })
          .reduce((acc, issue) => {
            const key = issue.targetResolutionDate 
              ? format(new Date(issue.targetResolutionDate), "MMM dd, yyyy")
              : 'No Target Date';
            if (!acc[key]) acc[key] = [];
            acc[key].push(issue);
            return acc;
          }, {} as Record<string, Issue[]>);
      
      case 'by-owner':
        return issues.reduce((acc, issue) => {
          const key = issue.owner?.name || 'Unassigned';
          if (!acc[key]) acc[key] = [];
          acc[key].push(issue);
          return acc;
        }, {} as Record<string, Issue[]>);
      
      default:
        return { 'All Issues': issues };
    }
  }, [issues, view]);

  const handleSave = async (issueData: Partial<Issue>) => {
    if (editingIssue) {
      await updateIssue(editingIssue.id, issueData);
    } else {
      await createIssue(issueData);
    }
    setDialogOpen(false);
    setEditingIssue(null);
  };

  const handleViewSave = async (issueData: Partial<Issue>) => {
    if (selectedIssue) {
      await updateIssue(selectedIssue.id, issueData);
      setViewDialogOpen(false);
      setSelectedIssue(null);
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewDialogOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setDialogOpen(true);
  };

  const handleDelete = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      await deleteIssue(issueId);
    }
  };

  const canEditIssue = (issue: Issue) => {
    return issue.author?.email === user?.email;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
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

  const getGroupHeader = (groupKey: string, count: number) => {
    if (view === 'by-project') {
      const project = projects.find(p => p.name === groupKey);
      return (
        <div className="flex items-center gap-2">
          {project && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
          )}
          <span className="font-semibold">{groupKey}</span>
          <Badge variant="secondary">{count}</Badge>
        </div>
      );
    }
    
    if (view === 'by-severity') {
      return (
        <div className="flex items-center gap-2">
          <Badge className={getSeverityColor(groupKey)}>
            {groupKey.toUpperCase()}
          </Badge>
          <Badge variant="secondary">{count}</Badge>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{groupKey}</span>
        <Badge variant="secondary">{count}</Badge>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">Loading issues...</div>;
  }

  if (issues.length === 0) {
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No issues found</p>
          </CardContent>
        </Card>
        <IssueDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          issue={editingIssue}
          onSave={handleSave}
          projects={projects}
          teamMembers={teamMembers}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
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
      </div>
      
      <ScrollArea className="flex-1 px-6">
        <Accordion type="multiple" defaultValue={Object.keys(groupedIssues)} className="space-y-4 pb-6">
          {Object.entries(groupedIssues).map(([groupKey, groupIssues]) => (
            <AccordionItem key={groupKey} value={groupKey} className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                {getGroupHeader(groupKey, groupIssues.length)}
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-4 space-y-3">
                  {groupIssues.map((issue) => (
                    <Card
                      key={issue.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors ml-6"
                      onClick={() => handleIssueClick(issue)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity.toUpperCase()}
                              </Badge>
                              <Badge variant={getStatusColor(issue.status) as any}>
                                {formatStatus(issue.status)}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {issue.itemType}
                              </Badge>
                            </div>
                            
                            <p className="text-sm line-clamp-2">{issue.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {view !== 'by-project' && issue.project && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: issue.project.color }}
                                    />
                                    <span>{issue.project.name}</span>
                                  </div>
                                  <span>•</span>
                                </>
                              )}
                              <span>Author: {issue.author?.name}</span>
                              {view !== 'by-owner' && (
                                <>
                                  <span>•</span>
                                  <span>Owner: {issue.owner?.name || 'Unassigned'}</span>
                                </>
                              )}
                              {issue.targetResolutionDate && (
                                <>
                                  <span>•</span>
                                  <span>Due: {format(new Date(issue.targetResolutionDate), "MMM dd")}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {canEditIssue(issue) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(issue);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(issue.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      <IssueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        issue={editingIssue}
        onSave={handleSave}
        projects={projects}
        teamMembers={teamMembers}
      />

      <IssueViewDialog
        issue={selectedIssue}
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedIssue(null);
        }}
        onSave={handleViewSave}
        canEdit={selectedIssue ? canEditIssue(selectedIssue) : false}
        projects={projects}
        teamMembers={teamMembers}
      />
    </div>
  );
}
