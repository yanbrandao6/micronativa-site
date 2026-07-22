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
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      quote_request_attachments: {
        Row: {
          attachment_index: number
          created_at: string
          id: string
          mime_type: string
          original_name: string
          quote_request_id: string
          size_bytes: number
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          attachment_index: number
          created_at?: string
          id?: string
          mime_type: string
          original_name: string
          quote_request_id: string
          size_bytes: number
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          attachment_index?: number
          created_at?: string
          id?: string
          mime_type?: string
          original_name?: string
          quote_request_id?: string
          size_bytes?: number
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_attachments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          quote_request_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          quote_request_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          quote_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_notes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["quote_request_status"]
          previous_status:
            | Database["public"]["Enums"]["quote_request_status"]
            | null
          public_message: string
          quote_request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["quote_request_status"]
          previous_status?:
            | Database["public"]["Enums"]["quote_request_status"]
            | null
          public_message: string
          quote_request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["quote_request_status"]
          previous_status?:
            | Database["public"]["Enums"]["quote_request_status"]
            | null
          public_message?: string
          quote_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_status_history_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          additional_services: string[]
          archived_at: string | null
          city: string
          created_at: string
          customer_email: string
          customer_email_normalized: string
          customer_name: string
          customer_phone: string
          customer_phone_normalized: string
          customer_whatsapp: string | null
          customer_whatsapp_normalized: string | null
          id: string
          idempotency_key: string
          preferred_contact_method: string
          privacy_consent_at: string
          project_details: Json
          project_reference: string | null
          property_type: string
          protocol: string
          protocol_sequence: number
          protocol_year: number
          purpose: string
          service: string
          source_page: string
          state: string
          status: Database["public"]["Enums"]["quote_request_status"]
          submission_completed_at: string | null
          updated_at: string
        }
        Insert: {
          additional_services?: string[]
          archived_at?: string | null
          city: string
          created_at?: string
          customer_email: string
          customer_email_normalized: string
          customer_name: string
          customer_phone: string
          customer_phone_normalized: string
          customer_whatsapp?: string | null
          customer_whatsapp_normalized?: string | null
          id?: string
          idempotency_key: string
          preferred_contact_method: string
          privacy_consent_at: string
          project_details?: Json
          project_reference?: string | null
          property_type: string
          protocol?: string
          protocol_sequence?: never
          protocol_year?: number
          purpose: string
          service: string
          source_page?: string
          state?: string
          status?: Database["public"]["Enums"]["quote_request_status"]
          submission_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          additional_services?: string[]
          archived_at?: string | null
          city?: string
          created_at?: string
          customer_email?: string
          customer_email_normalized?: string
          customer_name?: string
          customer_phone?: string
          customer_phone_normalized?: string
          customer_whatsapp?: string | null
          customer_whatsapp_normalized?: string | null
          id?: string
          idempotency_key?: string
          preferred_contact_method?: string
          privacy_consent_at?: string
          project_details?: Json
          project_reference?: string | null
          property_type?: string
          protocol?: string
          protocol_sequence?: never
          protocol_year?: number
          purpose?: string
          service?: string
          source_page?: string
          state?: string
          status?: Database["public"]["Enums"]["quote_request_status"]
          submission_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_quote_request: {
        Args: { acting_user_id: string; request_id: string }
        Returns: undefined
      }
      default_public_status_message: {
        Args: {
          status_value: Database["public"]["Enums"]["quote_request_status"]
        }
        Returns: string
      }
      update_quote_request_status: {
        Args: {
          acting_user_id: string
          request_id: string
          requested_public_message: string
          requested_status: Database["public"]["Enums"]["quote_request_status"]
        }
        Returns: {
          additional_services: string[]
          archived_at: string | null
          city: string
          created_at: string
          customer_email: string
          customer_email_normalized: string
          customer_name: string
          customer_phone: string
          customer_phone_normalized: string
          customer_whatsapp: string | null
          customer_whatsapp_normalized: string | null
          id: string
          idempotency_key: string
          preferred_contact_method: string
          privacy_consent_at: string
          project_details: Json
          project_reference: string | null
          property_type: string
          protocol: string
          protocol_sequence: number
          protocol_year: number
          purpose: string
          service: string
          source_page: string
          state: string
          status: Database["public"]["Enums"]["quote_request_status"]
          submission_completed_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quote_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      admin_role: "administrador" | "comercial" | "tecnico"
      quote_request_status:
        | "recebido"
        | "em_analise"
        | "contato_realizado"
        | "aguardando_cliente"
        | "visita_agendada"
        | "proposta_enviada"
        | "em_execucao"
        | "concluido"
        | "cancelado"
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
      admin_role: ["administrador", "comercial", "tecnico"],
      quote_request_status: [
        "recebido",
        "em_analise",
        "contato_realizado",
        "aguardando_cliente",
        "visita_agendada",
        "proposta_enviada",
        "em_execucao",
        "concluido",
        "cancelado",
      ],
    },
  },
} as const
