import { createClient } from '@supabase/supabase-js';

const supabase = createClient('http://127.0.0.1:54321', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJh...');
// Since anon key can't bypass RLS easily in a node script without a user, maybe I should just use the REST API locally or read the JSON directly from the DB via curl.
