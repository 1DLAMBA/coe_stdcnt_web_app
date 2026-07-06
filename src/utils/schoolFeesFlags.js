/**
 * Shared helpers for primary + backup personal-details fee flags (clearance flows).
 */

export const LAST_FEE_SESSION = "2024/2025";
export const CURRENT_FEE_SESSION = "2025/2026";
export const FEE_ACADEMIC_SESSIONS = [LAST_FEE_SESSION, CURRENT_FEE_SESSION];

export function isPaidFlag(value) {
  if (value === false || value === 0 || value === "0" || value === "false") {
    return false;
  }
  return value === true || value === 1 || value === "1" || value === "true";
}

/**
 * @returns {{ label: string|null, paid: boolean }}
 */
export function getSchoolFeeDisplayAmount(has_paid, course_paid) {
  if (isPaidFlag(has_paid) && isPaidFlag(course_paid)) {
    return { label: "40,000.00", paid: true };
  }
  if (isPaidFlag(has_paid) && !isPaidFlag(course_paid)) {
    return { label: "24,000.00", paid: true };
  }
  return { label: null, paid: false };
}

export function backupHasRecord(backup) {
  return (
    backup != null &&
    typeof backup === "object" &&
    (backup.id != null || backup.application_number != null)
  );
}

export function hasFeeActivity(record) {
  if (!record) return false;
  return isPaidFlag(record.has_paid) || isPaidFlag(record.course_paid);
}

/** Full school fees paid (both flags). */
export function isFullyPaid(record) {
  return isPaidFlag(record?.has_paid) && isPaidFlag(record?.course_paid);
}

export function isNewIntakeByMatric(matricNumber) {
  return typeof matricNumber === "string" && matricNumber.includes("/26/");
}

/**
 * Clearance (graduands): one session must be fully paid — either last session
 * (2024/2025, backup DB) or the current session (2025/2026, primary DB).
 * Mirrors SchoolFeesGateService::hasPaidLastOrCurrentSession on the backend.
 */
export function canRequestClearance(primary, backup, isNewByMatric) {
  return (backupHasRecord(backup) && isFullyPaid(backup)) || isFullyPaid(primary);
}

/** Exam card: all required sessions paid (same gate as Course Registration unlock). */
export function canDownloadExamCard(primary, backup, isNewByMatric) {
  return computeCourseRegFeeState(primary, backup, isNewByMatric).allRequiredPaid;
}

/**
 * @returns {string|null} User-facing message when clearance is blocked.
 */
export function getClearanceBlockReason(primary, backup, isNewByMatric) {
  if (canRequestClearance(primary, backup, isNewByMatric)) {
    return null;
  }
  return `Fully pay school fees for either ${LAST_FEE_SESSION} (previous system) or ${CURRENT_FEE_SESSION} before requesting clearance.`;
}

/**
 * @returns {string|null} User-facing message when exam card download is blocked.
 */
export function getExamCardBlockReason(primary, backup, isNewByMatric) {
  if (canDownloadExamCard(primary, backup, isNewByMatric)) {
    return null;
  }
  const state = computeCourseRegFeeState(primary, backup, isNewByMatric);
  if (state.needsLastSessionPayment) {
    return `Complete ${LAST_FEE_SESSION} school fees in the previous system before downloading your exam card.`;
  }
  if (state.partial40Active && state.partial40Session) {
    return `Complete the outstanding 40% balance for ${state.partial40Session} on Course Registration before downloading your exam card.`;
  }
  if (state.needsCurrentSessionPayment) {
    return `Complete ${CURRENT_FEE_SESSION} school fees on Course Registration before downloading your exam card.`;
  }
  return "Complete all required school fees on Course Registration before downloading your exam card.";
}

/**
 * Course registration fee gates (primary + optional backup old-session DB).
 * @param {object|null|undefined} primary
 * @param {object|null|undefined} backup
 * @param {boolean} isNewByMatric
 */
export function computeCourseRegFeeState(primary, backup, isNewByMatric) {
  const hasBackup = backupHasRecord(backup) && !isNewByMatric;
  const primaryFullyPaid = isFullyPaid(primary);
  const primaryPartial =
    isPaidFlag(primary?.has_paid) && !isPaidFlag(primary?.course_paid);
  const primaryFee = primary?.fee_academic_session;

  let lastSessionPaid = false;
  let backupLastSessionPartial = false;

  if (isNewByMatric) {
    const currentSessionPaid = primaryFullyPaid;
    const partial40Active = primaryPartial;
    const needsCurrentSessionPayment = !currentSessionPaid;
    const allRequiredPaid = currentSessionPaid && !partial40Active;
    return {
      lastSessionPaid: true,
      currentSessionPaid,
      backupLastSessionPartial: false,
      needsLastSessionPayment: false,
      needsCurrentSessionPayment,
      branchBPActive: false,
      partial40Active,
      partial40Session: partial40Active ? CURRENT_FEE_SESSION : null,
      feesCardLockedTo: partial40Active
        ? null
        : needsCurrentSessionPayment
          ? CURRENT_FEE_SESSION
          : null,
      showCourseReg: allRequiredPaid,
      firstUnpaidSession: needsCurrentSessionPayment ? CURRENT_FEE_SESSION : "",
      allRequiredPaid,
    };
  }

  if (hasBackup) {
    lastSessionPaid = isFullyPaid(backup);
    backupLastSessionPartial =
      isPaidFlag(backup?.has_paid) && !isPaidFlag(backup?.course_paid);
  } else {
    lastSessionPaid =
      primaryFullyPaid && primaryFee === LAST_FEE_SESSION;
  }

  const currentSessionPaid = hasBackup
    ? lastSessionPaid && primaryFullyPaid
    : primaryFullyPaid;

  const branchBPActive = hasBackup && backupLastSessionPartial && !lastSessionPaid;

  const primaryLastPartial =
    primaryPartial && primaryFee === LAST_FEE_SESSION;

  const needsLastSessionPayment = hasBackup && !lastSessionPaid;

  // Last session cleared: primary has_paid=1 & course_paid=0 → 40% completion (not full/60%).
  const currentSessionNeeds40 =
    primaryPartial &&
    !branchBPActive &&
    !needsLastSessionPayment &&
    ((hasBackup && lastSessionPaid) ||
      (!hasBackup && primaryFee !== LAST_FEE_SESSION));

  const partial40Active =
    branchBPActive ||
    (!hasBackup && primaryLastPartial) ||
    currentSessionNeeds40;

  const partial40Session = branchBPActive
    ? LAST_FEE_SESSION
    : currentSessionNeeds40
      ? CURRENT_FEE_SESSION
      : !hasBackup && primaryLastPartial
        ? LAST_FEE_SESSION
        : null;

  const needsCurrentSessionPayment = !currentSessionPaid;

  const allRequiredPaid =
    !needsLastSessionPayment && currentSessionPaid && !partial40Active;

  let feesCardLockedTo = null;
  if (!partial40Active && !branchBPActive && !allRequiredPaid) {
    if (needsLastSessionPayment) {
      feesCardLockedTo = LAST_FEE_SESSION;
    } else if (needsCurrentSessionPayment) {
      feesCardLockedTo = CURRENT_FEE_SESSION;
    }
  }

  const firstUnpaidSession = needsLastSessionPayment
    ? LAST_FEE_SESSION
    : needsCurrentSessionPayment
      ? CURRENT_FEE_SESSION
      : "";

  return {
    lastSessionPaid,
    currentSessionPaid,
    backupLastSessionPartial,
    needsLastSessionPayment,
    needsCurrentSessionPayment,
    branchBPActive,
    partial40Active,
    partial40Session,
    feesCardLockedTo,
    showCourseReg: allRequiredPaid,
    firstUnpaidSession,
    allRequiredPaid,
    hasBackup,
  };
}

/** 60% partial Paystack option — current session only. */
export function allowPartial60ForSession(session) {
  return session === CURRENT_FEE_SESSION;
}

/**
 * Resolve payment record for a session receipt (2024/2025 prefers backup + legacy primary fallback).
 */
export function resolveReceiptPaymentRecord(session, primary, backup, isNewByMatric) {
  if (session === CURRENT_FEE_SESSION) {
    return hasFeeActivity(primary) ? primary : null;
  }
  if (session === LAST_FEE_SESSION && !isNewByMatric) {
    if (backupHasRecord(backup) && hasFeeActivity(backup)) {
      return backup;
    }
    if (
      primary?.fee_academic_session === LAST_FEE_SESSION &&
      hasFeeActivity(primary)
    ) {
      return primary;
    }
  }
  return null;
}

/**
 * @returns {string[]} Sessions that have receipt data available
 */
export function getAvailableReceiptSessions(primary, backup, isNewByMatric) {
  const sessions = [];
  if (!isNewByMatric && resolveReceiptPaymentRecord(LAST_FEE_SESSION, primary, backup, isNewByMatric)) {
    sessions.push(LAST_FEE_SESSION);
  }
  if (resolveReceiptPaymentRecord(CURRENT_FEE_SESSION, primary, backup, isNewByMatric)) {
    sessions.push(CURRENT_FEE_SESSION);
  }
  return sessions;
}

/** Whether the student can open the school fees receipt page (primary or backup). */
export function canViewSchoolFeesReceipt(primary, backup, isNewByMatric) {
  return getAvailableReceiptSessions(primary, backup, isNewByMatric).length > 0;
}

/**
 * @param {object|null|undefined} primary - personal detail from primary API
 * @param {object|null|undefined} backup - personal detail from backup API (null if unavailable)
 * @returns {{ hasPaidAny: boolean, coursePaidAny: boolean }}
 */
export function mergeFeeFlags(primary, backup) {
  const hasPaidAny =
    isPaidFlag(primary?.has_paid) || (backup != null && isPaidFlag(backup.has_paid));
  const coursePaidAny =
    isPaidFlag(primary?.course_paid) || (backup != null && isPaidFlag(backup.course_paid));
  return { hasPaidAny, coursePaidAny };
}

/**
 * Paystack subaccount for study center splits (same mapping as Course_reg).
 * @param {string|undefined} studyCenter
 * @returns {string}
 */
export function getCenterSubaccountByStudyCenter(studyCenter) {
  switch (studyCenter) {
    case "New Bussa":
      return "ACCT_p76xm5gfunxqp89";
    case "Gulu":
      return "ACCT_0saux3r5q758ky6";
    case "suleja":
      return "ACCT_n3bppexq5wd5n85";
    case "Gawu":
      return "ACCT_by8wdwd0a10g68u";
    case "Mokwa":
      return "ACCT_bvaybztnxq9r7mk";
    case "Kagara":
      return "ACCT_sr3hi6ohw6w5bd3";
    case "Rijau":
      return "ACCT_te7rbklmjj58gja";
    case "Kontogora":
      return "ACCT_zbec9c9igq0alsz";
    case "Doko":
      return "ACCT_pft4xrq2nn8z3kz";
    case "Katcha":
      return "ACCT_q7hpb8aop6872xk";
    case "Salka":
      return "ACCT_ol4nfqttt60d9my";
    case "Bida":
      return "ACCT_xbd6r3fuguhi807";
    case "Patigi":
      return "ACCT_8bh96hpa23avb1w";
    case "Pandogari":
      return "ACCT_5ljhtgc5cihxenj";
    case "Agaie":
      return "ACCT_cga221mhd2awqol";
    default:
      return "ACCT_aan2ehxiej239du";
  }
}

/**
 * Minimal PUT body so primary DB satisfies ClearanceRequestService before POST /clearances.
 * Only meaningful when merged coursePaidAny is true.
 * @param {object|null|undefined} primary
 * @param {{ coursePaidAny: boolean }} merged
 * @returns {Record<string, boolean>}
 */
export function buildPrimaryFeeSyncBody(primary, merged) {
  if (!merged?.coursePaidAny) return {};
  const body = {};
  if (!isPaidFlag(primary?.has_paid)) body.has_paid = true;
  if (!isPaidFlag(primary?.course_paid)) body.course_paid = true;
  return body;
}

const DEFAULT_CONCURRENCY = 6;

/**
 * Fetch backup personal-details for many ids in bounded parallel chunks.
 * @param {import('axios').AxiosInstance} axiosClient
 * @param {number[]} ids
 * @param {string} personalDetailsBackupBase - e.g. https://host/api/personal-details (no trailing slash)
 * @param {number} [concurrency]
 * @returns {Promise<Record<number, object|null>>}
 */
export async function fetchBackupPersonalByIds(axiosClient, ids, personalDetailsBackupBase, concurrency = DEFAULT_CONCURRENCY) {
  const map = {};
  const unique = [...new Set((ids || []).filter((x) => x != null && x !== ""))];
  if (!personalDetailsBackupBase || unique.length === 0) return map;

  const conc = Math.max(1, Math.min(concurrency, unique.length));
  for (let offset = 0; offset < unique.length; offset += conc) {
    const chunk = unique.slice(offset, offset + conc);
    const settled = await Promise.allSettled(
      chunk.map((pid) =>
        axiosClient.get(`${personalDetailsBackupBase}/${pid}`).then((res) => ({ pid, data: res.data }))
      )
    );
    settled.forEach((result, i) => {
      const pid = chunk[i];
      if (result.status === "fulfilled") map[pid] = result.value.data;
      else map[pid] = null;
    });
  }
  return map;
}
