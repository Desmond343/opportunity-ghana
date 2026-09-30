export type DeadlineUrgency = 'critical' | 'warning' | 'normal' | 'closed';

export interface DeadlineInfo {
  label: string;
  isClosed: boolean;
  daysRemaining: number;
  urgency: DeadlineUrgency;
  detailText: string;
}

/**
 * Calculates deadline proximity and automation state per requirements:
 * - Closing today
 * - 1 day left
 * - 3 days left
 * - 7 days left
 * - Closing this week
 * - Closing this month
 * - Closed
 */
export function calculateDeadlineInfo(deadlineIsoOrDate?: string): DeadlineInfo {
  if (!deadlineIsoOrDate) {
    return {
      label: 'Rolling Basis',
      isClosed: false,
      daysRemaining: 999,
      urgency: 'normal',
      detailText: 'Applications accepted on an ongoing rolling basis.'
    };
  }

  const deadline = new Date(deadlineIsoOrDate);
  if (isNaN(deadline.getTime())) {
    return {
      label: 'Open',
      isClosed: false,
      daysRemaining: 999,
      urgency: 'normal',
      detailText: 'Deadline date to be confirmed by provider.'
    };
  }

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  // Past deadline -> Automatically closed
  if (diffMs <= 0) {
    return {
      label: 'Closed',
      isClosed: true,
      daysRemaining: 0,
      urgency: 'closed',
      detailText: 'This opportunity has closed. Applications are no longer being accepted.'
    };
  }

  // Closing today
  if (diffHours <= 24 && diffHours > 0) {
    return {
      label: 'Closing Today',
      isClosed: false,
      daysRemaining: 0,
      urgency: 'critical',
      detailText: `Closes in ${diffHours} hour${diffHours === 1 ? '' : 's'}! Final call.`
    };
  }

  // 1 day left
  if (diffDays === 1) {
    return {
      label: '1 Day Left',
      isClosed: false,
      daysRemaining: 1,
      urgency: 'critical',
      detailText: 'Closes tomorrow. Submit your application immediately.'
    };
  }

  // 2 - 3 days left
  if (diffDays <= 3) {
    return {
      label: `${diffDays} Days Left`,
      isClosed: false,
      daysRemaining: diffDays,
      urgency: 'critical',
      detailText: `Only ${diffDays} days remaining before application portal shuts.`
    };
  }

  // 4 - 7 days left
  if (diffDays <= 7) {
    return {
      label: `${diffDays} Days Left`,
      isClosed: false,
      daysRemaining: diffDays,
      urgency: 'warning',
      detailText: 'Closing this week. Ensure your recommendation letters and transcripts are ready.'
    };
  }

  // Closing this month (within 30 days)
  if (diffDays <= 30) {
    return {
      label: `${diffDays} Days Left`,
      isClosed: false,
      daysRemaining: diffDays,
      urgency: 'normal',
      detailText: `Closing in ${diffDays} days (${deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}).`
    };
  }

  return {
    label: `${diffDays} Days Left`,
    isClosed: false,
    daysRemaining: diffDays,
    urgency: 'normal',
    detailText: `Deadline: ${deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
  };
}

/**
 * Checks if a given opportunity status should be resolved to 'closed'
 */
export function isOpportunityActuallyClosed(status: string, deadline?: string): boolean {
  if (status === 'closed' || status === 'archived') return true;
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return false;
  return deadlineDate.getTime() < Date.now();
}
