// Gerado automaticamente do projeto Supabase 'Ienvia' (jazvdlkyvwquoednmljf).
// Não edite manualmente; regenere com o MCP do Supabase quando o esquema mudar.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      campaign_recipients: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          eligibility_checked_at: string | null
          id: string
          idempotency_key: string
          instance_id: string
          message_id: string | null
          planned_at: string | null
          send_allowed: boolean
          sent_at: string | null
          status: string
          suppression_reason: string | null
          workspace_id: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          eligibility_checked_at?: string | null
          id?: string
          idempotency_key: string
          instance_id: string
          message_id?: string | null
          planned_at?: string | null
          send_allowed?: boolean
          sent_at?: string | null
          status?: string
          suppression_reason?: string | null
          workspace_id: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          eligibility_checked_at?: string | null
          id?: string
          idempotency_key?: string
          instance_id?: string
          message_id?: string | null
          planned_at?: string | null
          send_allowed?: boolean
          sent_at?: string | null
          status?: string
          suppression_reason?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_workspace_id_campaign_id_fkey"
            columns: ["workspace_id", "campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "campaign_recipients_workspace_id_contact_id_fkey"
            columns: ["workspace_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "campaign_recipients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_workspace_id_instance_id_fkey"
            columns: ["workspace_id", "instance_id"]
            isOneToOne: false
            referencedRelation: "instances"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "campaign_recipients_workspace_id_message_id_fkey"
            columns: ["workspace_id", "message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      campaigns: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          finished_at: string | null
          id: string
          media_object_key: string | null
          name: string
          scheduled_for: string | null
          send_window_end: string | null
          send_window_start: string | null
          settings: Json
          started_at: string | null
          status: string
          text_body: string | null
          timezone: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          media_object_key?: string | null
          name: string
          scheduled_for?: string | null
          send_window_end?: string | null
          send_window_start?: string | null
          settings?: Json
          started_at?: string | null
          status?: string
          text_body?: string | null
          timezone?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          media_object_key?: string | null
          name?: string
          scheduled_for?: string | null
          send_window_end?: string | null
          send_window_start?: string | null
          settings?: Json
          started_at?: string | null
          status?: string
          text_body?: string | null
          timezone?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_consent_events: {
        Row: {
          action: string
          contact_id: string
          created_at: string
          evidence_reference: string | null
          id: string
          occurred_at: string
          purpose: string
          recorded_by: string | null
          source: string
          workspace_id: string
        }
        Insert: {
          action: string
          contact_id: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          occurred_at: string
          purpose: string
          recorded_by?: string | null
          source: string
          workspace_id: string
        }
        Update: {
          action?: string
          contact_id?: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          occurred_at?: string
          purpose?: string
          recorded_by?: string | null
          source?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_consent_events_workspace_id_contact_id_fkey"
            columns: ["workspace_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "contact_consent_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_consent_state: {
        Row: {
          contact_id: string
          evidence_reference: string | null
          occurred_at: string
          purpose: string
          source: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          contact_id: string
          evidence_reference?: string | null
          occurred_at: string
          purpose: string
          source: string
          status: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          contact_id?: string
          evidence_reference?: string | null
          occurred_at?: string
          purpose?: string
          source?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_consent_state_workspace_id_contact_id_fkey"
            columns: ["workspace_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "contact_consent_state_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_erasure_requests: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          id: string
          received_at: string
          request_reference: string
          requested_by: string | null
          result_summary: string | null
          retention_exception_code: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          id?: string
          received_at?: string
          request_reference: string
          requested_by?: string | null
          result_summary?: string | null
          retention_exception_code?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          id?: string
          received_at?: string
          request_reference?: string
          requested_by?: string | null
          result_summary?: string | null
          retention_exception_code?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_erasure_requests_workspace_id_contact_id_fkey"
            columns: ["workspace_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "contact_erasure_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_links: {
        Row: {
          contact_id_high: string
          contact_id_low: string
          created_at: string
          id: string
          linked_by: string | null
          workspace_id: string
        }
        Insert: {
          contact_id_high: string
          contact_id_low: string
          created_at?: string
          id?: string
          linked_by?: string | null
          workspace_id: string
        }
        Update: {
          contact_id_high?: string
          contact_id_low?: string
          created_at?: string
          id?: string
          linked_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_links_workspace_id_contact_id_high_fkey"
            columns: ["workspace_id", "contact_id_high"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "contact_links_workspace_id_contact_id_low_fkey"
            columns: ["workspace_id", "contact_id_low"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "contact_links_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          channel: string
          consent_status: string
          consent_updated_at: string | null
          created_at: string
          display_name: string
          email: string | null
          erased_at: string | null
          external_user_id: string | null
          id: string
          instance_id: string | null
          phone_e164: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel: string
          consent_status?: string
          consent_updated_at?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          erased_at?: string | null
          external_user_id?: string | null
          id?: string
          instance_id?: string | null
          phone_e164?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          consent_status?: string
          consent_updated_at?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          erased_at?: string | null
          external_user_id?: string | null
          id?: string
          instance_id?: string | null
          phone_e164?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_instance_id_fkey"
            columns: ["workspace_id", "instance_id"]
            isOneToOne: false
            referencedRelation: "instances"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      conversations: {
        Row: {
          activity_at: string | null
          assigned_label: string | null
          assigned_user_id: string | null
          automation_paused: boolean
          contact_id: string
          created_at: string
          id: string
          instance_id: string
          last_message_at: string | null
          last_message_preview: string | null
          stage: string
          unread_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          activity_at?: string | null
          assigned_label?: string | null
          assigned_user_id?: string | null
          automation_paused?: boolean
          contact_id: string
          created_at?: string
          id?: string
          instance_id: string
          last_message_at?: string | null
          last_message_preview?: string | null
          stage?: string
          unread_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          activity_at?: string | null
          assigned_label?: string | null
          assigned_user_id?: string | null
          automation_paused?: boolean
          contact_id?: string
          created_at?: string
          id?: string
          instance_id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          stage?: string
          unread_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_workspace_id_contact_id_fkey"
            columns: ["workspace_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_instance_id_fkey"
            columns: ["workspace_id", "instance_id"]
            isOneToOne: false
            referencedRelation: "instances"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      instances: {
        Row: {
          channel: string
          created_at: string
          display_name: string
          engine: string
          id: string
          is_enabled: boolean
          last_seen_at: string | null
          logical_number_key: string | null
          provider_instance_name: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          display_name: string
          engine: string
          id?: string
          is_enabled?: boolean
          last_seen_at?: string | null
          logical_number_key?: string | null
          provider_instance_name?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          display_name?: string
          engine?: string
          id?: string
          is_enabled?: boolean
          last_seen_at?: string | null
          logical_number_key?: string | null
          provider_instance_name?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instances_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          byte_size: number
          content_type: string
          created_at: string
          deletion_status: string
          id: string
          message_id: string
          object_key: string
          retention_delete_after: string | null
          sha256_hex: string | null
          workspace_id: string
        }
        Insert: {
          byte_size: number
          content_type: string
          created_at?: string
          deletion_status?: string
          id?: string
          message_id: string
          object_key: string
          retention_delete_after?: string | null
          sha256_hex?: string | null
          workspace_id: string
        }
        Update: {
          byte_size?: number
          content_type?: string
          created_at?: string
          deletion_status?: string
          id?: string
          message_id?: string
          object_key?: string
          retention_delete_after?: string | null
          sha256_hex?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_workspace_id_message_id_fkey"
            columns: ["workspace_id", "message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      messages: {
        Row: {
          actor_type: string
          body_text: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          idempotency_key: string | null
          instance_id: string
          media_object_key: string | null
          occurred_at: string
          provider_message_id: string | null
          source_engine: string
          status: string
          workspace_id: string
        }
        Insert: {
          actor_type: string
          body_text?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          idempotency_key?: string | null
          instance_id: string
          media_object_key?: string | null
          occurred_at: string
          provider_message_id?: string | null
          source_engine: string
          status: string
          workspace_id: string
        }
        Update: {
          actor_type?: string
          body_text?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          idempotency_key?: string | null
          instance_id?: string
          media_object_key?: string | null
          occurred_at?: string
          provider_message_id?: string | null
          source_engine?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_workspace_id_conversation_id_fkey"
            columns: ["workspace_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workspace_id_instance_id_fkey"
            columns: ["workspace_id", "instance_id"]
            isOneToOne: false
            referencedRelation: "instances"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      outbox_jobs: {
        Row: {
          attempts: number
          available_at: string
          conversation_id: string | null
          created_at: string
          id: string
          idempotency_key: string
          job_type: string
          last_error_code: string | null
          lease_until: string | null
          message_id: string | null
          payload: Json
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attempts?: number
          available_at?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          job_type: string
          last_error_code?: string | null
          lease_until?: string | null
          message_id?: string | null
          payload?: Json
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attempts?: number
          available_at?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          job_type?: string
          last_error_code?: string | null
          lease_until?: string | null
          message_id?: string | null
          payload?: Json
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbox_jobs_workspace_id_conversation_id_fkey"
            columns: ["workspace_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "outbox_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbox_jobs_workspace_id_message_id_fkey"
            columns: ["workspace_id", "message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          engine: string
          event_type: string
          id: string
          instance_id: string
          processed_at: string | null
          processing_status: string
          provider_event_id: string
          received_at: string
          workspace_id: string
        }
        Insert: {
          engine: string
          event_type: string
          id?: string
          instance_id: string
          processed_at?: string | null
          processing_status?: string
          provider_event_id: string
          received_at?: string
          workspace_id: string
        }
        Update: {
          engine?: string
          event_type?: string
          id?: string
          instance_id?: string
          processed_at?: string | null
          processing_status?: string
          provider_event_id?: string
          received_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_workspace_id_instance_id_fkey"
            columns: ["workspace_id", "instance_id"]
            isOneToOne: false
            referencedRelation: "instances"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspace_data_policies: {
        Row: {
          active_data_purge_sla_days: number
          backup_expiry_target_days: number
          media_retention_days: number
          message_retention_days: number
          recovery_window_days: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active_data_purge_sla_days?: number
          backup_expiry_target_days?: number
          media_retention_days?: number
          message_retention_days?: number
          recovery_window_days?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active_data_purge_sla_days?: number
          backup_expiry_target_days?: number
          media_retention_days?: number
          message_retention_days?: number
          recovery_window_days?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_data_policies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_exports: {
        Row: {
          categories: Json
          checksum_sha256: string | null
          completed_at: string | null
          date_from: string | null
          date_to: string | null
          expires_at: string | null
          failure_code: string | null
          format: string
          id: string
          manifest: Json | null
          object_key: string | null
          requested_at: string
          requested_by: string
          status: string
          workspace_id: string
        }
        Insert: {
          categories: Json
          checksum_sha256?: string | null
          completed_at?: string | null
          date_from?: string | null
          date_to?: string | null
          expires_at?: string | null
          failure_code?: string | null
          format: string
          id?: string
          manifest?: Json | null
          object_key?: string | null
          requested_at?: string
          requested_by: string
          status?: string
          workspace_id: string
        }
        Update: {
          categories?: Json
          checksum_sha256?: string | null
          completed_at?: string | null
          date_from?: string | null
          date_to?: string | null
          expires_at?: string | null
          failure_code?: string | null
          format?: string
          id?: string
          manifest?: Json | null
          object_key?: string | null
          requested_at?: string
          requested_by?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_exports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email_normalized: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          status: string
          token_hash: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email_normalized: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role: string
          status?: string
          token_hash: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email_normalized?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          token_hash?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_lifecycle_requests: {
        Row: {
          completed_at: string | null
          id: string
          recovery_deadline: string | null
          request_type: string
          requested_at: string
          requested_by: string
          result_code: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          recovery_deadline?: string | null
          request_type: string
          requested_at?: string
          requested_by: string
          result_code?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          recovery_deadline?: string | null
          request_type?: string
          requested_at?: string
          requested_by?: string
          result_code?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_lifecycle_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_lifecycle_requests_workspace_id_requested_by_fkey"
            columns: ["workspace_id", "requested_by"]
            isOneToOne: false
            referencedRelation: "workspace_memberships"
            referencedColumns: ["workspace_id", "user_id"]
          },
        ]
      }
      workspace_memberships: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          role: string
          status?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: string
          status?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_memberships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string | null
          deletion_started_at: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          deletion_started_at?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          deletion_started_at?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ingest_evolution_text: {
        Args: {
          p_body_text: string
          p_event_id: string
          p_event_type: string
          p_from_me: boolean
          p_instance_name: string
          p_occurred_at: string
          p_push_name: string
          p_sender_jid: string
          p_token_sha256: string
        }
        Returns: Json
      }
      is_my_platform_master: { Args: never; Returns: boolean }
      record_contact_consent: {
        Args: {
          p_action: string
          p_contact_id: string
          p_evidence_reference?: string
          p_occurred_at?: string
          p_purpose: string
          p_source: string
          p_workspace_id: string
        }
        Returns: string
      }
      register_my_evolution_instance:
        | {
            Args: {
              p_display_name: string
              p_provider_instance_name: string
              p_workspace_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_display_name: string
              p_provider_instance_name: string
              p_webhook_token_sha256: string
              p_workspace_id: string
            }
            Returns: Json
          }
      transition_workspace_conversation: {
        Args: {
          p_action: string
          p_conversation_id: string
          p_workspace_id: string
        }
        Returns: Json
      }
      update_my_evolution_instance_state: {
        Args: {
          p_instance_id: string
          p_provider_state: string
          p_workspace_id: string
        }
        Returns: Json
      }
      update_my_workspace_data_policy: {
        Args: {
          p_active_data_purge_sla_days: number
          p_backup_expiry_target_days: number
          p_media_retention_days: number
          p_message_retention_days: number
          p_recovery_window_days: number
          p_workspace_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

