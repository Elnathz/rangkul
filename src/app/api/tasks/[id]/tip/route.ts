import { createApiError } from '@/lib/api-response';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return createApiError('not_found', 'Fitur tip belum tersedia', 404);
}
