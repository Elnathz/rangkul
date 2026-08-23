import { createClient } from '@/lib/supabase/server';
import { Json } from '@/types/database';

type AuditAction =
  | 'admin_account_status_changed'
  | 'admin_user_created'
  | 'admin_user_updated'
  | 'admin_user_deleted'
  | 'admin_helper_status_changed'
  | 'admin_helper_fallback_assigned'
  | 'admin_service_category_created'
  | 'admin_service_category_updated'
  | 'admin_service_category_deleted'
  | 'helper_approved'
  | 'helper_rejected'
  | 'helper_admin_fallback_approved'
  | 'koordinator_approved'
  | 'koordinator_rejected';

export async function writeAuditLog({
  actor_id,
  action,
  entity_type,
  entity_id,
  metadata,
}: {
  actor_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  metadata?: Json;
}) {
  const supabase = await createClient();
  // Audit log gagal tidak boleh memblokir response utama.
  await supabase.from('audit_logs').insert({
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata: metadata ?? null,
  });
}

