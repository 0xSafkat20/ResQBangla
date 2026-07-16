import { supabase } from './supabase';
import { useAuth } from './auth';

export function useAuditLog() {
  const { user } = useAuth();
  const log = async (
    action: string, entityType: string, entityId: string | null,
    entityName: string | null, result: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS',
    reason: string | null = null, metadata: Record<string, unknown> = {},
  ) => {
    try {
      await supabase.from('audit_logs').insert({
        actor_id: user?.id || null, actor_email: user?.email || null,
        actor_type: 'USER', action, entity_type: entityType, entity_id: entityId,
        entity_name: entityName, result, reason, metadata,
      });
    } catch { /* silent */ }
  };
  return { log };
}
