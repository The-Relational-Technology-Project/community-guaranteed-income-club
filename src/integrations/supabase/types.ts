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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      calculation_runs: {
        Row: {
          average_income: number | null
          created_at: string
          created_by: string | null
          id: string
          participant_count: number | null
          run_date: string
          status: Database["public"]["Enums"]["run_status"] | null
          total_pool: number | null
        }
        Insert: {
          average_income?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          participant_count?: number | null
          run_date: string
          status?: Database["public"]["Enums"]["run_status"] | null
          total_pool?: number | null
        }
        Update: {
          average_income?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          participant_count?: number | null
          run_date?: string
          status?: Database["public"]["Enums"]["run_status"] | null
          total_pool?: number | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          description: string | null
          id: string
          is_enabled: boolean
          subject: string
          template_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_html?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          subject?: string
          template_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_html?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          subject?: string
          template_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          host_name: string
          id: string
          link: string | null
          location: string
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          host_name: string
          id?: string
          link?: string | null
          location: string
          time: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          host_name?: string
          id?: string
          link?: string | null
          location?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      profile_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_fields: string[]
          id: string
          new_values: Json
          old_values: Json
          profile_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_fields: string[]
          id?: string
          new_values: Json
          old_values: Json
          profile_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[]
          id?: string
          new_values?: Json
          old_values?: Json
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          contact_method: string
          contact_notes: string | null
          created_at: string
          email: string
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          favorite_third_space: string | null
          id: string
          is_steward_managed: boolean
          is_verified: boolean | null
          name: string
          open_to_in_person: boolean | null
          participant_status:
            | Database["public"]["Enums"]["participant_status"]
            | null
          phone: string | null
          photo_url: string | null
          post_tax_monthly_income: number | null
          profession: string | null
          student_loan_payment: number | null
          updated_at: string
          venmo_handle: string | null
          zelle_info: string | null
          zip_code: string | null
        }
        Insert: {
          bio?: string | null
          contact_method?: string
          contact_notes?: string | null
          created_at?: string
          email: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          favorite_third_space?: string | null
          id: string
          is_steward_managed?: boolean
          is_verified?: boolean | null
          name: string
          open_to_in_person?: boolean | null
          participant_status?:
            | Database["public"]["Enums"]["participant_status"]
            | null
          phone?: string | null
          photo_url?: string | null
          post_tax_monthly_income?: number | null
          profession?: string | null
          student_loan_payment?: number | null
          updated_at?: string
          venmo_handle?: string | null
          zelle_info?: string | null
          zip_code?: string | null
        }
        Update: {
          bio?: string | null
          contact_method?: string
          contact_notes?: string | null
          created_at?: string
          email?: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          favorite_third_space?: string | null
          id?: string
          is_steward_managed?: boolean
          is_verified?: boolean | null
          name?: string
          open_to_in_person?: boolean | null
          participant_status?:
            | Database["public"]["Enums"]["participant_status"]
            | null
          phone?: string | null
          photo_url?: string | null
          post_tax_monthly_income?: number | null
          profession?: string | null
          student_loan_payment?: number | null
          updated_at?: string
          venmo_handle?: string | null
          zelle_info?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          body: string
          id: string
          section: string
          sort_order: number
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          id?: string
          section: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          id?: string
          section?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          confirmed_receiver_at: string | null
          confirmed_sender_at: string | null
          created_at: string
          id: string
          is_confirmed_receiver: boolean | null
          is_confirmed_sender: boolean | null
          receiver_id: string
          receiver_open_to_meet: boolean | null
          run_id: string
          sender_id: string
          sender_open_to_meet: boolean | null
          venmo_deep_link: string | null
        }
        Insert: {
          amount: number
          confirmed_receiver_at?: string | null
          confirmed_sender_at?: string | null
          created_at?: string
          id?: string
          is_confirmed_receiver?: boolean | null
          is_confirmed_sender?: boolean | null
          receiver_id: string
          receiver_open_to_meet?: boolean | null
          run_id: string
          sender_id: string
          sender_open_to_meet?: boolean | null
          venmo_deep_link?: string | null
        }
        Update: {
          amount?: number
          confirmed_receiver_at?: string | null
          confirmed_sender_at?: string | null
          created_at?: string
          id?: string
          is_confirmed_receiver?: boolean | null
          is_confirmed_sender?: boolean | null
          receiver_id?: string
          receiver_open_to_meet?: boolean | null
          run_id?: string
          sender_id?: string
          sender_open_to_meet?: boolean | null
          venmo_deep_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "calculation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          activated_at: string | null
          id: string
          joined_at: string
          profile_id: string
          status: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Insert: {
          activated_at?: string | null
          id?: string
          joined_at?: string
          profile_id: string
          status?: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Update: {
          activated_at?: string | null
          id?: string
          joined_at?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      employment_status:
        | "employed"
        | "unemployed"
        | "freelance"
        | "part_time"
        | "student"
        | "retired"
        | "other"
      participant_status: "active" | "waitlisted" | "inactive"
      run_status: "draft" | "finalized"
      waitlist_status: "waiting" | "activated"
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
      app_role: ["admin", "member"],
      employment_status: [
        "employed",
        "unemployed",
        "freelance",
        "part_time",
        "student",
        "retired",
        "other",
      ],
      participant_status: ["active", "waitlisted", "inactive"],
      run_status: ["draft", "finalized"],
      waitlist_status: ["waiting", "activated"],
    },
  },
} as const
