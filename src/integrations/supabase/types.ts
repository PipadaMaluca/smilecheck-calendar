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
      agenda_exceptions: {
        Row: {
          clinic_id: string | null
          color: string | null
          created_at: string
          created_by: string
          dentist_id: string
          ends_at: string
          full_day: boolean
          id: string
          kind: string
          note: string | null
          reason: string
          starts_at: string
        }
        Insert: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          dentist_id: string
          ends_at: string
          full_day?: boolean
          id?: string
          kind?: string
          note?: string | null
          reason?: string
          starts_at: string
        }
        Update: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          dentist_id?: string
          ends_at?: string
          full_day?: boolean
          id?: string
          kind?: string
          note?: string | null
          reason?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_exceptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_exceptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_exceptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_exceptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_exceptions_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_exceptions_dentist_id_fkey"
            columns: ["dentist_id"]
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
      clinic_invites: {
        Row: {
          clinic_id: string
          created_at: string
          email: string
          email_sent_at: string | null
          id: string
          invited_by: string
          responded_at: string | null
          status: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          email: string
          email_sent_at?: string | null
          id?: string
          invited_by: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: string
          invited_by?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_invites_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invites_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invites_invited_by_fkey"
            columns: ["invited_by"]
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
      clinical_documents: {
        Row: {
          clinic_id: string | null
          created_at: string
          doc_type: string
          family_member_id: string | null
          id: string
          mime_type: string
          patient_id: string
          size_bytes: number
          storage_path: string
          title: string | null
          uploaded_by: string
          uploaded_by_patient: boolean
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          doc_type: string
          family_member_id?: string | null
          id?: string
          mime_type: string
          patient_id: string
          size_bytes: number
          storage_path: string
          title?: string | null
          uploaded_by: string
          uploaded_by_patient?: boolean
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          doc_type?: string
          family_member_id?: string | null
          id?: string
          mime_type?: string
          patient_id?: string
          size_bytes?: number
          storage_path?: string
          title?: string | null
          uploaded_by?: string
          uploaded_by_patient?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "clinical_documents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_note_versions: {
        Row: {
          created_at: string
          diagnostico: string
          edited_by: string
          id: string
          motivo: string
          note_id: string
          observacoes: string
          proximos_passos: string
          tratamento: string
          version: number
        }
        Insert: {
          created_at?: string
          diagnostico: string
          edited_by: string
          id?: string
          motivo: string
          note_id: string
          observacoes: string
          proximos_passos: string
          tratamento: string
          version: number
        }
        Update: {
          created_at?: string
          diagnostico?: string
          edited_by?: string
          id?: string
          motivo?: string
          note_id?: string
          observacoes?: string
          proximos_passos?: string
          tratamento?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_note_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_note_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_note_versions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "clinical_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          appointment_id: string
          author_id: string
          clinic_id: string
          created_at: string
          diagnostico: string
          family_member_id: string | null
          id: string
          motivo: string
          observacoes: string
          patient_id: string
          proximos_passos: string
          tratamento: string
          updated_at: string
          version: number
        }
        Insert: {
          appointment_id: string
          author_id: string
          clinic_id: string
          created_at?: string
          diagnostico?: string
          family_member_id?: string | null
          id?: string
          motivo?: string
          observacoes?: string
          patient_id: string
          proximos_passos?: string
          tratamento?: string
          updated_at?: string
          version?: number
        }
        Update: {
          appointment_id?: string
          author_id?: string
          clinic_id?: string
          created_at?: string
          diagnostico?: string
          family_member_id?: string | null
          id?: string
          motivo?: string
          observacoes?: string
          patient_id?: string
          proximos_passos?: string
          tratamento?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
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
          geocode_source: string | null
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
          geocode_source?: string | null
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
          geocode_source?: string | null
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
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          last_message_at: string
          profile_a: string
          profile_b: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind: string
          last_message_at?: string
          profile_a: string
          profile_b: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          last_message_at?: string
          profile_a?: string
          profile_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_b_fkey"
            columns: ["profile_b"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_b_fkey"
            columns: ["profile_b"]
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
      dentist_availability: {
        Row: {
          city: string
          created_at: string
          dentist_id: string
          ends_at: string
          id: string
          notes: string | null
          radius_km: number
          starts_at: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          dentist_id: string
          ends_at: string
          id?: string
          notes?: string | null
          radius_km?: number
          starts_at: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          dentist_id?: string
          ends_at?: string
          id?: string
          notes?: string | null
          radius_km?: number
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_availability_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dentist_availability_dentist_id_fkey"
            columns: ["dentist_id"]
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
      document_counters: {
        Row: {
          clinic_id: string
          kind: string
          last_no: number
        }
        Insert: {
          clinic_id: string
          kind: string
          last_no?: number
        }
        Update: {
          clinic_id?: string
          kind?: string
          last_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_counters_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_counters_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
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
          health: Json
          id: string
          primary_patient_id: string
          relationship: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          health?: Json
          id?: string
          primary_patient_id: string
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          health?: Json
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
      favorites: {
        Row: {
          clinic_id: string | null
          created_at: string
          dentist_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          dentist_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          dentist_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
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
      job_applications: {
        Row: {
          created_at: string
          dentist_id: string
          id: string
          message: string | null
          post_id: string
        }
        Insert: {
          created_at?: string
          dentist_id: string
          id?: string
          message?: string | null
          post_id: string
        }
        Update: {
          created_at?: string
          dentist_id?: string
          id?: string
          message?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          city: string | null
          clinic_id: string
          contract_type: string
          created_at: string
          created_by: string
          days: string[]
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          clinic_id: string
          contract_type: string
          created_at?: string
          created_by: string
          days?: string[]
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          clinic_id?: string
          contract_type?: string
          created_at?: string
          created_by?: string
          days?: string[]
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_mime: string | null
          attachment_path: string | null
          attachment_size: number | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          voided_at: string | null
        }
        Insert: {
          attachment_mime?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          body?: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          voided_at?: string | null
        }
        Update: {
          attachment_mime?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      odontogram_entries: {
        Row: {
          appointment_id: string | null
          author_id: string
          clinic_id: string
          created_at: string
          faces: string[]
          family_member_id: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string
          surfaces: Json
          tooth: number
        }
        Insert: {
          appointment_id?: string | null
          author_id: string
          clinic_id: string
          created_at?: string
          faces?: string[]
          family_member_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status: string
          surfaces?: Json
          tooth: number
        }
        Update: {
          appointment_id?: string | null
          author_id?: string
          clinic_id?: string
          created_at?: string
          faces?: string[]
          family_member_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          surfaces?: Json
          tooth?: number
        }
        Relationships: [
          {
            foreignKeyName: "odontogram_entries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_entries_patient_id_fkey"
            columns: ["patient_id"]
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
          self_health: Json
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
          self_health?: Json
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
          self_health?: Json
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
      prescriptions: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          dentist_id: string
          family_member_id: string | null
          id: string
          items: Json
          notes: string | null
          number: number
          patient_id: string
          status: string
          verification_code: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          dentist_id: string
          family_member_id?: string | null
          id?: string
          items: Json
          notes?: string | null
          number: number
          patient_id: string
          status?: string
          verification_code: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          dentist_id?: string
          family_member_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          number?: number
          patient_id?: string
          status?: string
          verification_code?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          is_test: boolean
          language: Database["public"]["Enums"]["app_language"]
          phone: string | null
          phone_verified_at: string | null
          plan: string
          referral_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          role_pending: boolean
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
          is_test?: boolean
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          phone_verified_at?: string | null
          plan?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          role_pending?: boolean
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
          is_test?: boolean
          language?: Database["public"]["Enums"]["app_language"]
          phone?: string | null
          phone_verified_at?: string | null
          plan?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          role_pending?: boolean
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
      referral_letters: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          clinical_summary: string | null
          created_at: string
          dentist_id: string
          family_member_id: string | null
          id: string
          number: number
          patient_id: string
          reason: string
          status: string
          to_clinic_id: string | null
          to_dentist_id: string | null
          to_external: string | null
          urgency: string
          verification_code: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          clinical_summary?: string | null
          created_at?: string
          dentist_id: string
          family_member_id?: string | null
          id?: string
          number: number
          patient_id: string
          reason: string
          status?: string
          to_clinic_id?: string | null
          to_dentist_id?: string | null
          to_external?: string | null
          urgency?: string
          verification_code: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          clinical_summary?: string | null
          created_at?: string
          dentist_id?: string
          family_member_id?: string | null
          id?: string
          number?: number
          patient_id?: string
          reason?: string
          status?: string
          to_clinic_id?: string | null
          to_dentist_id?: string | null
          to_external?: string | null
          urgency?: string
          verification_code?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_letters_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_to_clinic_id_fkey"
            columns: ["to_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_to_clinic_id_fkey"
            columns: ["to_clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_to_dentist_id_fkey"
            columns: ["to_dentist_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_to_dentist_id_fkey"
            columns: ["to_dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_letters_voided_by_fkey"
            columns: ["voided_by"]
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
      treatment_plan_items: {
        Row: {
          created_at: string
          estimated_price: number | null
          id: string
          plan_id: string
          procedure: string
          sort_order: number
          status: string
          tooth: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_price?: number | null
          id?: string
          plan_id: string
          procedure: string
          sort_order?: number
          status?: string
          tooth?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_price?: number | null
          id?: string
          plan_id?: string
          procedure?: string
          sort_order?: number
          status?: string
          tooth?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          author_id: string
          clinic_id: string
          created_at: string
          family_member_id: string | null
          id: string
          internal_notes: string | null
          patient_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          clinic_id: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          internal_notes?: string | null
          patient_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          clinic_id?: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          internal_notes?: string | null
          patient_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "public_clinic_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
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
      triage_responses: {
        Row: {
          answers: Json
          appointment_id: string
          created_at: string
          family_member_id: string | null
          id: string
          patient_id: string
          summary: string | null
        }
        Insert: {
          answers?: Json
          appointment_id: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          patient_id: string
          summary?: string | null
        }
        Update: {
          answers?: Json
          appointment_id?: string
          created_at?: string
          family_member_id?: string | null
          id?: string
          patient_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triage_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_responses_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "professional_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      add_odontogram_entry: {
        Args: {
          _appointment_id?: string
          _clinic_id: string
          _faces: string[]
          _family_member_id?: string
          _notes?: string
          _patient_id: string
          _status: string
          _surfaces?: Json
          _tooth: number
        }
        Returns: string
      }
      add_treatment_item: {
        Args: {
          _estimated_price?: number
          _plan_id: string
          _procedure: string
          _tooth?: number
        }
        Returns: string
      }
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
      appointments_in_range: {
        Args: {
          _clinic: string
          _dentist: string
          _end: string
          _start: string
        }
        Returns: {
          clinic_id: string
          duration_minutes: number
          id: string
          patient_id: string
          scheduled_at: string
        }[]
      }
      assert_can_issue: {
        Args: { _clinic: string; _family: string; _patient: string }
        Returns: undefined
      }
      assert_dossier_writer: {
        Args: { _clinic: string; _patient: string }
        Returns: undefined
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
      can_access_patient_folder: { Args: { _folder: string }; Returns: boolean }
      can_edit_patient: { Args: { _patient_id: string }; Returns: boolean }
      can_notify_profile: { Args: { _profile_id: string }; Returns: boolean }
      can_rate_appointment: {
        Args: { _appointment_id: string; _to_profile_id: string }
        Returns: boolean
      }
      can_read_dossier: { Args: { _patient_id: string }; Returns: boolean }
      can_start_conversation: {
        Args: { _me: string; _other: string }
        Returns: string
      }
      can_upload_conversation_folder: {
        Args: { _folder: string }
        Returns: boolean
      }
      cancel_clinic_invite: { Args: { _invite_id: string }; Returns: undefined }
      check_achievements: { Args: { _profile_id: string }; Returns: Json }
      choose_initial_role: {
        Args: {
          _clinic_name?: string
          _order_number?: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      claim_geocode_slot: { Args: never; Returns: undefined }
      clinical_document: { Args: { _id: string; _kind: string }; Returns: Json }
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
      create_treatment_plan: {
        Args: {
          _clinic_id: string
          _family_member_id?: string
          _internal_notes?: string
          _patient_id: string
          _title: string
        }
        Returns: string
      }
      current_role_is: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      current_terms_version: { Args: never; Returns: string }
      dossier_safety: {
        Args: { _family_member_id?: string; _patient_id: string }
        Returns: Json
      }
      dossier_self_declared: {
        Args: { _family_member_id?: string; _patient_id: string }
        Returns: Json
      }
      export_my_data: { Args: never; Returns: Json }
      free_slots: {
        Args: {
          _clinic: string
          _count?: number
          _days?: number
          _dentist: string
        }
        Returns: {
          clinic_id: string
          dentist_id: string
          slot: string
        }[]
      }
      generate_redemption_code: { Args: never; Returns: string }
      has_accepted_terms: { Args: { _uid: string }; Returns: boolean }
      invite_dentist: {
        Args: { _clinic_id: string; _email: string }
        Returns: string
      }
      is_approved_dentist: { Args: never; Returns: boolean }
      is_clinic_member: { Args: { _clinic_id: string }; Returns: boolean }
      is_conversation_participant: { Args: { _conv: string }; Returns: boolean }
      is_professional_of_clinic: {
        Args: { _clinic_id: string }
        Returns: boolean
      }
      is_untrusted_caller: { Args: never; Returns: boolean }
      issue_prescription: {
        Args: {
          _appointment_id?: string
          _clinic_id: string
          _family_member_id?: string
          _items: Json
          _notes?: string
          _patient_id: string
        }
        Returns: string
      }
      issue_referral_letter: {
        Args: {
          _appointment_id?: string
          _clinic_id: string
          _clinical_summary?: string
          _family_member_id?: string
          _patient_id: string
          _reason: string
          _to_clinic_id?: string
          _to_dentist_id?: string
          _to_external?: string
          _urgency?: string
        }
        Returns: string
      }
      job_post_open: { Args: { _post: string }; Returns: boolean }
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
      list_dentist_availability: { Args: never; Returns: Json }
      log_dossier_access: {
        Args: { _patient_id: string; _section: string }
        Returns: boolean
      }
      mark_conversation_read: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      my_contactable_profiles: { Args: never; Returns: Json }
      my_conversations: { Args: never; Returns: Json }
      my_favorites: { Args: never; Returns: Json }
      my_ranking: { Args: never; Returns: Json }
      my_treatment_plans: { Args: never; Returns: Json }
      my_unread_messages: { Args: never; Returns: number }
      new_verification_code: { Args: never; Returns: string }
      next_document_number: {
        Args: { _clinic: string; _kind: string }
        Returns: number
      }
      next_free_slot: {
        Args: { _clinic: string; _dentist: string }
        Returns: string
      }
      notification_default_target: { Args: { _type: string }; Returns: string }
      open_clinical_document: { Args: { _id: string }; Returns: string }
      open_message_attachment: {
        Args: { _message_id: string }
        Returns: string
      }
      owns_approved_clinic: { Args: never; Returns: boolean }
      owns_clinic: { Args: { _clinic_id: string }; Returns: boolean }
      owns_job_post: { Args: { _post: string }; Returns: boolean }
      professional_reviews: {
        Args: { _clinic?: string; _dentist?: string }
        Returns: Json
      }
      profile_in_clinic: {
        Args: { _clinic: string; _profile: string }
        Returns: boolean
      }
      public_clinic_profile: { Args: { _id: string }; Returns: Json }
      public_dentist_profile: { Args: { _id: string }; Returns: Json }
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
      register_clinical_document: {
        Args: {
          _clinic_id?: string
          _doc_type: string
          _family_member_id?: string
          _mime_type: string
          _patient_id: string
          _size_bytes: number
          _storage_path: string
          _title?: string
        }
        Returns: string
      }
      register_referral: { Args: { _code: string }; Returns: Json }
      request_reschedule: {
        Args: { _appointment_id: string; _new_time: string }
        Returns: undefined
      }
      respond_clinic_invite: {
        Args: { _accept: boolean; _invite_id: string }
        Returns: undefined
      }
      save_clinical_note: {
        Args: {
          _appointment_id: string
          _diagnostico: string
          _motivo: string
          _observacoes: string
          _proximos_passos: string
          _tratamento: string
        }
        Returns: string
      }
      search_my_patients: {
        Args: { _limit?: number; _offset?: number; _q?: string }
        Returns: {
          date_of_birth: string
          full_name: string
          id: string
          last_visit: string
          next_visit: string
          phone: string
          total: number
        }[]
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
      send_message: {
        Args: {
          _attachment_mime?: string
          _attachment_path?: string
          _attachment_size?: number
          _body: string
          _conversation_id: string
        }
        Returns: string
      }
      set_treatment_item_status: {
        Args: { _item_id: string; _status: string }
        Returns: undefined
      }
      short_person_name: { Args: { _full: string }; Returns: string }
      slot_availability: {
        Args: {
          _clinic: string
          _dentist: string
          _end: string
          _start: string
        }
        Returns: string
      }
      start_conversation: { Args: { _other: string }; Returns: string }
      sync_profile_plan: {
        Args: { _env: string; _user_id: string }
        Returns: string
      }
      treats_patient: { Args: { _patient_id: string }; Returns: boolean }
      try_validate_referral: { Args: { _invitee: string }; Returns: undefined }
      verify_document: { Args: { _code: string }; Returns: Json }
      void_clinical_document: {
        Args: { _id: string; _kind: string; _reason: string }
        Returns: undefined
      }
      void_message: { Args: { _message_id: string }; Returns: undefined }
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
