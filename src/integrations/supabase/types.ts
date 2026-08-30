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
      achievements: {
        Row: {
          achievement_key: string
          created_at: string
          id: string
          profile_id: string
          progress: number
          target: number
          unlocked: boolean
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          achievement_key: string
          created_at?: string
          id?: string
          profile_id: string
          progress?: number
          target?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          achievement_key?: string
          created_at?: string
          id?: string
          profile_id?: string
          progress?: number
          target?: number
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinic_id: string | null
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string
          dentist_id: string | null
          duration_minutes: number
          family_member_id: string | null
          id: string
          is_teleconsultation: boolean
          notes: string | null
          observation: string | null
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          price: number | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          dentist_id?: string | null
          duration_minutes?: number
          family_member_id?: string | null
          id?: string
          is_teleconsultation?: boolean
          notes?: string | null
          observation?: string | null
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price?: number | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          dentist_id?: string | null
          duration_minutes?: number
          family_member_id?: string | null
          id?: string
          is_teleconsultation?: boolean
          notes?: string | null
          observation?: string | null
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price?: number | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string
          created_at: string
          dentist_id: string
          id: string
          role_in_clinic: string | null
          updated_at: string
          working_hours: Json
        }
        Insert: {
          clinic_id: string
          created_at?: string
          dentist_id: string
          id?: string
          role_in_clinic?: string | null
          updated_at?: string
          working_hours?: Json
        }
        Update: {
          clinic_id?: string
          created_at?: string
          dentist_id?: string
          id?: string
          role_in_clinic?: string | null
          updated_at?: string
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          closing_hour: string | null
          created_at: string
          email: string | null
          hds_certified: boolean
          id: string
          name: string
          opening_hour: string | null
          owner_profile_id: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          closing_hour?: string | null
          created_at?: string
          email?: string | null
          hds_certified?: boolean
          id?: string
          name: string
          opening_hour?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          closing_hour?: string | null
          created_at?: string
          email?: string | null
          hds_certified?: boolean
          id?: string
          name?: string
          opening_hour?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinics_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dentists: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          rating: number | null
          rpps_number: string | null
          specialties: Json
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          rating?: number | null
          rpps_number?: string | null
          specialties?: Json
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          rpps_number?: string | null
          specialties?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          primary_patient_id: string
          relationship: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          primary_patient_id: string
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          primary_patient_id?: string
          relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_primary_patient_id_fkey"
            columns: ["primary_patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          from_profile_id: string
          id: string
          rating: number
          to_profile_id: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          from_profile_id: string
          id?: string
          rating: number
          to_profile_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          from_profile_id?: string
          id?: string
          rating?: number
          to_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          profile_id: string
          read: boolean
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          profile_id: string
          read?: boolean
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          profile_id?: string
          read?: boolean
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: Json
          blocked: boolean
          created_at: string
          fear_level: number
          id: string
          medical_notes: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          allergies?: Json
          blocked?: boolean
          created_at?: string
          fear_level?: number
          id: string
          medical_notes?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          allergies?: Json
          blocked?: boolean
          created_at?: string
          fear_level?: number
          id?: string
          medical_notes?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          multiplier_applied: number
          profile_id: string
          reason: string | null
          related_appointment_id: string | null
          type: Database["public"]["Enums"]["points_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          multiplier_applied?: number
          profile_id: string
          reason?: string | null
          related_appointment_id?: string | null
          type: Database["public"]["Enums"]["points_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          multiplier_applied?: number
          profile_id?: string
          reason?: string | null
          related_appointment_id?: string | null
          type?: Database["public"]["Enums"]["points_type"]
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_related_appointment_id_fkey"
            columns: ["related_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      points_rules: {
        Row: {
          action_key: string
          created_at: string
          id: string
          is_evaluation: boolean
          label: string
          points: number
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          xp: number
        }
        Insert: {
          action_key: string
          created_at?: string
          id?: string
          is_evaluation?: boolean
          label: string
          points?: number
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          xp?: number
        }
        Update: {
          action_key?: string
          created_at?: string
          id?: string
          is_evaluation?: boolean
          label?: string
          points?: number
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          language: Database["public"]["Enums"]["app_language"]
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          best_streak: number
          created_at: string
          current_reward_points: number
          current_xp: number
          id: string
          last_activity_date: string | null
          level: Database["public"]["Enums"]["level_tier"]
          streak_days: number
          updated_at: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_reward_points?: number
          current_xp?: number
          id: string
          last_activity_date?: string | null
          level?: Database["public"]["Enums"]["level_tier"]
          streak_days?: number
          updated_at?: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_reward_points?: number
          current_xp?: number
          id?: string
          last_activity_date?: string | null
          level?: Database["public"]["Enums"]["level_tier"]
          streak_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_levels_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waiting_list: {
        Row: {
          clinic_id: string | null
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string
          dentist_id: string | null
          generic_preferences: Json
          id: string
          observation: string | null
          patient_id: string
          preferred_slots: Json
          status: Database["public"]["Enums"]["waiting_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["waiting_urgency"]
        }
        Insert: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          dentist_id?: string | null
          generic_preferences?: Json
          id?: string
          observation?: string | null
          patient_id: string
          preferred_slots?: Json
          status?: Database["public"]["Enums"]["waiting_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["waiting_urgency"]
        }
        Update: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          dentist_id?: string | null
          generic_preferences?: Json
          id?: string
          observation?: string | null
          patient_id?: string
          preferred_slots?: Json
          status?: Database["public"]["Enums"]["waiting_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["waiting_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_patient_id_fkey"
            columns: ["patient_id"]
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
      apply_points: {
        Args: {
          _multiplier?: number
          _points: number
          _profile_id: string
          _reason: string
          _related_appointment_id?: string
          _xp: number
        }
        Returns: Json
      }
      award_points: {
        Args: {
          _action_key: string
          _context?: Json
          _profile_id: string
          _rating?: number
          _related_appointment_id?: string
        }
        Returns: Json
      }
      current_role_is: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_clinic_member: { Args: { _clinic_id: string }; Returns: boolean }
      level_for_xp: {
        Args: { _xp: number }
        Returns: Database["public"]["Enums"]["level_tier"]
      }
      level_multiplier: {
        Args: { _level: Database["public"]["Enums"]["level_tier"] }
        Returns: number
      }
      owns_clinic: { Args: { _clinic_id: string }; Returns: boolean }
      treats_patient: { Args: { _patient_id: string }; Returns: boolean }
    }
    Enums: {
      app_language: "pt" | "fr" | "en"
      app_role: "patient" | "dentist" | "clinic"
      appointment_status:
        | "agendada"
        | "confirmada"
        | "em_sala_de_espera"
        | "em_consulta"
        | "concluida"
        | "cancelada"
        | "falta"
        | "visto"
      consultation_type:
        | "primeira_consulta"
        | "destartarizacao"
        | "cirurgia"
        | "endodontia"
        | "odontopediatria"
        | "ortodontia"
        | "protese"
        | "restauracao"
        | "urgencia"
        | "teleconsulta"
        | "avaliacao"
      level_tier:
        | "Lata"
        | "Bronze"
        | "Prata"
        | "Ouro"
        | "Platina"
        | "Diamante"
        | "Adamantino"
      payment_status: "a_pagar" | "pago" | "nao_aplicavel"
      points_type: "xp" | "reward_points"
      waiting_status: "em_espera" | "notificado" | "confirmado"
      waiting_urgency: "normal" | "urgente"
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
      app_language: ["pt", "fr", "en"],
      app_role: ["patient", "dentist", "clinic"],
      appointment_status: [
        "agendada",
        "confirmada",
        "em_sala_de_espera",
        "em_consulta",
        "concluida",
        "cancelada",
        "falta",
        "visto",
      ],
      consultation_type: [
        "primeira_consulta",
        "destartarizacao",
        "cirurgia",
        "endodontia",
        "odontopediatria",
        "ortodontia",
        "protese",
        "restauracao",
        "urgencia",
        "teleconsulta",
        "avaliacao",
      ],
      level_tier: [
        "Lata",
        "Bronze",
        "Prata",
        "Ouro",
        "Platina",
        "Diamante",
        "Adamantino",
      ],
      payment_status: ["a_pagar", "pago", "nao_aplicavel"],
      points_type: ["xp", "reward_points"],
      waiting_status: ["em_espera", "notificado", "confirmado"],
      waiting_urgency: ["normal", "urgente"],
    },
  },
} as const
