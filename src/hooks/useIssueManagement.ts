import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types/issue";
import { toast } from "sonner";
import { errorLogger } from "@/lib/errorLogger";

export function useIssueManagement() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          project:projects(id, name, color),
          author:profiles!issues_author_id_fkey(id, name, email),
          owner:profiles!issues_owner_id_fkey(id, name, email)
        `)
        .order('date_identified', { ascending: false });

      if (error) throw error;

      const convertedIssues: Issue[] = (data || []).map((issue: any) => ({
        id: issue.id,
        projectId: issue.project_id,
        project: issue.project,
        authorId: issue.author_id,
        author: issue.author,
        dateIdentified: issue.date_identified,
        severity: issue.severity,
        itemType: issue.item_type,
        status: issue.status,
        description: issue.description,
        ownerId: issue.owner_id,
        owner: issue.owner,
        targetResolutionDate: issue.target_resolution_date,
        recommendedAction: issue.recommended_action,
        comments: issue.comments,
        resolutionNotes: issue.resolution_notes,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      }));

      setIssues(convertedIssues);
    } catch (error: any) {
      errorLogger.logDatabaseError('Failed to fetch issues', error, { user_id: user?.id });
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: Partial<Issue>) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const { error } = await supabase.from('issues').insert({
        project_id: issueData.projectId,
        author_id: profile.id,
        date_identified: issueData.dateIdentified,
        severity: issueData.severity,
        item_type: issueData.itemType,
        status: issueData.status || 'open',
        description: issueData.description,
        owner_id: issueData.ownerId || null,
        target_resolution_date: issueData.targetResolutionDate || null,
        recommended_action: issueData.recommendedAction || null,
        comments: issueData.comments || null,
        resolution_notes: issueData.resolutionNotes || null,
      });

      if (error) throw error;

      toast.success("Issue created successfully");
      fetchIssues();
    } catch (error: any) {
      errorLogger.logDatabaseError('Failed to create issue', error, { user_id: user?.id });
      toast.error("Failed to create issue");
    }
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({
          project_id: updates.projectId,
          date_identified: updates.dateIdentified,
          severity: updates.severity,
          item_type: updates.itemType,
          status: updates.status,
          description: updates.description,
          owner_id: updates.ownerId || null,
          target_resolution_date: updates.targetResolutionDate || null,
          recommended_action: updates.recommendedAction || null,
          comments: updates.comments || null,
          resolution_notes: updates.resolutionNotes || null,
        })
        .eq('id', issueId);

      if (error) throw error;

      toast.success("Issue updated successfully");
      fetchIssues();
    } catch (error: any) {
      errorLogger.logDatabaseError('Failed to update issue', error, { user_id: user?.id, issue_id: issueId });
      toast.error("Failed to update issue. You can only update your own issues.");
    }
  };

  const deleteIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;

      toast.success("Issue deleted successfully");
      fetchIssues();
    } catch (error: any) {
      errorLogger.logDatabaseError('Failed to delete issue', error, { user_id: user?.id, issue_id: issueId });
      toast.error("Failed to delete issue. Only administrators can delete issues.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [user]);

  return {
    issues,
    loading,
    createIssue,
    updateIssue,
    deleteIssue,
    refreshIssues: fetchIssues,
  };
}
