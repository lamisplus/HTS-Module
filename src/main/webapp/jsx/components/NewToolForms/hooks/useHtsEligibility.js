import { useMemo } from "react";
export function checkHtsEligibility(encounters) {
  if (!encounters || !Array.isArray(encounters) || encounters.length === 0) {
    return { isEligible: true, reason: "No previous HTS records found.", confirmatoryResult: "No result found" };
  }

  const sorted = [...encounters].sort(
    (a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)
  );
  const latest = sorted[0];

  const confirmatoryResult = latest?.observation?.confirmatoryHivTest?.trim().toLowerCase();

  if (confirmatoryResult === "hiv_confirmatory_test_result_positive") {
    return {
      isEligible: false,
      reason: "Client has a previously documented HIV Positive result and cannot have a new HTS form.",
      confirmatoryResult
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
        confirmatoryResult
      };
    }

    return {
      isEligible: true,
      reason: `Client's last Negative result (${latest.dateOfVisit}) is older than 3 months.`,
      confirmatoryResult
    };
  }

  return {
    isEligible: true,
    reason: "No conclusive result from any previous HIV confirmatory test was found.",
    confirmatoryResult
  };
}

export function useHtsEligibility(encounters, isLoadingEncounters) {
  const { isEligible, reason, confirmatoryResult } = useMemo(() => {
    if (isLoadingEncounters) {
      return { isEligible: false, reason: "Loading encounter history...", confirmatoryResult: "checking..." };
    }
    return checkHtsEligibility(encounters);
  }, [encounters, isLoadingEncounters]);

  return { isPatientEligibleForHts: isEligible, eligibilityReason: reason, confirmatoryResult };
}