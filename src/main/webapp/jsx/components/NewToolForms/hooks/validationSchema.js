/**
 * validationSchema.js
 *
 * Single source of truth for all HTS form validation.
 * Used by both useNewPatientFormik (isNewPatient=true) and
 * useExistingPatientFormik (isNewPatient=false).
 *
 * Skip-logic mirror:
 *   Every field that is conditionally shown/hidden in the UI has a matching
 *   conditional test here. If the field is hidden → validation passes automatically.
 *   If the field is visible → validation is enforced.
 *
 * skipKnowledgeAndRisk(ctx):
 *   The entire Knowledge Assessment and Personal HIV Risk Assessment blocks are
 *   hidden when modality === "PMTCT" OR age <= 15.
 *   Validated age is derived from dobType:
 *     "Actual"    → computed from dateOfBirth string
 *     "Estimated" → taken directly from age field
 */

import * as yup from "yup";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** At least 2 characters that are not spaces */
const nonBlankMin2 = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .test(
      `${label}-min2-nonblank`,
      `${label} must contain at least 2 non-space characters`,
      (val) => !!val && val.replace(/\s/g, "").length >= 2
    );

/**
 * Derives the numeric age from formik values, respecting dobType.
 * Returns null when it cannot be determined.
 */
const resolveAge = (parent) => {
  const { dobType, dateOfBirth, age } = parent;
  if (dobType?.toLowerCase() === "estimated") {
    const n = Number(age);
    return isNaN(n) ? null : n;
  }
  // Actual or unset — compute from dateOfBirth
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1;
  return years;
};

/**
 * Returns true when the Knowledge Assessment / Personal Risk Assessment
 * sections should be skipped (and their fields are therefore not required).
 */
const skipKnowledgeAndRisk = (ctx) => {
  const { modality, pregnancyStatus } = ctx.parent;
  // if (modality?.toLowerCase() === "pmtct") return true;
  if (pregnancyStatus?.toLowerCase() === "pregnant") return true;
  if (pregnancyStatus?.toLowerCase() === "breastfeeding") return true;
  const age = resolveAge(ctx.parent);
  return age !== null && age <= 15;
};


// ─── exported builder ─────────────────────────────────────────────────────────

/**
 * @param {boolean} isNewPatient
 *   true  → demographic fields (name, DOB, sex, phone, marital status, address)
 *           are editable and fully validated.
 *   false → demographic fields are read-only for existing patients; skip their
 *           validation entirely.
 */
export const buildValidationSchema = (isNewPatient) => {
  // ── demographics (new patient only) ─────────────────────────────────────

  const demographicFields = isNewPatient
    ? {
      surname: nonBlankMin2("Surname"),
      firstName: nonBlankMin2("First name"),
      // middleName is optional — no rule needed

      dobType: yup
        .string()
        .oneOf(["Actual", "Estimated"], "Please select Actual or Estimated")
        .required("Please select Actual or Estimated"),

      // dateOfBirth is required only when dobType === "Actual"
      dateOfBirth: yup.mixed().test(
        "dob-required-when-actual",
        "Date of birth is required",
        function (value) {
          if (this.parent.dobType?.toLowerCase() !== "actual") return true;
          if (!value) return false;
          const d = new Date(value);
          if (isNaN(d.getTime())) return this.createError({ message: "Enter a valid date" });
          if (d > new Date()) return this.createError({ message: "Date of birth cannot be in the future" });
          return true;
        }
      ),

      facilityName: yup.string().required("Facility/Site name is required"),

      // age is required only when dobType === "Estimated"
      age: yup.mixed().test(
        "age-required-when-estimated",
        "Age is required",
        function (value) {
          if (this.parent.dobType?.toLowerCase() !== "estimated") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Age is required" });
          const n = Number(value);
          if (isNaN(n) || n < 0)
            return this.createError({ message: "Age must be a non-negative number" });
          if (n > 130)
            return this.createError({ message: "Age must be 130 or less" });
          return true;
        }
      ),

      sex: yup.string().required("Sex is required"),

      phoneNumber: yup
        .string()
        .required("Phone number is required")
        .matches(/^[0-9]{10,11}$/, "Phone number must be 10 or 11 digits"),

      maritalStatus: yup.string().required("Marital status is required"),

      // numberOfWives: required and ≥ 1 only when sex=Male AND maritalStatus=Married
      numberOfWives: yup.mixed().test(
        "num-wives-conditional",
        "Number of wives is required and must be at least 1",
        function (value) {
          const { sex, maritalStatus } = this.parent;
          if (sex?.toLowerCase() !== "male" || maritalStatus?.toLowerCase() !== "married") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Number of wives is required" });
          if (Number(value) < 1)
            return this.createError({ message: "Number of wives must be at least 1" });
          return true;
        }
      ),

      // numberOfCoWives: required and ≥ 0 only when sex=Female AND maritalStatus=Married
      numberOfCoWives: yup.mixed().test(
        "num-co-wives-conditional",
        "Number of co-wives is required",
        function (value) {
          const { sex, maritalStatus } = this.parent;
          if (sex?.toLowerCase() !== "female" || maritalStatus?.toLowerCase() !== "married") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Number of co-wives is required" });
          if (Number(value) < 0)
            return this.createError({ message: "Must be 0 or more" });
          return true;
        }
      ),

      numberOfBiologicalChildren: yup.mixed().test(
        "num-children-non-negative",
        "Must be 0 or more",
        (value) =>
          value === "" ||
          value === undefined ||
          value === null ||
          Number(value) >= 0
      ),

      // pregnancyStatus: required only when sex=Female
      pregnancyStatus: yup.mixed().test(
        "pregnancy-required-for-female",
        "Pregnancy status is required",
        function (value) {
          if (this.parent.sex?.toLowerCase() !== "female") return true;
          return !!value || this.createError({ message: "Pregnancy status is required for female clients" });
        }
      ),

      // breastfeedingDuration: required only when pregnancyStatus=Breastfeeding
      breastfeedingDuration: yup.mixed().test(
        "breastfeeding-duration-conditional",
        "Duration of breastfeeding is required",
        function (value) {
          if (this.parent.pregnancyStatus?.toLowerCase() !== "breastfeeding") return true;
          return !!value || this.createError({ message: "Duration of breastfeeding is required" });
        }
      ),

      clientState: yup.string().required("State is required"),
      clientLga: yup.string().required("LGA is required"),
      address: yup.string().required("Address is required"),
      landmark: yup.string(),
    }
    : {};

  // ── visit / setting fields (both new and existing) ───────────────────────

  return yup.object({
    ...demographicFields,

    dateOfVisit: yup
      .date()
      .max(new Date(), "Date of visit cannot be in the future")
      .required("Date of visit is required"),

    clientCode: yup.string().required("Client code is required"),

    setting: yup.string().required("Setting is required"),

    // modality: yup.string().required("Modality is required"),

    typeOfSession: yup.string().required("Type of session is required"),

    // facilitySetting: required only when setting=Facility
    facilitySetting: yup.mixed().test(
      "facility-setting-conditional",
      "Facility setting is required",
      function (value) {
        if (this.parent.setting?.toLowerCase() !== "facility") return true;
        return !!value || this.createError({ message: "Facility setting is required" });
      }
    ),

    // communityEntryPoint: required only when setting=Community
    communityEntryPoint: yup.mixed().test(
      "community-entry-conditional",
      "Community entry point is required",
      function (value) {
        if (this.parent.setting?.toLowerCase() !== "community") return true;
        return !!value || this.createError({ message: "Community entry point is required" });
      }
    ),

    // indexTesting (Yes/No): required only when typeOfSession=Index Testing
    indexTesting: yup.mixed().test(
      "index-testing-conditional",
      "Please indicate whether this is index testing",
      function (value) {
        if (this.parent.typeOfSession?.toLowerCase() !== "index contact testing") return true;
        return !!value || this.createError({ message: "Index testing selection is required" });
      }
    ),

    // indexRelationship: required only when typeOfSession=Index Testing AND indexTesting=Yes
    indexRelationship: yup.mixed().test(
      "index-relationship-conditional",
      "Relationship of index client is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession?.toLowerCase() !== "index contact testing" || indexTesting?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "Relationship of index client is required" });
      }
    ),

    // indexClientCode: required only when typeOfSession=Index Testing AND indexTesting=Yes
    indexClientCode: yup.mixed().test(
      "index-client-code-conditional",
      "Index client code/ID is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession?.toLowerCase() !== "index contact testing" || indexTesting?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "Index client code/ID is required" });
      }
    ),

    
    previouslyTestedNegative: yup.mixed().test(
      "prev-tested-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // timeOfLastNegativeTest: visible only when previouslyTestedNegative=Yes
    timeOfLastNegativeTest: yup.mixed().test(
      "time-last-negative-conditional",
      "Time of last negative test is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.previouslyTestedNegative?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "Time of last negative test is required" });
      }
    ),

    clientInformedTransmissionRoutes: yup.mixed().test(
      "transmission-routes-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    clientInformedRiskFactors: yup.mixed().test(
      "risk-factors-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    clientInformedPreventionMethods: yup.mixed().test(
      "prevention-methods-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    clientInformedPossibleResults: yup.mixed().test(
      "possible-results-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    informedConsentGiven: yup.mixed().test(
      "consent-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    everHadSexualIntercourse: yup.mixed().test(
      "ever-sex-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    moreThanOneSexPartner: yup.mixed().test(
      "multi-partner-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    unprotectedVaginalSex: yup.mixed().test(
      "vaginal-sex-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    unprotectedAnalSex: yup.mixed().test(
      "anal-sex-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // bloodTransfusionLast3Months always visible (not gated on everHadSex)
    bloodTransfusionLast3Months: yup.mixed().test(
      "blood-transfusion-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    sexUnderInfluence: yup.mixed().test(
      "sex-influence-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    historyOfSTI: yup.mixed().test(
      "sti-history-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // ── TB Screening — always visible, always required ─────────────────────

    currentCough: yup.mixed().test(
      "curent-cough-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    weightLoss: yup.mixed().test(
      "weight-loss-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    fever: yup.mixed().test(
      "fever-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    nightSweats: yup.mixed().test(
      "night-sweats-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    // ── STI Screening — sex-conditional fields ─────────────────────────────

    // Female-only
    complaintsVaginalDischarge: yup.mixed().test(
      "vaginal-discharge-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex?.toLowerCase() !== "female") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    complaintsLowerAbdominalPain: yup.mixed().test(
      "lower-abdominal-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex?.toLowerCase() !== "female") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // Male-only
    complaintsUrethralDischarge: yup.mixed().test(
      "urethral-discharge-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex?.toLowerCase() !== "male") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    complaintsScroralSwelling: yup.mixed().test(
      "scrotal-swelling-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex?.toLowerCase() !== "male") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // Both sexes

    complaintsGenitalSores: yup.mixed().test(
      "complaint-genital-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    complaintsSwollenLymphNodes: yup.mixed().test(
      "complaint-swollen-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // ── Sex Partner Risk Assessment ─────────────────────────────────────────
    // Visible only when everHadSexualIntercourse=Yes AND not skipKnowledgeAndRisk

    partnerNewlyDiagnosed: yup.mixed().test(
      "partner-new-dx-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    partnerPregnantOnArv: yup.mixed().test(
      "partner-pmtct-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    adolescentHivPositive: yup.mixed().test(
      "adolescent-hiv-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this?.parent?.everHadSexualIntercourse?.toLowerCase() !== "yes") {
          return true;
        }
        const age = Number(this?.parent?.age);
        // Skip validation if NOT between 10–19
        if (age < 10 || age > 19) return true;
        // Enforce required if age is 10–19
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    partnerNotRegularlyOnDrugs: yup.mixed().test(
      "partner-not-drugs-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    partnerRecentlyReturnedToTreatment: yup.mixed().test(
      "partner-ltfu-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),


    hadSexWithHivPositivePartnerInRiskGroup: yup.mixed().test(
      "had-sex-with-hiv-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),

    // ── Diagnostic Testing ─────────────────────────────────────────────────

    initialHivTest: yup.string().required("Initial HIV test result is required"),

    // suspectedAcuteInfection: visible only when initialHivTest=Negative
    suspectedAcuteInfection: yup.mixed().test(
      "acute-infection-conditional",
      "This field is required",
      function (value) {
        if (this.parent.hivEarlyDetectTestDone?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "This field is required when HIV Early Detect Test Done is yes" });
      }
    ),

    // confirmatoryHivTest: visible only when initialHivTest=Positive
    confirmatoryHivTest: yup.mixed().test(
      "confirmatory-conditional",
      "Confirmatory HIV test is required",
      function (value) {
        if (this.parent.initialHivTest?.toLowerCase() !== "positive") return true;
        return !!value || this.createError({ message: "Confirmatory HIV test is required when Initial HIV test is Positive" });
      }
    ),

    // recencyTest: visible only when initialHivTest=Positive
    // recencyTest: yup.mixed().test(
    //   "recency-conditional",
    //   "Recency test is required",
    //   function (value) {
    //     if (this.parent.initialHivTest?.toLowerCase() !== "positive") return true;
    //     return !!value || this.createError({ message: "Recency test is required for client whose Initial HIV Test is positive" });
    //   }
    // ),

    recencyTest: yup.string(),

    // ── Post-Test Counselling — all always visible, all required ───────────

    previouslyTestedThisYear: yup.string().required("This field is required"),
    clientReceivedTestResult: yup.string().required("This field is required"),
    hivTestKitsProvided: yup.string().required("This field is required"),
    // categoryOfClients: yup.string().required("This field is required"),
    
    // categoryOfClients: visible only when hivTestKitsProvided=yes
    categoryOfClients: yup.mixed().test(
      "categoryOfClients-conditional",
      "Category of client is required",
      function (value) {
        if (this.parent.hivTestKitsProvided?.toLowerCase() !== "yes") return true;
        return !!value || this.createError({ message: "Category of client is required when HIV self test kit provided to client is yes" });
      }
    ),
    
    
    // acceptedIndexTesting: visible only when confirmatoryHivTest=Positive
    acceptedIndexTesting: yup.mixed().test(
      "acceptedIndextesting-conditional",
      "Accepted Index testing is required",
      function (value) {
        if (this.parent.confirmatoryHivTest?.toLowerCase() !== "positive") return true;
        return !!value || this.createError({ message: "Accepted Index testing is required when confirmatory HIV test is positive" });
      }
    ),

    // acceptedIndexTesting: yup.string().required("This field is required"),
    providedFpInfo: yup.string().required("This field is required"),
    clientPartnerUseFpMethods: yup.string().required("This field is required"),
    clientPartnerUseCondoms: yup.string().required("This field is required"),
    correctCondomUseDemonstrated: yup.string().required("This field is required"),
    condomsProvided: yup.string().required("This field is required"),
    clientReferredToOtherServices: yup.string().required("This field is required"),
    completedBy: yup.string().required("This field is required"),
    designation: yup.string().required("This field is required"),
  });
};
