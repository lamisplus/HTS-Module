import { useMemo } from "react";

export const POSITIVE_HIV_RESULT_CODES = new Set([
  "hiv_confirmatory_test_result_positive",
  "positive",
  "acute hiv infection"
]);

function isPositiveValue(value) {
  if (!value) return false;
  return POSITIVE_HIV_RESULT_CODES.has(value.trim().toLowerCase());
}

function isPositiveEncounter(encounter) {
  return (
    isPositiveValue(encounter?.observation?.confirmatoryHivTest) ||
    isPositiveValue(encounter?.observation?.finalHivTestResult)
  );
}

export function checkHtsEligibility(encounters) {
  if (!encounters || !Array.isArray(encounters) || encounters.length === 0) {
    return { isEligible: true, reason: "No previous HTS records found.", confirmatoryResult: "No result found", finalHivTestResult: "No result found" };
  }

  const sorted = [...encounters].sort(
    (a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)
  );
  const latest = sorted[0];

  const confirmatoryResult = latest?.observation?.confirmatoryHivTest?.trim().toLowerCase();
  const finalHivTestResult = latest?.observation?.finalHivTestResult?.trim().toLowerCase();

  const positiveEncounter = sorted.find(isPositiveEncounter);
  if (positiveEncounter) {
    return {
      isEligible: false,
      reason: "Client has a previously documented HIV Positive result and cannot have a new HTS record.",
      confirmatoryResult: positiveEncounter?.observation?.confirmatoryHivTest?.trim().toLowerCase() || confirmatoryResult,
      finalHivTestResult: positiveEncounter?.observation?.finalHivTestResult?.trim().toLowerCase() || finalHivTestResult
    };
  }

  if (confirmatoryResult === "hiv_confirmatory_test_result_negative") {
    const visitDate = new Date(latest.dateOfVisit);
    const today = new Date();
    const monthsDiff =
      (today.getFullYear() - visitDate.getFullYear()) * 12 +
      (today.getMonth() - visitDate.getMonth());

    if (monthsDiff < 3) {
      return {
        isEligible: false,
        reason: `Client tested Negative on ${latest.dateOfVisit}, which is within the last 3 months.`,
        confirmatoryResult,
        finalHivTestResult
      };
    }

    return {
      isEligible: true,
      reason: `Client's last Negative result (${latest.dateOfVisit}) is older than 3 months.`,
      confirmatoryResult,
      finalHivTestResult
    };
  }

  return {
    isEligible: true,
    reason: "No conclusive result from any previous HIV confirmatory test was found.",
    confirmatoryResult,
    finalHivTestResult
  };
}

export function useHtsEligibility(encounters, isLoadingEncounters, refreshKey) {
  const { isEligible, reason, confirmatoryResult, finalHivTestResult } = useMemo(() => {
    if (isLoadingEncounters) {
      return { isEligible: false, reason: "Loading encounter history...", confirmatoryResult: "checking...", finalHivTestResult: "checking..." };
    }
    return checkHtsEligibility(encounters);
  }, [encounters, isLoadingEncounters, refreshKey]);

  return { isPatientEligibleForHts: isEligible, eligibilityReason: reason, confirmatoryResult, finalHivTestResult };
}