import { supabase } from './supabase';

export async function logAudit(action: string, table: string, id: string, details?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('audit_logs').insert({
    admin_id: session.user.id,
    action,
    target_table: table,
    target_id: id,
    details
  });
}
