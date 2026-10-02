import { useState, useEffect } from 'react';

export type DeadlineStatus =
  | 'open'           // > 30 days remaining
  | 'approaching'    // 8–30 days remaining
  | 'closing_soon'   // 1–7 days remaining
  | 'today'          // Deadline is today, time still remaining
  | 'expired'        // Deadline has passed
  | 'rolling'        // Rolling basis / ongoing
  | 'invalid';       // Invalid / unparseable date format

export type DeadlineUrgency = 'critical' | 'warning' | 'normal' | 'closed';

/**
 * Reusable thresholds for deadline proximity per requirements:
 * 30+ days → Normal ('open')
 * 8–30 days → Approaching deadline ('approaching')
 * 1–7 days → Closing soon ('closing_soon')
 * Today → Deadline today ('today')
 * Past deadline → Expired ('expired')
 */
export const DEADLINE_THRESHOLDS = {
  CLOSING_SOON_DAYS: 7,
  APPROACHING_DAYS: 30,
} as const;

export interface DeadlineOptions {
  now?: Date;
  timezone?: string; // Default GMT / UTC for Ghana
}

export interface DeadlineInfo {
  // Primary calculated values
  daysLeft: number;             // Calendar days left (0 for today, <0 if expired, 999 for rolling)
  daysRemaining: number;        // Backwards compatibility alias for daysLeft
  diffMs: number;               // Milliseconds until deadline (<0 if expired)
  status: DeadlineStatus;       // 'open' | 'approaching' | 'closing_soon' | 'today' | 'expired' | 'rolling' | 'invalid'
  urgency: DeadlineUrgency;     // 'critical' | 'warning' | 'normal' | 'closed'
  label: string;                // e.g. "44 days left", "1 day left", "Closes today", "Deadline passed"
  isClosed: boolean;            // true if expired or past deadline
  isClosingSoon: boolean;       // true if closing in <= 7 days or today
  isToday: boolean;             // true if closing today
  detailText: string;           // Descriptive tooltip / sentence
  formattedDate: string;        // Clean formatted date e.g. "15 Nov 2026"
  formattedDeadline: string;    // Full formatted deadline e.g. "15 Nov 2026, 23:59 GMT"
  hoursRemaining?: number;      // Exact hours remaining if closing today
  targetDate: Date | null;      // Authoritative parsed Date object
}

/**
 * Parses any incoming deadline string into an authoritative Date object.
 * 
 * Rules:
 * 1. Date-only format (YYYY-MM-DD): By standard Opportunity Ghana convention,
 *    an application closes at end-of-day (23:59:59.999Z GMT) so applicants
 *    have the full day to apply and it does not prematurely expire at midnight.
 * 2. ISO timestamps (with explicit time & timezone like "2026-10-06T11:00:00Z"):
 *    Interpreted at that exact UTC/GMT instant.
 * 3. Text like "Rolling", "Open-ended", "Until filled": Interpreted as rolling.
 */
export function parseDeadlineDate(raw?: string): Date | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Check for textual open-ended keywords
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('roll') ||
    lower.includes('ongoing') ||
    lower.includes('open') ||
    lower.includes('filled') ||
    lower.includes('not specified')
  ) {
    return null;
  }

  // Check for date-only pattern YYYY-MM-DD
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10);
    const month = parseInt(dateOnlyMatch[2], 10) - 1;
    const day = parseInt(dateOnlyMatch[3], 10);
    // End of day in GMT / UTC (23:59:59.999Z)
    return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  }

  // Parse ISO or standard date string
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Formats a Date object cleanly for display (en-GB format: "15 Nov 2026" or "15 Nov 2026, 11:00 GMT")
 */
export function formatDeadlineDate(date: Date | null, includeTime: boolean = false): string {
  if (!date || isNaN(date.getTime())) return 'Rolling / Unspecified';

  const day = date.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const isEndOfDay = hours === 23 && minutes >= 55;
  const isStartOfDay = hours === 0 && minutes === 0;

  if (!includeTime || isEndOfDay || isStartOfDay) {
    return `${day} ${month} ${year}`;
  }

  const paddedMin = minutes.toString().padStart(2, '0');
  const paddedHr = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${paddedHr}:${paddedMin} GMT`;
}

/**
 * Calculates deadline countdown and automation state from the authoritative deadline.
 * 
 * Never uses a static database "daysLeft" field; derived dynamically from `deadline` vs `now`.
 */
export function calculateDeadlineInfo(
  deadlineIsoOrDate?: string,
  options?: DeadlineOptions
): DeadlineInfo {
  const now = options?.now || new Date();

  // Missing or non-string deadline -> Rolling basis
  if (!deadlineIsoOrDate || typeof deadlineIsoOrDate !== 'string') {
    return {
      daysLeft: 999,
      daysRemaining: 999,
      diffMs: Infinity,
      status: 'rolling',
      urgency: 'normal',
      label: 'Rolling Basis',
      isClosed: false,
      isClosingSoon: false,
      isToday: false,
      detailText: 'Applications accepted on an ongoing rolling basis with no fixed closing date.',
      formattedDate: 'Rolling Basis',
      formattedDeadline: 'Applications reviewed on an ongoing rolling basis',
      targetDate: null
    };
  }

  const trimmed = deadlineIsoOrDate.trim();
  const targetDate = parseDeadlineDate(trimmed);

  // If text was explicitly rolling or unparseable text
  if (!targetDate) {
    const isTextRolling = /roll|ongoing|open|filled|tbd|none/i.test(trimmed);
    return {
      daysLeft: isTextRolling ? 999 : 0,
      daysRemaining: isTextRolling ? 999 : 0,
      diffMs: isTextRolling ? Infinity : 0,
      status: isTextRolling ? 'rolling' : 'invalid',
      urgency: 'normal',
      label: isTextRolling ? 'Rolling Basis' : 'Date Unconfirmed',
      isClosed: false,
      isClosingSoon: false,
      isToday: false,
      detailText: isTextRolling
        ? 'Applications accepted on an ongoing rolling basis.'
        : 'Official deadline date to be confirmed by provider.',
      formattedDate: isTextRolling ? 'Rolling' : trimmed,
      formattedDeadline: isTextRolling ? 'Rolling Basis' : `Notice: ${trimmed}`,
      targetDate: null
    };
  }

  // Calculate millisecond difference
  const diffMs = targetDate.getTime() - now.getTime();
  const formattedDate = formatDeadlineDate(targetDate, false);
  const formattedDeadline = formatDeadlineDate(targetDate, true);

  // Calculate calendar days in UTC / GMT
  // Ghana is GMT (UTC+0) year-round. Comparing start of today in UTC to start of deadline in UTC
  // gives exact calendar days remaining.
  const startOfTodayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startOfDeadlineUTC = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
  const calendarDaysDiff = Math.round((startOfDeadlineUTC - startOfTodayUTC) / (1000 * 60 * 60 * 24));

  // 1. EXPIRED / CLOSED: diffMs <= 0 or calendarDaysDiff < 0
  if (diffMs <= 0) {
    return {
      daysLeft: Math.min(0, calendarDaysDiff),
      daysRemaining: 0,
      diffMs,
      status: 'expired',
      urgency: 'closed',
      label: 'Deadline passed',
      isClosed: true,
      isClosingSoon: false,
      isToday: false,
      detailText: `Deadline was ${formattedDate}. Applications are now closed.`,
      formattedDate,
      formattedDeadline,
      targetDate
    };
  }

  // 2. DEADLINE TODAY: diffMs > 0 but calendarDaysDiff === 0
  if (calendarDaysDiff === 0) {
    const hoursRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return {
      daysLeft: 0,
      daysRemaining: 0,
      diffMs,
      status: 'today',
      urgency: 'critical',
      label: 'Closes today',
      isClosed: false,
      isClosingSoon: true,
      isToday: true,
      hoursRemaining,
      detailText: `Closes in ${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'}! Final call before portal shuts.`,
      formattedDate,
      formattedDeadline,
      targetDate
    };
  }

  // 3. ONE DAY REMAINING: calendarDaysDiff === 1 (Singular grammar "1 day left")
  if (calendarDaysDiff === 1) {
    return {
      daysLeft: 1,
      daysRemaining: 1,
      diffMs,
      status: 'closing_soon',
      urgency: 'critical',
      label: '1 day left',
      isClosed: false,
      isClosingSoon: true,
      isToday: false,
      detailText: `Closes tomorrow (${formattedDeadline}). Submit your application immediately.`,
      formattedDate,
      formattedDeadline,
      targetDate
    };
  }

  // 4. CLOSING SOON: 2 to 7 days left (Plural grammar, e.g. "2 days left", "7 days left")
  if (calendarDaysDiff <= DEADLINE_THRESHOLDS.CLOSING_SOON_DAYS) {
    const isCritical = calendarDaysDiff <= 3;
    return {
      daysLeft: calendarDaysDiff,
      daysRemaining: calendarDaysDiff,
      diffMs,
      status: 'closing_soon',
      urgency: isCritical ? 'critical' : 'warning',
      label: `${calendarDaysDiff} days left`,
      isClosed: false,
      isClosingSoon: true,
      isToday: false,
      detailText: `Closing in ${calendarDaysDiff} days on ${formattedDate}. Finalize required documents now.`,
      formattedDate,
      formattedDeadline,
      targetDate
    };
  }

  // 5. APPROACHING: 8 to 30 days left
  if (calendarDaysDiff <= DEADLINE_THRESHOLDS.APPROACHING_DAYS) {
    return {
      daysLeft: calendarDaysDiff,
      daysRemaining: calendarDaysDiff,
      diffMs,
      status: 'approaching',
      urgency: 'normal',
      label: `${calendarDaysDiff} days left`,
      isClosed: false,
      isClosingSoon: false,
      isToday: false,
      detailText: `Application deadline: ${formattedDate} (${calendarDaysDiff} days remaining).`,
      formattedDate,
      formattedDeadline,
      targetDate
    };
  }

  // 6. NORMAL / OPEN: 31+ days left
  return {
    daysLeft: calendarDaysDiff,
    daysRemaining: calendarDaysDiff,
    diffMs,
    status: 'open',
    urgency: 'normal',
    label: `${calendarDaysDiff} days left`,
    isClosed: false,
    isClosingSoon: false,
    isToday: false,
    detailText: `Application deadline: ${formattedDeadline}.`,
    formattedDate,
    formattedDeadline,
    targetDate
  };
}

/**
 * Alias for calculateDeadlineInfo to meet prompt specification
 */
export const getDeadlineStatus = calculateDeadlineInfo;

/**
 * Checks if a given opportunity status should be resolved to 'closed'
 */
export function isOpportunityActuallyClosed(status: string, deadline?: string): boolean {
  if (status === 'closed' || status === 'archived') return true;
  if (!deadline) return false;
  const info = calculateDeadlineInfo(deadline);
  return info.isClosed;
}

// ============================================================================
// REAL-TIME CLIENT-SIDE COUNTDOWN HOOK & GLOBAL TIMER
// ============================================================================

type TimerListener = (now: Date) => void;
const timerListeners = new Set<TimerListener>();
let globalIntervalId: ReturnType<typeof setInterval> | null = null;
let visibilityHandlerAdded = false;

function ensureGlobalTimer() {
  if (typeof window === 'undefined') return;

  if (!globalIntervalId) {
    // Check every 30 seconds to catch minute & midnight boundaries smoothly
    // without heavy second-by-second CPU cycles
    globalIntervalId = setInterval(() => {
      const current = new Date();
      timerListeners.forEach(listener => listener(current));
    }, 30000);
  }

  if (!visibilityHandlerAdded && typeof document !== 'undefined') {
    visibilityHandlerAdded = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const current = new Date();
        timerListeners.forEach(listener => listener(current));
      }
    });
  }
}

/**
 * Lightweight React hook providing a synchronized current Date that updates
 * every 30 seconds and whenever the browser tab regains focus.
 */
export function useCurrentTime(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    ensureGlobalTimer();
    const listener: TimerListener = (updatedNow) => {
      setNow(updatedNow);
    };
    timerListeners.add(listener);

    return () => {
      timerListeners.delete(listener);
    };
  }, []);

  return now;
}

/**
 * Dynamic React hook that recalculates daysLeft and deadline status
 * automatically as time advances, ensuring countdowns change across midnight
 * without requiring page reload or manual administrator edits.
 */
export function useDeadlineInfo(
  deadlineIsoOrDate?: string,
  options?: Omit<DeadlineOptions, 'now'>
): DeadlineInfo {
  const now = useCurrentTime();
  return calculateDeadlineInfo(deadlineIsoOrDate, { ...options, now });
}
