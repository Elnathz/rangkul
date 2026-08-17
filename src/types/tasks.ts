import { Database } from './database';

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type LansiaRow = Database['public']['Tables']['lansia_profiles']['Row'];
export type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row'];
export type HelperProfileRow = Database['public']['Tables']['helper_profiles']['Row'];
export type UserRow = Database['public']['Tables']['users']['Row'];

export interface TaskWithRelations extends TaskRow {
  lansia: Pick<LansiaRow, 'id' | 'nama' | 'alamat' | 'lat' | 'lng' | 'catatan_kondisi' | 'foto_url'>;
  service_category: Pick<ServiceCategoryRow, 'id' | 'nama' | 'deskripsi' | 'estimasi_durasi_menit' | 'harga_dasar' | 'is_high_risk'>;
  helper?: {
    id: string;
    rating_avg: number;
    total_tugas_selesai: number;
    user: {
      full_name: string;
      phone: string;
    };
  } | null;
}
