import { useMemo } from "react";
export function checkHtsEligibility(encounters) {
  // Guard: treat null / undefined / non-array as "no records"
  if (!encounters || !Array.isArray(encounters) || encounters.length === 0) {
    return { isEligible: true, reason: "No previous HTS records found.", confirmatoryResult: "No result found" };
  }

  // Sort descending by dateOfVisit to find the most recent encounter
  const sorted = [...encounters].sort(
    (a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)
  );
  const latest = sorted[0];

  const confirmatoryResult = latest?.data?.confirmatoryHivTest?.trim().toLowerCase();

  // Rule 2: Any documented Positive → permanently ineligible
  if (confirmatoryResult === "STI_HIV_RESULT_POSITIVE") {
    return {
      isEligible: false,
      reason:
        "Client has a previously documented HIV Positive result and cannot have a new HTS form.",
        confirmatoryResult
    };
  }

  // Rule 3 & 4: Last result was Negative — check how long ago
  if (confirmatoryResult === "STI_HIV_RESULT_NEGATIVE") {
    const visitDate = new Date(latest.dateOfVisit);
    const today = new Date();

    // Difference in calendar months
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

  // Fallback: unrecognised / missing result — allow entry
  return {
    isEligible: true,
    reason: "No conclusive result from any previous HIV confirmatory test was found.",
    confirmatoryResult
  };
}


// --- React hook (drop this anywhere in your component tree) ---
/**
 * @param {Array} encounters - the array returned by getHtsEcounterForAPatient()
 * @param {boolean} isLoadingEncounters - loading flag so eligibility is only computed once data is ready
 */ 
export function useHtsEligibility(encounters, isLoadingEncounters) {
  const { isEligible, reason, confirmatoryResult } = useMemo(() => {
    if (isLoadingEncounters) {
      return { isEligible: false, reason: "Loading encounter history...", confirmatoryResult: "checking..." };
    }
    return checkHtsEligibility(encounters);
  }, [encounters, isLoadingEncounters]);

  return { isPatientEligibleForHts: isEligible, eligibilityReason: reason, confirmatoryResult };
}