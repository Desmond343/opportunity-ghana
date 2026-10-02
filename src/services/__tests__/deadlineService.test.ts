import { 
  calculateDeadlineInfo, 
  getDeadlineStatus,
  parseDeadlineDate,
  isOpportunityActuallyClosed,
  DEADLINE_THRESHOLDS 
} from '../deadlineService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- RUNNING DEADLINE SERVICE TEST SUITE ---');

// Mock reference time: October 2, 2026, 13:35:00 UTC (Ghana local time)
const mockNow = new Date('2026-10-02T13:35:00Z');

// TEST 1: Future deadline (Nov 15, 2026 -> exactly 44 days left)
{
  const info = calculateDeadlineInfo('2026-11-15', { now: mockNow });
  assert(info.daysLeft === 44, `Nov 15 from Oct 2 should have 44 days left (got ${info.daysLeft})`);
  assert(info.label === '44 days left', `Label should be "44 days left" (got "${info.label}")`);
  assert(info.status === 'open', `Status should be "open" for 44 days (got "${info.status}")`);
  assert(!info.isClosed, 'Should not be closed');
  assert(info.formattedDate === '15 Nov 2026', `Formatted date should be "15 Nov 2026" (got "${info.formattedDate}")`);
}

// TEST 2: 1 day remaining (Oct 3, 2026 -> singular "1 day left")
{
  const info = calculateDeadlineInfo('2026-10-03', { now: mockNow });
  assert(info.daysLeft === 1, `Oct 3 from Oct 2 should be 1 day left (got ${info.daysLeft})`);
  assert(info.label === '1 day left', `Grammar must be singular "1 day left" (got "${info.label}")`);
  assert(info.status === 'closing_soon', `Status should be "closing_soon" (got "${info.status}")`);
  assert(info.urgency === 'critical', `Urgency should be critical (got "${info.urgency}")`);
  assert(!info.isClosed, 'Should not be closed');
}

// TEST 3: Deadline today (Oct 2, 2026 at end of day 23:59:59 GMT -> "Closes today")
{
  const info = calculateDeadlineInfo('2026-10-02', { now: mockNow });
  assert(info.daysLeft === 0, `Same calendar day should have daysLeft 0 (got ${info.daysLeft})`);
  assert(info.label === 'Closes today', `Label should be "Closes today" (got "${info.label}")`);
  assert(info.status === 'today', `Status should be "today" (got "${info.status}")`);
  assert(info.isToday === true, 'isToday must be true');
  assert(!info.isClosed, 'Should not be closed if time remains today');
  assert(info.hoursRemaining === 11, `Should report ~11 hours remaining (got ${info.hoursRemaining})`);
}

// TEST 4: Expired deadline (Oct 1, 2026 -> "Deadline passed", never "0 days left")
{
  const info = calculateDeadlineInfo('2026-10-01', { now: mockNow });
  assert(info.isClosed === true, 'Yesterday deadline must be closed');
  assert(info.status === 'expired', `Status must be expired (got "${info.status}")`);
  assert(info.label === 'Deadline passed', `Label must be "Deadline passed", not "0 days left" (got "${info.label}")`);
  assert(info.urgency === 'closed', 'Urgency must be closed');
}

// TEST 5: Expired earlier today (e.g. 12:00 GMT on Oct 2, when now is 13:35 GMT)
{
  const info = calculateDeadlineInfo('2026-10-02T12:00:00Z', { now: mockNow });
  assert(info.isClosed === true, 'Earlier today deadline must be closed');
  assert(info.label === 'Deadline passed', `Label must be "Deadline passed" (got "${info.label}")`);
  assert(info.status === 'expired', 'Status must be expired');
}

// TEST 6: Closing soon threshold (7 days left vs 8 days left)
{
  const info7Days = calculateDeadlineInfo('2026-10-09', { now: mockNow });
  assert(info7Days.daysLeft === 7, `Oct 9 should be 7 days (got ${info7Days.daysLeft})`);
  assert(info7Days.status === 'closing_soon', '7 days should be closing_soon');
  assert(info7Days.isClosingSoon === true, 'isClosingSoon should be true');

  const info8Days = calculateDeadlineInfo('2026-10-10', { now: mockNow });
  assert(info8Days.daysLeft === 8, `Oct 10 should be 8 days (got ${info8Days.daysLeft})`);
  assert(info8Days.status === 'approaching', '8 days should be approaching');
  assert(info8Days.isClosingSoon === false, '8 days isClosingSoon should be false');
}

// TEST 7: Midnight boundary automatic decrement (Oct 2 23:59:00 -> Oct 3 00:01:00)
{
  const deadline = '2026-11-15';
  const beforeMidnight = new Date('2026-10-02T23:59:00Z');
  const afterMidnight = new Date('2026-10-03T00:01:00Z');

  const infoBefore = calculateDeadlineInfo(deadline, { now: beforeMidnight });
  const infoAfter = calculateDeadlineInfo(deadline, { now: afterMidnight });

  assert(infoBefore.daysLeft === 44, `Before midnight should be 44 days (got ${infoBefore.daysLeft})`);
  assert(infoAfter.daysLeft === 43, `After midnight should be 43 days (got ${infoAfter.daysLeft})`);
  assert(infoAfter.label === '43 days left', `Label should automatically update to "43 days left"`);
}

// TEST 8: Timezone and specific hours preservation
{
  // Chevening closes at 11:00:00Z on Oct 6, 2026
  const cheveningDeadline = '2026-10-06T11:00:00Z';
  const info = calculateDeadlineInfo(cheveningDeadline, { now: mockNow });
  assert(info.daysLeft === 4, `Chevening should be 4 days left from Oct 2 (got ${info.daysLeft})`);
  assert(info.formattedDeadline.includes('11:00 GMT'), `Formatted deadline should preserve 11:00 GMT (got "${info.formattedDeadline}")`);
}

// TEST 9: Rolling basis and missing deadlines
{
  const infoRolling = calculateDeadlineInfo('Rolling Basis', { now: mockNow });
  assert(infoRolling.status === 'rolling', 'Status should be rolling');
  assert(infoRolling.label === 'Rolling Basis', 'Label should be Rolling Basis');
  assert(!infoRolling.isClosed, 'Rolling should not be closed');

  const infoUndefined = calculateDeadlineInfo(undefined, { now: mockNow });
  assert(infoUndefined.status === 'rolling', 'Undefined deadline should fallback to rolling');
  assert(infoUndefined.label === 'Rolling Basis', 'Label should be Rolling Basis');
}

// TEST 10: isOpportunityActuallyClosed helper
{
  assert(isOpportunityActuallyClosed('published', '2026-10-01'), 'Past deadline should be closed');
  assert(!isOpportunityActuallyClosed('published', '2026-11-15'), 'Future deadline should NOT be closed');
  assert(isOpportunityActuallyClosed('closed', '2026-11-15'), 'Status closed must return true');
  assert(!isOpportunityActuallyClosed('published', undefined), 'Undefined deadline should not be closed');
}

console.log('--- ALL 10 TESTS PASSED SUCCESSFULLY! ---');
