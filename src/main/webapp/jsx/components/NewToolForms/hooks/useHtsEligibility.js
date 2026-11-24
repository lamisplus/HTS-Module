import { useEffect, useMemo, useRef, useState } from "react";
import { checkActiveHivTransferIn } from "../../../services/checkHivTransferIn.service";
import { checkActiveHivEnrollment } from "../../../services/checkHivEnrollment.service";

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

export function checkHtsEligibility(encounters, hasActiveHivTransferIn, hasActiveHivEnrollment) {
  if (hasActiveHivTransferIn) {
    return {
      isEligible: false,
      reason: "Client has a documented HIV Transfer-In record and cannot have a new HTS record created. The ICT form remains available.",
      confirmatoryResult: "N/A - blocked by Transfer-In record",
      finalHivTestResult: "N/A - blocked by Transfer-In record",
      suspectedAcuteInfection: "N/A"
    };
  }

  if (hasActiveHivEnrollment) {
    return {
      isEligible: false,
      reason: "Client is enrolled in ART (HIV care) and cannot have a new HTS record created. The ICT form remains available.",
      confirmatoryResult: "N/A - blocked by ART enrollment",
      finalHivTestResult: "N/A - blocked by ART enrollment",
      suspectedAcuteInfection: "N/A"
    };
  }

  if (!encounters || !Array.isArray(encounters) || encounters.length === 0) {
    return { isEligible: true, reason: "No previous HTS records found.", confirmatoryResult: "No result found", finalHivTestResult: "No result found" };
  }

  const sorted = [...encounters].sort(
    (a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)
  );
  const latest = sorted[0];

  const confirmatoryResult = latest?.observation?.confirmatoryHivTest?.trim().toLowerCase();
  const finalHivTestResult = latest?.observation?.finalHivTestResult?.trim().toLowerCase();
  const suspectedAcuteInfection = latest?.observation?.suspectedAcuteInfection?.trim().toLowerCase();

  const positiveEncounter = sorted.find(isPositiveEncounter);
  if (positiveEncounter) {
    return {
      isEligible: false,
      reason: "Client has a previously documented HIV Positive result and cannot have a new HTS record.",
      confirmatoryResult: positiveEncounter?.observation?.confirmatoryHivTest?.trim().toLowerCase() || confirmatoryResult,
      finalHivTestResult: positiveEncounter?.observation?.finalHivTestResult?.trim().toLowerCase() || finalHivTestResult,
      suspectedAcuteInfection
    };
  }

  const initialResult = latest?.observation?.initialHivTest?.trim().toLowerCase();

  const isLatestNegative =
    confirmatoryResult === "hiv_confirmatory_test_result_negative" ||
    finalHivTestResult === "negative" ||
    initialResult === "hiv_test_result_negative";

  if (isLatestNegative) {
    const visitDate = new Date(latest.dateOfVisit);
    const today = new Date();
    const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));

    if (daysDiff < 30) {
      return {
        isEligible: false,
        reason: `Client tested Negative on ${latest.dateOfVisit}, which is within the last 30 days.`,
        confirmatoryResult,
        finalHivTestResult,
        suspectedAcuteInfection
      };
    }

    return {
      isEligible: true,
      reason: `Client's last Negative result (${latest.dateOfVisit}) is older than 30 days.`,
      confirmatoryResult,
      finalHivTestResult,
      suspectedAcuteInfection
    };
  }

  return {
    isEligible: true,
    reason: "No conclusive result from any previous HIV confirmatory test was found.",
    confirmatoryResult,
    finalHivTestResult,
    suspectedAcuteInfection
  };
}


export function useHtsEligibility(encounters, isLoadingEncounters, refreshKey, personId, personUuid) {
  const [hasActiveHivTransferIn, setHasActiveHivTransferIn] = useState(false);
  const [hasActiveHivEnrollment, setHasActiveHivEnrollment] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const lastCheckedKeyRef = useRef(null);

  const derivedPersonId = encounters?.[0]?.patientId ?? encounters?.[0]?.person?.id ?? personId;
  const derivedPersonUuid = encounters?.[0]?.patientUuid ?? encounters?.[0]?.person?.uuid ?? personUuid;

  useEffect(() => {
    const key = `${derivedPersonId ?? ""}|${derivedPersonUuid ?? ""}|${refreshKey ?? ""}`;
    if (lastCheckedKeyRef.current === key) {
      return undefined;
    }
    lastCheckedKeyRef.current = key;

    let isMounted = true;

    if (!derivedPersonId && !derivedPersonUuid) {
      setHasActiveHivTransferIn(false);
      setHasActiveHivEnrollment(false);
      return undefined;
    }

    const checkEligibilityBlockers = async () => {
      setIsCheckingEligibility(true);
      try {
        const [transferIn, enrollment] = await Promise.all([
          checkActiveHivTransferIn(derivedPersonId, derivedPersonUuid),
          checkActiveHivEnrollment(derivedPersonId, derivedPersonUuid),
        ]);
        if (isMounted) {
          setHasActiveHivTransferIn(!!transferIn);
          setHasActiveHivEnrollment(!!enrollment);
        }
      } catch (error) {
        console.error("Failed to check HTS eligibility blockers:", error);
        if (isMounted) {
          setHasActiveHivTransferIn(false);
          setHasActiveHivEnrollment(false);
        }
      } finally {
        if (isMounted) setIsCheckingEligibility(false);
      }
    };

    checkEligibilityBlockers();

    return () => {
      isMounted = false;
    };
  }, [derivedPersonId, derivedPersonUuid, refreshKey]);

  const { isEligible, reason, confirmatoryResult, finalHivTestResult, suspectedAcuteInfection } = useMemo(() => {
    if (isCheckingEligibility) {
      return { isEligible: false, reason: "Checking HIV care records...", confirmatoryResult: "checking...", finalHivTestResult: "checking...", suspectedAcuteInfection: "checking..." };
    }
    if (isLoadingEncounters) {
      return { isEligible: false, reason: "Loading encounter history...", confirmatoryResult: "checking...", finalHivTestResult: "checking...", suspectedAcuteInfection: "checking..." };
    }
    return checkHtsEligibility(encounters, hasActiveHivTransferIn, hasActiveHivEnrollment);
  }, [encounters, isLoadingEncounters, refreshKey, hasActiveHivTransferIn, hasActiveHivEnrollment, isCheckingEligibility]);

  return { isPatientEligibleForHts: isEligible, eligibilityReason: reason, confirmatoryResult, finalHivTestResult, suspectedAcuteInfection };
}