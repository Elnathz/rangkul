import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function removePrivateObjectsForUser(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const objectPaths: string[] = [];

  async function collect(prefix: string): Promise<void> {
    const { data, error } = await client.storage.from('dokumen').list(prefix, { limit: 100 });
    if (error || !data) return;

    for (const item of data) {
      const path = `${prefix}/${item.name}`;
      if (item.id === null) await collect(path);
      else objectPaths.push(path);
    }
  }

  await collect(userId);
  if (objectPaths.length > 0) {
    await client.storage.from('dokumen').remove(objectPaths);
  }
}
