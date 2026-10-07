import { AuditLogEntry } from '../types/database';

const AUDIT_STORAGE_KEY = 'opp_gh_audit_logs';

export const AuditService = {
  getLogs(entityId?: string): AuditLogEntry[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Purge demo logs
          const cleaned = parsed.filter(l => 
            l && 
            l.id && 
            !l.entityId?.startsWith('opp-demo-') && 
            !l.entityId?.startsWith('res-demo-') &&
            !l.performedByEmail?.includes('example.com')
          );
          if (entityId) {
            return cleaned.filter(l => l.entityId === entityId);
          }
          return cleaned;
        }
      }
    } catch (e) {
      console.error('AuditService getLogs error:', e);
    }
    return [];
  },

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      const newEntry: AuditLogEntry = {
        ...entry,
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString()
      };
      const existing = this.getLogs();
      existing.unshift(newEntry);
      // Keep most recent 200 logs
      const trimmed = existing.slice(0, 200);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to append audit log', e);
    }
  },

  record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    this.log(entry);
  }
};
