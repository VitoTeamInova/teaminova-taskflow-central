export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'under_investigation' | 'being_worked' | 'closed';
export type IssueItemType = 'issue' | 'bug' | 'dependency' | 'blocker' | 'risk' | 'other';

export interface Issue {
  id: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  dateIdentified: string;
  severity: IssueSeverity;
  itemType: IssueItemType;
  status: IssueStatus;
  description: string;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  targetResolutionDate?: string;
  recommendedAction?: string;
  comments?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}
