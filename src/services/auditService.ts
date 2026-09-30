import { AuditLogEntry } from '../types/database';

const AUDIT_STORAGE_KEY = 'opp_gh_audit_logs';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    entityType: 'opportunity',
    entityId: 'opp-demo-01',
    entityTitle: 'Software Engineering Graduate Trainee Programme',
    action: 'published',
    performedByEmail: 'editorial@opportunityghana.com',
    performedByName: 'Kwadwo Asare (Chief Editor)',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    details: 'Verified employer registration with Registrar Generals Department and published to live catalog.',
    changesSummary: 'Status changed from verified to published',
    previousStatus: 'verified',
    newStatus: 'published'
  },
  {
    id: 'log-02',
    entityType: 'opportunity',
    entityId: 'opp-demo-02',
    entityTitle: 'Mastercard Foundation Scholars Program at KNUST',
    action: 'verified',
    performedByEmail: 'editorial@opportunityghana.com',
    performedByName: 'Ama Mensah (Verification Lead)',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    details: 'Cross-checked against KNUST official portal guidelines and verified deadline authenticity.',
    changesSummary: 'Verification marked as verified; notes added',
    previousStatus: 'needs_verification',
    newStatus: 'verified'
  },
  {
    id: 'log-03',
    entityType: 'resource',
    entityId: 'res-demo-01',
    entityTitle: 'Google Data Analytics Professional Certificate',
    action: 'created',
    performedByEmail: 'admin@opportunityghana.com',
    performedByName: 'Opportunity Ghana CMS',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    details: 'Initial resource ingestion with Coursera Financial Aid instructions.',
    changesSummary: 'Created as draft and updated with free certificate path',
    previousStatus: 'draft',
    newStatus: 'published'
  }
];

export const AuditService = {
  getLogs(entityId?: string): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      let logs: AuditLogEntry[] = raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
      if (!raw) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      }
      if (entityId) {
        return logs.filter(l => l.entityId === entityId);
      }
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };

    try {
      const logs = this.getLogs();
      logs.unshift(fullEntry);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
    } catch (e) {
      console.warn('Failed to save audit log entry', e);
    }

    return fullEntry;
  }
};
