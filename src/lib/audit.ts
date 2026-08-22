import { createClient } from '@/lib/supabase/server';
import { Json } from '@/types/database';

type AuditAction =
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
  // Fire and forget — audit log gagal tidak boleh block response utama
  await supabase.from('audit_logs').insert({
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata: metadata ?? null,
  });
}

