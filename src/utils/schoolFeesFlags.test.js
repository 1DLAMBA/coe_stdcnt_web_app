import {
  canDownloadExamCard,
  canRequestClearance,
  canViewSchoolFeesReceipt,
  computeCourseRegFeeState,
  CURRENT_FEE_SESSION,
  LAST_FEE_SESSION,
} from "./schoolFeesFlags";

const partialPrimary = (feeSession) => ({
  id: 1,
  has_paid: 1,
  course_paid: 0,
  ...(feeSession !== undefined && { fee_academic_session: feeSession }),
});

const fullPrimary = (feeSession) => ({
  id: 1,
  has_paid: 1,
  course_paid: 1,
  fee_academic_session: feeSession,
});

const fullBackup = () => ({
  id: 1,
  application_number: "APP1",
  has_paid: 1,
  course_paid: 1,
});

const partialBackup = () => ({
  id: 1,
  application_number: "APP1",
  has_paid: 1,
  course_paid: 0,
});

describe("computeCourseRegFeeState — dual DB", () => {
  test("primary partial + backup full + null fee session → 40% for current", () => {
    const state = computeCourseRegFeeState(
      partialPrimary(undefined),
      fullBackup(),
      false
    );
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(CURRENT_FEE_SESSION);
    expect(state.feesCardLockedTo).toBeNull();
    expect(state.branchBPActive).toBe(false);
    expect(state.showCourseReg).toBe(false);
  });

  test("primary partial + backup full + 2025/2026 fee session → 40% for current", () => {
    const state = computeCourseRegFeeState(
      partialPrimary(CURRENT_FEE_SESSION),
      fullBackup(),
      false
    );
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(CURRENT_FEE_SESSION);
    expect(state.feesCardLockedTo).toBeNull();
  });

  test("primary partial + backup full + stale 2024/2025 tag → 40% for current", () => {
    const state = computeCourseRegFeeState(
      partialPrimary(LAST_FEE_SESSION),
      fullBackup(),
      false
    );
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(CURRENT_FEE_SESSION);
    expect(state.feesCardLockedTo).toBeNull();
  });

  test("backup partial → branch B/P carry-over for last session", () => {
    const state = computeCourseRegFeeState(
      partialPrimary(CURRENT_FEE_SESSION),
      partialBackup(),
      false
    );
    expect(state.branchBPActive).toBe(true);
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(LAST_FEE_SESSION);
  });

  test("both full → course registration unlocked", () => {
    const state = computeCourseRegFeeState(
      fullPrimary(CURRENT_FEE_SESSION),
      fullBackup(),
      false
    );
    expect(state.allRequiredPaid).toBe(true);
    expect(state.showCourseReg).toBe(true);
    expect(state.partial40Active).toBe(false);
    expect(canDownloadExamCard(fullPrimary(CURRENT_FEE_SESSION), fullBackup(), false)).toBe(
      true
    );
  });

  test("no backup row, primary partial for current → 40% not locked full/partial", () => {
    const state = computeCourseRegFeeState(
      partialPrimary(CURRENT_FEE_SESSION),
      null,
      false
    );
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(CURRENT_FEE_SESSION);
    expect(state.feesCardLockedTo).toBeNull();
    expect(state.hasBackup).toBe(false);
  });

  test("no backup row, primary partial, no fee tag → 40% current", () => {
    const state = computeCourseRegFeeState(partialPrimary(undefined), null, false);
    expect(state.partial40Active).toBe(true);
    expect(state.partial40Session).toBe(CURRENT_FEE_SESSION);
    expect(state.feesCardLockedTo).toBeNull();
  });
});

describe("clearance and exam card access", () => {
  test("backup full + primary partial → clearance allowed, exam card blocked", () => {
    expect(canRequestClearance(partialPrimary(), fullBackup(), false)).toBe(true);
    expect(canDownloadExamCard(partialPrimary(), fullBackup(), false)).toBe(false);
  });

  test("backup full + primary full → allowed", () => {
    expect(canRequestClearance(fullPrimary(CURRENT_FEE_SESSION), fullBackup(), false)).toBe(true);
  });

  test("backup partial + primary full → blocked", () => {
    expect(canRequestClearance(fullPrimary(CURRENT_FEE_SESSION), partialBackup(), false)).toBe(
      false
    );
  });

  test("no backup + primary full → blocked (must exist in backup)", () => {
    expect(canRequestClearance(fullPrimary(CURRENT_FEE_SESSION), null, false)).toBe(false);
  });

  test("no backup + primary partial → blocked", () => {
    expect(canRequestClearance(partialPrimary(), null, false)).toBe(false);
  });

  test("new intake with full backup → allowed (backup is the only gate)", () => {
    expect(canRequestClearance(partialPrimary(), fullBackup(), true)).toBe(true);
  });
});

describe("canViewSchoolFeesReceipt", () => {
  const unpaidPrimary = () => ({
    id: 1,
    has_paid: 0,
    course_paid: 0,
  });

  test("backup paid + primary unpaid → receipt available", () => {
    expect(canViewSchoolFeesReceipt(unpaidPrimary(), fullBackup(), false)).toBe(true);
  });

  test("no backup + primary unpaid → receipt unavailable", () => {
    expect(canViewSchoolFeesReceipt(unpaidPrimary(), null, false)).toBe(false);
  });

  test("primary paid → receipt available", () => {
    expect(canViewSchoolFeesReceipt(partialPrimary(), null, false)).toBe(true);
  });
});
