import { createClient } from '@supabase/supabase-js';
import config from './index';

if (!config.supabase.url || !config.supabase.serviceKey) {
  throw new Error('Supabase URL and Service Key must be provided');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
