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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      appeals: {
        Row: {
          alasan: string
          created_at: string
          direview_at: string | null
          direview_oleh: string | null
          id: string
          review_reason: string | null
          status: Database["public"]["Enums"]["appeal_status"]
          user_id: string
        }
        Insert: {
          alasan: string
          created_at?: string
          direview_at?: string | null
          direview_oleh?: string | null
          id?: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["appeal_status"]
          user_id: string
        }
        Update: {
          alasan?: string
          created_at?: string
          direview_at?: string | null
          direview_oleh?: string | null
          id?: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["appeal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appeals_direview_oleh_fkey"
            columns: ["direview_oleh"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_wallet_ledger: {
        Row: {
          alasan: string
          amount: number
          created_at: string
          created_by: string
          id: string
          saldo_setelah: number
          user_id: string
          wallet_id: string
        }
        Insert: {
          alasan: string
          amount: number
          created_at?: string
          created_by: string
          id?: string
          saldo_setelah: number
          user_id: string
          wallet_id: string
        }
        Update: {
          alasan?: string
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          saldo_setelah?: number
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_wallet_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_wallet_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_wallet_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "demo_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_wallets: {
        Row: {
          id: string
          saldo: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          saldo?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          saldo?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["emergency_status"]
          task_id: string
          triggered_by: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["emergency_status"]
          task_id: string
          triggered_by: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["emergency_status"]
          task_id?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      health_snapshots: {
        Row: {
          cerita_hari_ini: string | null
          created_at: string
          energi: number
          id: string
          kualitas_tidur: number
          lansia_id: string
          mobilitas: number
          mood: number
          nafsu_makan: number
          task_id: string
        }
        Insert: {
          cerita_hari_ini?: string | null
          created_at?: string
          energi: number
          id?: string
          kualitas_tidur: number
          lansia_id: string
          mobilitas: number
          mood: number
          nafsu_makan: number
          task_id: string
        }
        Update: {
          cerita_hari_ini?: string | null
          created_at?: string
          energi?: number
          id?: string
          kualitas_tidur?: number
          lansia_id?: string
          mobilitas?: number
          mood?: number
          nafsu_makan?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_snapshots_lansia_id_fkey"
            columns: ["lansia_id"]
            isOneToOne: false
            referencedRelation: "lansia_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_snapshots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_photo_change_requests: {
        Row: {
          alasan: string | null
          diajukan_at: string
          ditinjau_at: string | null
          ditinjau_oleh: string | null
          foto_wajah_url: string
          helper_id: string
          id: string
          status: string
        }
        Insert: {
          alasan?: string | null
          diajukan_at?: string
          ditinjau_at?: string | null
          ditinjau_oleh?: string | null
          foto_wajah_url: string
          helper_id: string
          id?: string
          status?: string
        }
        Update: {
          alasan?: string | null
          diajukan_at?: string
          ditinjau_at?: string | null
          ditinjau_oleh?: string | null
          foto_wajah_url?: string
          helper_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_photo_change_requests_ditinjau_oleh_fkey"
            columns: ["ditinjau_oleh"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_photo_change_requests_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_profiles: {
        Row: {
          bio: string | null
          created_at: string
          domisili_lat: number | null
          domisili_lng: number | null
          foto_wajah_url: string | null
          id: string
          is_available: boolean
          koordinator_id: string | null
          ktp_url: string | null
          promoted_at: string | null
          promoted_by: string | null
          radius_layanan_km: number
          rating_avg: number
          saldo_tersedia: number
          status: Database["public"]["Enums"]["helper_status"]
          suspend_reason: string | null
          tingkat_kepercayaan: Database["public"]["Enums"]["trust_tier"]
          total_tugas_selesai: number
          tugas_selesai_berturut: number
          updated_at: string
          user_id: string
          verified_by_admin_fallback: boolean
          wilayah_domisili: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          domisili_lat?: number | null
          domisili_lng?: number | null
          foto_wajah_url?: string | null
          id?: string
          is_available?: boolean
          koordinator_id?: string | null
          ktp_url?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          radius_layanan_km?: number
          rating_avg?: number
          saldo_tersedia?: number
          status?: Database["public"]["Enums"]["helper_status"]
          suspend_reason?: string | null
          tingkat_kepercayaan?: Database["public"]["Enums"]["trust_tier"]
          total_tugas_selesai?: number
          tugas_selesai_berturut?: number
          updated_at?: string
          user_id: string
          verified_by_admin_fallback?: boolean
          wilayah_domisili: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          domisili_lat?: number | null
          domisili_lng?: number | null
          foto_wajah_url?: string | null
          id?: string
          is_available?: boolean
          koordinator_id?: string | null
          ktp_url?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          radius_layanan_km?: number
          rating_avg?: number
          saldo_tersedia?: number
          status?: Database["public"]["Enums"]["helper_status"]
          suspend_reason?: string | null
          tingkat_kepercayaan?: Database["public"]["Enums"]["trust_tier"]
          total_tugas_selesai?: number
          tugas_selesai_berturut?: number
          updated_at?: string
          user_id?: string
          verified_by_admin_fallback?: boolean
          wilayah_domisili?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_profiles_koordinator_id_fkey"
            columns: ["koordinator_id"]
            isOneToOne: false
            referencedRelation: "koordinator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_profiles_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "koordinator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_service_categories: {
        Row: {
          helper_id: string
          service_category_id: string
        }
        Insert: {
          helper_id: string
          service_category_id: string
        }
        Update: {
          helper_id?: string
          service_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_service_categories_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_service_categories_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      koordinator_profiles: {
        Row: {
          created_at: string
          diverifikasi_at: string | null
          diverifikasi_oleh: string | null
          dokumen_url: string | null
          domisili_lat: number | null
          domisili_lng: number | null
          foto_url: string | null
          id: string
          ktp_url: string | null
          saldo_komisi: number
          status: Database["public"]["Enums"]["koordinator_status"]
          tingkat: Database["public"]["Enums"]["koordinator_tingkat"]
          updated_at: string
          user_id: string
          wilayah: string
        }
        Insert: {
          created_at?: string
          diverifikasi_at?: string | null
          diverifikasi_oleh?: string | null
          dokumen_url?: string | null
          domisili_lat?: number | null
          domisili_lng?: number | null
          foto_url?: string | null
          id?: string
          ktp_url?: string | null
          saldo_komisi?: number
          status?: Database["public"]["Enums"]["koordinator_status"]
          tingkat?: Database["public"]["Enums"]["koordinator_tingkat"]
          updated_at?: string
          user_id: string
          wilayah: string
        }
        Update: {
          created_at?: string
          diverifikasi_at?: string | null
          diverifikasi_oleh?: string | null
          dokumen_url?: string | null
          domisili_lat?: number | null
          domisili_lng?: number | null
          foto_url?: string | null
          id?: string
          ktp_url?: string | null
          saldo_komisi?: number
          status?: Database["public"]["Enums"]["koordinator_status"]
          tingkat?: Database["public"]["Enums"]["koordinator_tingkat"]
          updated_at?: string
          user_id?: string
          wilayah?: string
        }
        Relationships: [
          {
            foreignKeyName: "koordinator_profiles_diverifikasi_oleh_fkey"
            columns: ["diverifikasi_oleh"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "koordinator_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lansia_profiles: {
        Row: {
          alamat: string
          catatan_kondisi: string | null
          created_at: string
          deleted_at: string | null
          dokumen_hubungan_keluarga_url: string | null
          dokumen_identitas_lansia_url: string | null
          foto_url: string | null
          hubungan_keluarga: string | null
          id: string
          kabupaten_kota: string | null
          kebutuhan_khusus: string | null
          kecamatan: string | null
          keluarga_id: string
          kelurahan: string | null
          lat: number | null
          lng: number | null
          nama: string
          provinsi: string | null
          rt: number | null
          rw: number | null
          tingkat_mobilitas: string | null
          umur: number | null
          updated_at: string
        }
        Insert: {
          alamat: string
          catatan_kondisi?: string | null
          created_at?: string
          deleted_at?: string | null
          dokumen_hubungan_keluarga_url?: string | null
          dokumen_identitas_lansia_url?: string | null
          foto_url?: string | null
          hubungan_keluarga?: string | null
          id?: string
          kabupaten_kota?: string | null
          kebutuhan_khusus?: string | null
          kecamatan?: string | null
          keluarga_id: string
          kelurahan?: string | null
          lat?: number | null
          lng?: number | null
          nama: string
          provinsi?: string | null
          rt?: number | null
          rw?: number | null
          tingkat_mobilitas?: string | null
          umur?: number | null
          updated_at?: string
        }
        Update: {
          alamat?: string
          catatan_kondisi?: string | null
          created_at?: string
          deleted_at?: string | null
          dokumen_hubungan_keluarga_url?: string | null
          dokumen_identitas_lansia_url?: string | null
          foto_url?: string | null
          hubungan_keluarga?: string | null
          id?: string
          kabupaten_kota?: string | null
          kebutuhan_khusus?: string | null
          kecamatan?: string | null
          keluarga_id?: string
          kelurahan?: string | null
          lat?: number | null
          lng?: number | null
          nama?: string
          provinsi?: string | null
          rt?: number | null
          rw?: number | null
          tingkat_mobilitas?: string | null
          umur?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lansia_profiles_keluarga_id_fkey"
            columns: ["keluarga_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          task_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          task_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          idempotency_key: string | null
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_ref?: string | null
          held_at?: string | null
          helper_share?: number
          id?: string
          idempotency_key?: string | null
          jumlah_total: number
          koordinator_share?: number
          midtrans_order_id?: string | null
          midtrans_snap_token?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          platform_fee?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_ref?: string | null
          held_at?: string | null
          helper_share?: number
          id?: string
          idempotency_key?: string | null
          jumlah_total?: number
          koordinator_share?: number
          midtrans_order_id?: string | null
          midtrans_snap_token?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          platform_fee?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_checklist: {
        Row: {
          catatan_koordinator: string | null
          completed_at: string | null
          created_at: string
          dikenal_warga: boolean
          helper_id: string
          id: string
          identitas_valid: boolean
          koordinator_id: string
          wawancara_dilakukan: boolean
        }
        Insert: {
          catatan_koordinator?: string | null
          completed_at?: string | null
          created_at?: string
          dikenal_warga?: boolean
          helper_id: string
          id?: string
          identitas_valid?: boolean
          koordinator_id: string
          wawancara_dilakukan?: boolean
        }
        Update: {
          catatan_koordinator?: string | null
          completed_at?: string | null
          created_at?: string
          dikenal_warga?: boolean
          helper_id?: string
          id?: string
          identitas_valid?: boolean
          koordinator_id?: string
          wawancara_dilakukan?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "promotion_checklist_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_checklist_koordinator_id_fkey"
            columns: ["koordinator_id"]
            isOneToOne: false
            referencedRelation: "koordinator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          created_at: string
          helper_id: string
          id: string
          keluarga_id: string
          komentar: string | null
          skor: number
          task_id: string
        }
        Insert: {
          created_at?: string
          helper_id: string
          id?: string
          keluarga_id: string
          komentar?: string | null
          skor: number
          task_id: string
        }
        Update: {
          created_at?: string
          helper_id?: string
          id?: string
          keluarga_id?: string
          komentar?: string | null
          skor?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_keluarga_id_fkey"
            columns: ["keluarga_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          alasan: string
          created_at: string
          decision_reason: string | null
          ditindak_oleh: string | null
          id: string
          reported_helper_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          alasan: string
          created_at?: string
          decision_reason?: string | null
          ditindak_oleh?: string | null
          id?: string
          reported_helper_id: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          alasan?: string
          created_at?: string
          decision_reason?: string | null
          ditindak_oleh?: string | null
          id?: string
          reported_helper_id?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_ditindak_oleh_fkey"
            columns: ["ditindak_oleh"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_helper_id_fkey"
            columns: ["reported_helper_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          deskripsi: string
          estimasi_durasi_menit: number
          harga_dasar: number
          id: string
          is_active: boolean
          is_high_risk: boolean
          jarak_max_km: number | null
          jarak_min_km: number | null
          nama: string
          parent_id: string | null
          tingkat: string
        }
        Insert: {
          created_at?: string
          deskripsi: string
          estimasi_durasi_menit: number
          harga_dasar: number
          id?: string
          is_active?: boolean
          is_high_risk?: boolean
          jarak_max_km?: number | null
          jarak_min_km?: number | null
          nama: string
          parent_id?: string | null
          tingkat?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string
          estimasi_durasi_menit?: number
          harga_dasar?: number
          id?: string
          is_active?: boolean
          is_high_risk?: boolean
          jarak_max_km?: number | null
          jarak_min_km?: number | null
          nama?: string
          parent_id?: string | null
          tingkat?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      task_evidence: {
        Row: {
          catatan_kondisi: string
          client_submission_id: string | null
          created_at: string
          foto_bukti_url: string
          id: string
          task_id: string
        }
        Insert: {
          catatan_kondisi: string
          client_submission_id?: string | null
          created_at?: string
          foto_bukti_url: string
          id?: string
          task_id: string
        }
        Update: {
          catatan_kondisi?: string
          client_submission_id?: string | null
          created_at?: string
          foto_bukti_url?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_evidence_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_extra_services: {
        Row: {
          biaya: number
          created_at: string
          id: string
          nama_layanan: string
          status: Database["public"]["Enums"]["extra_service_status"]
          task_id: string
        }
        Insert: {
          biaya: number
          created_at?: string
          id?: string
          nama_layanan: string
          status?: Database["public"]["Enums"]["extra_service_status"]
          task_id: string
        }
        Update: {
          biaya?: number
          created_at?: string
          id?: string
          nama_layanan?: string
          status?: Database["public"]["Enums"]["extra_service_status"]
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_extra_services_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          mode_penugasan: Database["public"]["Enums"]["task_assignment_mode"]
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catatan?: string | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkin_time?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          harga_dasar: number
          harga_final: number
          helper_id?: string | null
          id?: string
          jadwal_waktu: string
          jadwal_waktu_asli?: string | null
          keluarga_id: string
          lansia_id: string
          mode_penugasan?: Database["public"]["Enums"]["task_assignment_mode"]
          reschedule_count?: number
          service_category_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          catatan?: string | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkin_time?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          harga_dasar?: number
          harga_final?: number
          helper_id?: string | null
          id?: string
          jadwal_waktu?: string
          jadwal_waktu_asli?: string | null
          keluarga_id?: string
          lansia_id?: string
          mode_penugasan?: Database["public"]["Enums"]["task_assignment_mode"]
          reschedule_count?: number
          service_category_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "helper_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_keluarga_id_fkey"
            columns: ["keluarga_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lansia_id_fkey"
            columns: ["lansia_id"]
            isOneToOne: false
            referencedRelation: "lansia_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_logs: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["transaction_event"]
          id: string
          payload: Json | null
          payment_id: string
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["transaction_event"]
          id?: string
          payload?: Json | null
          payment_id: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["transaction_event"]
          id?: string
          payload?: Json | null
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          alamat_detail: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kabupaten_kota: string | null
          kecamatan: string | null
          kelurahan: string | null
          phone: string | null
          provinsi: string | null
          role: Database["public"]["Enums"]["user_role"]
          rt: number | null
          rw: number | null
          updated_at: string
          username: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          alamat_detail?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          kabupaten_kota?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          phone?: string | null
          provinsi?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rt?: number | null
          rw?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          alamat_detail?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kabupaten_kota?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          phone?: string | null
          provinsi?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rt?: number | null
          rw?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acknowledge_emergency_alert: {
        Args: { p_alert_id: string }
        Returns: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["emergency_status"]
          task_id: string
          triggered_by: string
        }
        SetofOptions: {
          from: "*"
          to: "emergency_alerts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_decide_helper_status: {
        Args: {
          p_helper_id: string
          p_reason: string
          p_status: Database["public"]["Enums"]["helper_status"]
        }
        Returns: {
          bio: string | null
          created_at: string
          domisili_lat: number | null
          domisili_lng: number | null
          foto_wajah_url: string | null
          id: string
          is_available: boolean
          koordinator_id: string | null
          ktp_url: string | null
          promoted_at: string | null
          promoted_by: string | null
          radius_layanan_km: number
          rating_avg: number
          saldo_tersedia: number
          status: Database["public"]["Enums"]["helper_status"]
          suspend_reason: string | null
          tingkat_kepercayaan: Database["public"]["Enums"]["trust_tier"]
          total_tugas_selesai: number
          tugas_selesai_berturut: number
          updated_at: string
          user_id: string
          verified_by_admin_fallback: boolean
          wilayah_domisili: string
        }
        SetofOptions: {
          from: "*"
          to: "helper_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_review_appeal: {
        Args: {
          appeal_id: string
          next_status: Database["public"]["Enums"]["appeal_status"]
          review_reason: string
        }
        Returns: {
          alasan: string
          created_at: string
          direview_at: string | null
          direview_oleh: string | null
          id: string
          review_reason: string | null
          status: Database["public"]["Enums"]["appeal_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "appeals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_account_status: {
        Args: {
          next_status: Database["public"]["Enums"]["account_status"]
          target_user_id: string
        }
        Returns: {
          account_status: Database["public"]["Enums"]["account_status"]
          alamat_detail: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kabupaten_kota: string | null
          kecamatan: string | null
          kelurahan: string | null
          phone: string | null
          provinsi: string | null
          role: Database["public"]["Enums"]["user_role"]
          rt: number | null
          rw: number | null
          updated_at: string
          username: string
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_topup_demo_wallet: {
        Args: {
          target_user_id: string
          topup_amount: number
          topup_reason: string
        }
        Returns: {
          alasan: string
          amount: number
          created_at: string
          created_by: string
          id: string
          saldo_setelah: number
          user_id: string
          wallet_id: string
        }
        SetofOptions: {
          from: "*"
          to: "demo_wallet_ledger"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_admin_fallback: {
        Args: { p_helper_id: string; p_reason: string }
        Returns: {
          bio: string | null
          created_at: string
          domisili_lat: number | null
          domisili_lng: number | null
          foto_wajah_url: string | null
          id: string
          is_available: boolean
          koordinator_id: string | null
          ktp_url: string | null
          promoted_at: string | null
          promoted_by: string | null
          radius_layanan_km: number
          rating_avg: number
          saldo_tersedia: number
          status: Database["public"]["Enums"]["helper_status"]
          suspend_reason: string | null
          tingkat_kepercayaan: Database["public"]["Enums"]["trust_tier"]
          total_tugas_selesai: number
          tugas_selesai_berturut: number
          updated_at: string
          user_id: string
          verified_by_admin_fallback: boolean
          wilayah_domisili: string
        }
        SetofOptions: {
          from: "*"
          to: "helper_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      auto_release_held_payments: { Args: never; Returns: number }
      cancel_task: {
        Args: { p_cancellation_reason: string; p_task_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_task_with_compensation: {
        Args: {
          p_cancellation_reason: string
          p_refund_payload: Json
          p_task_id: string
        }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      charge_task_with_demo_wallet: {
        Args: {
          p_task_id: string
          p_idempotency_key?: string | null
        }
        Returns: {
          payment_id: string
          status: Database["public"]["Enums"]["payment_status"]
          saldo_tersisa: number
        }[]
      }
      confirm_midtrans_refund: {
        Args: { p_gateway_ref: string; p_payload: Json; p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_task_cancel_compensation: {
        Args: { p_refund_payload: Json; p_task_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_task_completion: {
        Args: { p_task_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_emergency_alert: {
        Args: { p_task_id: string }
        Returns: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["emergency_status"]
          task_id: string
          triggered_by: string
        }
        SetofOptions: {
          from: "*"
          to: "emergency_alerts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_extra_service: {
        Args: { p_biaya: number; p_nama_layanan: string; p_task_id: string }
        Returns: {
          biaya: number
          created_at: string
          id: string
          nama_layanan: string
          status: Database["public"]["Enums"]["extra_service_status"]
          task_id: string
        }
        SetofOptions: {
          from: "*"
          to: "task_extra_services"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_midtrans_payment: {
        Args: {
          p_amount: number
          p_order_id: string
          p_snap_token: string
          p_task_id: string
        }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decide_extra_service: {
        Args: {
          p_decision: string
          p_extra_service_id: string
          p_task_id: string
        }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_pending_tasks: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_koordinator_or_admin: { Args: never; Returns: boolean }
      is_scoped_koordinator_for_user: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      is_task_participant: { Args: { p_task_id: string }; Returns: boolean }
      prepare_midtrans_payment_intent: {
        Args: { p_amount: number; p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      prepare_midtrans_refund: {
        Args: { p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      prepare_task_cancel_compensation: {
        Args: { p_cancellation_reason: string; p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refund_midtrans_payment: {
        Args: { p_gateway_ref: string; p_payload: Json; p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_task_payment: {
        Args: { p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reschedule_task: {
        Args: { p_jadwal_waktu: string; p_task_id: string }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      review_report: {
        Args: {
          p_decision_reason?: string
          p_helper_status?: Database["public"]["Enums"]["helper_status"]
          p_report_id: string
          p_status: Database["public"]["Enums"]["report_status"]
        }
        Returns: {
          alasan: string
          created_at: string
          decision_reason: string | null
          ditindak_oleh: string | null
          id: string
          reported_helper_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_midtrans_snap_token: {
        Args: { p_order_id: string; p_snap_token: string; p_task_id: string }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      settle_midtrans_payment: {
        Args: { p_gateway_ref: string; p_order_id: string; p_payload: Json }
        Returns: {
          amount: number
          created_at: string
          gateway_ref: string | null
          held_at: string | null
          helper_share: number
          id: string
          jumlah_total: number
          koordinator_share: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          task_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_task_evidence: {
        Args: {
          p_catatan_kondisi: string
          p_cerita_hari_ini: string
          p_client_submission_id: string
          p_energi: number
          p_foto_bukti_url: string
          p_kualitas_tidur: number
          p_mobilitas: number
          p_mood: number
          p_nafsu_makan: number
          p_task_id: string
        }
        Returns: {
          cancellation_reason: string | null
          cancelled_at: string | null
          catatan: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkin_time: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          harga_dasar: number
          harga_final: number
          helper_id: string | null
          id: string
          jadwal_waktu: string
          jadwal_waktu_asli: string | null
          keluarga_id: string
          lansia_id: string
          reschedule_count: number
          service_category_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_status: "active" | "restricted" | "suspended"
      appeal_status: "menunggu" | "disetujui" | "ditolak"
      emergency_status: "active" | "acknowledged" | "resolved"
      extra_service_status:
        | "menunggu_persetujuan_keluarga"
        | "disetujui"
        | "ditolak"
      helper_status:
        | "pending_verification"
        | "verified"
        | "under_review"
        | "rejected"
        | "suspended"
      koordinator_status:
        | "pending_verification"
        | "verified"
        | "rejected"
        | "suspended"
      koordinator_tingkat: "rt" | "rw"
      notification_type:
        | "task"
        | "payment"
        | "emergency"
        | "message"
        | "system"
        | "koordinator_info"
      payment_method: "midtrans" | "saldo_demo"
      payment_status:
        | "pending"
        | "held_escrow"
        | "released"
        | "refunded"
        | "disputed"
        | "dibatalkan_kompensasi"
        | "refunding"
      report_status: "menunggu" | "ditindak" | "selesai"
      task_assignment_mode: "langsung" | "pelamar" | "cepat"
      task_status:
        | "diajukan"
        | "menunggu_persetujuan_koordinator"
        | "dikonfirmasi"
        | "dikerjakan"
        | "menunggu_persetujuan_keluarga"
        | "selesai"
        | "dibatalkan"
      transaction_event:
        | "created"
        | "held"
        | "released"
        | "refunded"
        | "disputed"
      trust_tier: "probation" | "terpercaya"
      user_role: "keluarga" | "helper" | "koordinator" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["active", "restricted", "suspended"],
      appeal_status: ["menunggu", "disetujui", "ditolak"],
      emergency_status: ["active", "acknowledged", "resolved"],
      extra_service_status: [
        "menunggu_persetujuan_keluarga",
        "disetujui",
        "ditolak",
      ],
      helper_status: [
        "pending_verification",
        "verified",
        "under_review",
        "rejected",
        "suspended",
      ],
      koordinator_status: [
        "pending_verification",
        "verified",
        "rejected",
        "suspended",
      ],
      koordinator_tingkat: ["rt", "rw"],
      notification_type: [
        "task",
        "payment",
        "emergency",
        "message",
        "system",
        "koordinator_info",
      ],
      payment_method: ["midtrans", "saldo_demo"],
      payment_status: [
        "pending",
        "held_escrow",
        "released",
        "refunded",
        "disputed",
        "dibatalkan_kompensasi",
        "refunding",
      ],
      report_status: ["menunggu", "ditindak", "selesai"],
      task_status: [
        "diajukan",
        "menunggu_persetujuan_koordinator",
        "dikonfirmasi",
        "dikerjakan",
        "menunggu_persetujuan_keluarga",
        "selesai",
        "dibatalkan",
      ],
      transaction_event: [
        "created",
        "held",
        "released",
        "refunded",
        "disputed",
      ],
      trust_tier: ["probation", "terpercaya"],
      user_role: ["keluarga", "helper", "koordinator", "admin"],
    },
  },
} as const
