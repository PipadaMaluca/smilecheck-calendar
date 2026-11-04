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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          attempts: number
          completed_at: string | null
          detail: Json
          id: string
          last_attempt_at: string | null
          last_error: string | null
          profile_id: string
          requested_at: string
          status: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          detail?: Json
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          profile_id: string
          requested_at?: string
          status?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          detail?: Json
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          profile_id?: string
          requested_at?: string
          status?: string
        }
        Relationships: []
      }
      achievement_defs: {
        Row: {
          achievement_key: string
          bonus_points: number
          category_key: string
          created_at: string
          id: string
          metric: string | null
          role: Database["public"]["Enums"]["app_role"]
          secret: boolean
          sort_order: number
          target: number
          updated_at: string
        }
        Insert: {
          achievement_key: string
          bonus_points?: number
          category_key: string
          created_at?: string
          id?: string
          metric?: string | null
          role: Database["public"]["Enums"]["app_role"]
          secret?: boolean
          sort_order?: number
          target?: number
          updated_at?: string
        }
        Update: {
          achievement_key?: string
          bonus_points?: number
          category_key?: string
          created_at?: string
          id?: string
          metric?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          secret?: boolean
          sort_order?: number
          target?: number
          updated_at?: string
        }
        Relationships: []
      }
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_rewards_daily: {
        Row: {
          created_at: string
          profile_id: string
          reward_date: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          reward_date: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          reward_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_rewards_daily_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_rewards_daily_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_state: {
        Row: {
          ad_free_until: string | null
          ads_seen: number
          profile_id: string
          updated_at: string
          videos_watched: number
        }
        Insert: {
          ad_free_until?: string | null
          ads_seen?: number
          profile_id: string
          updated_at?: string
          videos_watched?: number
        }
        Update: {
          ad_free_until?: string | null
          ads_seen?: number
          profile_id?: string
          updated_at?: string
          videos_watched?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
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
          is_seed: boolean
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
          is_seed?: boolean
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
          is_seed?: boolean
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
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
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
            referencedRelation: "professional_public_profiles"
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
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
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
          accepts_cheque_dentista: boolean
          accepts_cheque_protese: boolean
          address: string | null
          city: string | null
          closing_hour: string | null
          country: string
          created_at: string
          email: string | null
          geocode_status: string | null
          geocoded_address: string | null
          geocoded_at: string | null
          hds_certified: boolean
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          opening_hour: string | null
          owner_profile_id: string | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          teleconsultation_available: boolean
          timezone: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          accepts_cheque_dentista?: boolean
          accepts_cheque_protese?: boolean
          address?: string | null
          city?: string | null
          closing_hour?: string | null
          country?: string
          created_at?: string
          email?: string | null
          geocode_status?: string | null
          geocoded_address?: string | null
          geocoded_at?: string | null
          hds_certified?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hour?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          teleconsultation_available?: boolean
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          accepts_cheque_dentista?: boolean
          accepts_cheque_protese?: boolean
          address?: string | null
          city?: string | null
          closing_hour?: string | null
          country?: string
          created_at?: string
          email?: string | null
          geocode_status?: string | null
          geocoded_address?: string | null
          geocoded_at?: string | null
          hds_certified?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hour?: string | null
          owner_profile_id?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          teleconsultation_available?: boolean
          timezone?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "clinics_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_preferences: {
        Row: {
          ads: boolean
          decided_at: string
          profile_id: string
          statistics: boolean
          updated_at: string
        }
        Insert: {
          ads?: boolean
          decided_at?: string
          profile_id: string
          statistics?: boolean
          updated_at?: string
        }
        Update: {
          ads?: boolean
          decided_at?: string
          profile_id?: string
          statistics?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
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
          spoken_languages: string[]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          rating?: number | null
          rpps_number?: string | null
          specialties?: Json
          spoken_languages?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          rpps_number?: string | null
          specialties?: Json
          spoken_languages?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "dentists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dentists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_access_log: {
        Row: {
          accessed_at: string
          accessor_id: string
          id: string
          patient_id: string
          section: string
        }
        Insert: {
          accessed_at?: string
          accessor_id: string
          id?: string
          patient_id: string
          section: string
        }
        Update: {
          accessed_at?: string
          accessor_id?: string
          id?: string
          patient_id?: string
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossier_access_log_accessor_id_fkey"
            columns: ["accessor_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_access_log_accessor_id_fkey"
            columns: ["accessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_access_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossier_access_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_primary_patient_id_fkey"
            columns: ["primary_patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fear_assessments: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          level: number
          note: string | null
          patient_id: string
          professional_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          level: number
          note?: string | null
          patient_id: string
          professional_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          level?: number
          note?: string | null
          patient_id?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fear_assessments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fear_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fear_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fear_assessments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fear_assessments_professional_id_fkey"
            columns: ["professional_id"]
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
            referencedRelation: "professional_public_profiles"
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
            referencedRelation: "professional_public_profiles"
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
      geocode_throttle: {
        Row: {
          id: boolean
          last_request_at: string
        }
        Insert: {
          id?: boolean
          last_request_at?: string
        }
        Update: {
          id?: boolean
          last_request_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          channel: string
          enabled: boolean
          notif_type: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          enabled?: boolean
          notif_type: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          enabled?: boolean
          notif_type?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
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
          is_seed: boolean
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
          is_seed?: boolean
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
          is_seed?: boolean
          medical_notes?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          active_env: string
          id: boolean
          updated_at: string
        }
        Insert: {
          active_env?: string
          id?: boolean
          updated_at?: string
        }
        Update: {
          active_env?: string
          id?: boolean
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
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
          is_seed: boolean
          language: Database["public"]["Enums"]["app_language"]
          phone: string | null
          phone_verified_at: string | null
          plan: string
          referral_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          showcased_achievements: string[]
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_seed?: boolean
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          phone_verified_at?: string | null
          plan?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          showcased_achievements?: string[]
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_seed?: boolean
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          phone_verified_at?: string | null
          plan?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          showcased_achievements?: string[]
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          points_cost: number
          profile_id: string
          redemption_code: string
          reward_key: string
          reward_name: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          points_cost: number
          profile_id: string
          redemption_code: string
          reward_key: string
          reward_name: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          points_cost?: number
          profile_id?: string
          redemption_code?: string
          reward_key?: string
          reward_name?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          level2_awarded_at: string | null
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          level2_awarded_at?: string | null
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          level2_awarded_at?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_catalog: {
        Row: {
          active: boolean
          brand: string | null
          category: string
          created_at: string
          description: string | null
          discount: string | null
          emoji: string | null
          id: string
          name: string
          points_cost: number
          reward_key: string
          role: Database["public"]["Enums"]["app_role"]
          sponsored: boolean
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          discount?: string | null
          emoji?: string | null
          id?: string
          name: string
          points_cost: number
          reward_key: string
          role: Database["public"]["Enums"]["app_role"]
          sponsored?: boolean
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          discount?: string | null
          emoji?: string | null
          id?: string
          name?: string
          points_cost?: number
          reward_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          sponsored?: boolean
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          renewal_notified_for: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
          withdrawal_waiver_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          renewal_notified_for?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
          withdrawal_waiver_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          renewal_notified_for?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
          withdrawal_waiver_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_ai_usage: {
        Row: {
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
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
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "waiting_list_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
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
            referencedRelation: "professional_public_profiles"
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
      professional_public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          language: Database["public"]["Enums"]["app_language"] | null
          role: Database["public"]["Enums"]["app_role"] | null
          showcased_achievements: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          language?: Database["public"]["Enums"]["app_language"] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          showcased_achievements?: never
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          language?: Database["public"]["Enums"]["app_language"] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          showcased_achievements?: never
        }
        Relationships: []
      }
      public_clinic_directory: {
        Row: {
          accepts_cheque_dentista: boolean | null
          accepts_cheque_protese: boolean | null
          address: string | null
          city: string | null
          country: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          postal_code: string | null
          teleconsultation_available: boolean | null
          timezone: string | null
        }
        Insert: {
          accepts_cheque_dentista?: boolean | null
          accepts_cheque_protese?: boolean | null
          address?: string | null
          city?: string | null
          country?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          teleconsultation_available?: boolean | null
          timezone?: string | null
        }
        Update: {
          accepts_cheque_dentista?: boolean | null
          accepts_cheque_protese?: boolean | null
          address?: string | null
          city?: string | null
          country?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          teleconsultation_available?: boolean | null
          timezone?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_terms: { Args: { _version: string }; Returns: undefined }
      anonymize_account: { Args: { _uid: string }; Returns: Json }
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
      can_edit_patient: { Args: { _patient_id: string }; Returns: boolean }
      can_notify_profile: { Args: { _profile_id: string }; Returns: boolean }
      can_rate_appointment: {
        Args: { _appointment_id: string; _to_profile_id: string }
        Returns: boolean
      }
      can_read_dossier: { Args: { _patient_id: string }; Returns: boolean }
      check_achievements: { Args: { _profile_id: string }; Returns: Json }
      claim_geocode_slot: { Args: never; Returns: undefined }
      confirm_phone_verification: {
        Args: { _profile_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _action_url?: string
          _message?: string
          _profile_id: string
          _title: string
          _type: string
        }
        Returns: string
      }
      current_role_is: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      current_terms_version: { Args: never; Returns: string }
      export_my_data: { Args: never; Returns: Json }
      generate_redemption_code: { Args: never; Returns: string }
      has_accepted_terms: { Args: { _uid: string }; Returns: boolean }
      is_clinic_member: { Args: { _clinic_id: string }; Returns: boolean }
      is_untrusted_caller: { Args: never; Returns: boolean }
      km_between: {
        Args: { _lat1: number; _lat2: number; _lng1: number; _lng2: number }
        Returns: number
      }
      level_for_xp: {
        Args: { _xp: number }
        Returns: Database["public"]["Enums"]["level_tier"]
      }
      level_multiplier: {
        Args: { _level: Database["public"]["Enums"]["level_tier"] }
        Returns: number
      }
      log_dossier_access: {
        Args: { _patient_id: string; _section: string }
        Returns: boolean
      }
      next_free_slot: {
        Args: { _clinic: string; _dentist: string }
        Returns: string
      }
      notification_default_target: { Args: { _type: string }; Returns: string }
      owns_clinic: { Args: { _clinic_id: string }; Returns: boolean }
      recompute_profile_rating: {
        Args: { _profile_id: string }
        Returns: undefined
      }
      record_ad_view: { Args: { _kind: string }; Returns: Json }
      redeem_reward: {
        Args: { _profile_id: string; _reward_key: string }
        Returns: Json
      }
      refresh_seed_appointments: { Args: never; Returns: undefined }
      register_referral: { Args: { _code: string }; Returns: Json }
      request_reschedule: {
        Args: { _appointment_id: string; _new_time: string }
        Returns: undefined
      }
      search_professionals: {
        Args: {
          _available?: string
          _city_or_postal?: string
          _cursor?: number
          _kind?: string
          _language?: string
          _lat?: number
          _limit?: number
          _lng?: number
          _max_km?: number
          _q?: string
          _sort?: string
          _specialty?: string
        }
        Returns: {
          avatar_url: string
          clinics: Json
          distance_km: number
          id: string
          kind: string
          languages: string[]
          name: string
          next_slot: string
          specialties: Json
          total: number
        }[]
      }
      send_annual_renewal_reminders: { Args: never; Returns: number }
      sync_profile_plan: {
        Args: { _env: string; _user_id: string }
        Returns: string
      }
      treats_patient: { Args: { _patient_id: string }; Returns: boolean }
      try_validate_referral: { Args: { _invitee: string }; Returns: undefined }
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
      redemption_status: "pendente" | "usado" | "expirado"
      verification_status: "pendente" | "aprovado" | "rejeitado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      redemption_status: ["pendente", "usado", "expirado"],
      verification_status: ["pendente", "aprovado", "rejeitado"],
      waiting_status: ["em_espera", "notificado", "confirmado"],
      waiting_urgency: ["normal", "urgente"],
    },
  },
} as const
