/**
 * Shared helpers for primary + backup personal-details fee flags (clearance flows).
 */

export function isPaidFlag(value) {
  return value === true || value === 1 || value === "1";
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
      return "ACCT_zduspv9kbkc5wsp";
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
