export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      error_logs: {
        Row: {
          category: string
          context: Json | null
          created_at: string
          id: string
          message: string
          resolved: boolean
          severity: string
          stack: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          category: string
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          severity: string
          stack?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          severity?: string
          stack?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          author_id: string
          comments: string | null
          created_at: string
          date_identified: string
          description: string
          id: string
          item_type: Database["public"]["Enums"]["issue_item_type"]
          owner_id: string | null
          project_id: string
          recommended_action: string | null
          resolution_notes: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status: Database["public"]["Enums"]["issue_status"]
          target_resolution_date: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          comments?: string | null
          created_at?: string
          date_identified?: string
          description: string
          id?: string
          item_type: Database["public"]["Enums"]["issue_item_type"]
          owner_id?: string | null
          project_id: string
          recommended_action?: string | null
          resolution_notes?: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          target_resolution_date?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments?: string | null
          created_at?: string
          date_identified?: string
          description?: string
          id?: string
          item_type?: Database["public"]["Enums"]["issue_item_type"]
          owner_id?: string | null
          project_id?: string
          recommended_action?: string | null
          resolution_notes?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          target_resolution_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string
          id: string
          project_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date: string
          id?: string
          project_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_level: string | null
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          avatar?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_completion_date: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          project_manager_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          target_completion_date: string | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_completion_date?: string | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_completion_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      related_tasks: {
        Row: {
          id: string
          related_task_id: string
          task_id: string
        }
        Insert: {
          id?: string
          related_task_id: string
          task_id: string
        }
        Update: {
          id?: string
          related_task_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "related_tasks_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number
          assignee_id: string | null
          completion_date: string | null
          created_at: string
          created_by_profile_id: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number
          id: string
          percent_completed: number
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          reference_url: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number
          assignee_id?: string | null
          completion_date?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number
          id?: string
          percent_completed?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          reference_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number
          assignee_id?: string | null
          completion_date?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number
          id?: string
          percent_completed?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          reference_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      update_log: {
        Row: {
          created_at: string
          id: string
          task_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { user_id_to_delete: string }
        Returns: boolean
      }
      can_view_profile_email: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "administrator"
        | "project_manager"
        | "dev_lead"
        | "developer"
        | "product_owner"
        | "team_member"
      issue_item_type:
        | "issue"
        | "bug"
        | "dependency"
        | "blocker"
        | "risk"
        | "other"
      issue_severity: "critical" | "high" | "medium" | "low"
      issue_status: "open" | "under_investigation" | "being_worked" | "closed"
      project_status:
        | "planned"
        | "started"
        | "in-progress"
        | "completed"
        | "cancelled"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "todo"
        | "in-progress"
        | "completed"
        | "on-hold"
        | "blocked"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "administrator",
        "project_manager",
        "dev_lead",
        "developer",
        "product_owner",
        "team_member",
      ],
      issue_item_type: [
        "issue",
        "bug",
        "dependency",
        "blocker",
        "risk",
        "other",
      ],
      issue_severity: ["critical", "high", "medium", "low"],
      issue_status: ["open", "under_investigation", "being_worked", "closed"],
      project_status: [
        "planned",
        "started",
        "in-progress",
        "completed",
        "cancelled",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "todo",
        "in-progress",
        "completed",
        "on-hold",
        "blocked",
        "cancelled",
      ],
    },
  },
} as const
