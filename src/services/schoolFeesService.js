import axios from "axios";
import API_ENDPOINTS from "../Endpoints/environment";
import { backupHasRecord, LAST_FEE_SESSION } from "../utils/schoolFeesFlags";

/**
 * Primary DB should not receive has_paid/course_paid when 2024/2025 is paid on backup.
 */
export function isLastSessionFeeOnBackup(feeSession, backup) {
  return feeSession === LAST_FEE_SESSION && backupHasRecord(backup);
}

/**
 * Build PUT body for backup personal-details (payment flags + fee refs only).
 * @param {string} payType
 * @param {string} reference - Paystack transaction reference
 * @returns {Record<string, string|boolean>|null}
 */
export function buildBackupSchoolFeesPayload(payType, reference) {
  const today = new Date().toISOString().split("T")[0];
  const base = {
    couse_fee_date: reference,
    course_fee_reference: today,
  };

  switch (payType) {
    case "complete_school_fees":
      return { ...base, has_paid: true, course_paid: true };
    case "partial_school_fees":
      return { ...base, has_paid: true };
    case "school_fees_completion":
      return { ...base, has_paid: true, course_paid: true };
    default:
      return null;
  }
}

/**
 * After Paystack onSuccess for 2024/2025, update backup DB directly (webhook uses main API).
 * @param {string|number} id - personal detail id
 * @param {string} payType - complete_school_fees | partial_school_fees | school_fees_completion
 * @param {string|null|undefined} feeSession
 * @param {string} reference - Paystack transaction reference
 */
export async function syncBackupSchoolFeesAfterPayment(id, payType, feeSession, reference) {
  if (feeSession !== LAST_FEE_SESSION || !id || !reference) {
    return;
  }

  const backupBase = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;
  if (!backupBase) {
    console.warn("Backup API URL not configured; skipping backup fee sync.");
    return;
  }

  const payload = buildBackupSchoolFeesPayload(payType, reference);
  if (!payload) {
    console.warn("Unknown pay_type for backup sync:", payType);
    return;
  }

  try {
    await axios.put(`${backupBase}/${id}`, payload);
  } catch (error) {
    console.warn(
      "Backup school-fee sync failed (primary may still be updated):",
      error.response?.data || error.message || error
    );
  }
}
