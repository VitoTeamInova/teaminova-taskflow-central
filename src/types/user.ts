export type AppRole = 
  | 'administrator'
  | 'project_manager'
  | 'dev_lead'
  | 'developer'
  | 'product_owner'
  | 'team_member';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  access_level: string; // Deprecated, use roles instead
  created_at: string;
  user_id: string;
  role?: string; // Profile table role field
  avatar?: string;
  roles?: UserRole[]; // Associated roles from user_roles table
}