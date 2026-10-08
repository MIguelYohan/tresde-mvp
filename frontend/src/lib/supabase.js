import { createClient } from '@supabase/supabase-js';

export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
// Vite variables are public. Reject privileged keys even if misconfigured.
function privileged(value) {
  if (value?.startsWith('sb_secret_')) return true;
  try { return JSON.parse(atob(value.split('.')[1])).role === 'service_role'; } catch { return false; }
}
if (privileged(key)) throw new Error('Use apenas a chave publishable/anon do Supabase no frontend.');
export const supabase = !demoMode && url && key ? createClient(url, key) : null;
