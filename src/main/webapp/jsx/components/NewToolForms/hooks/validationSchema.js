// src/NewToolForms/hooks/validationSchema.js
import * as yup from "yup";

const nonBlankMin2 = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .test(
      `${label}-min2-nonblank`,
      `${label} must contain at least 2 non-space characters`,
      (val) => !!val && val.replace(/\s/g, "").length >= 2
    );

const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const resolveAge = (parent) => {
  const { dobType, dateOfBirth, age } = parent;
  if (dobType?.toLowerCase() === "estimated") {
    const n = Number(age);
    return isNaN(n) ? null : n;
  }
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1;
  return years;
};

const skipKnowledgeAndRisk = (ctx) => {
  const { pregnancyStatus } = ctx.parent;
  if (pregnancyStatus === "PREGANACY_STATUS_PREGNANT" || pregnancyStatus === "PREGANACY_STATUS_BREASTFEEDING") return true;
  const age = resolveAge(ctx.parent);
  return age !== null && age <= 15;
};

export const buildValidationSchema = (isNewPatient) => {
  const demographicFields = isNewPatient
    ? {
      surname: yup.string(),
      firstName: yup.string(),
      dobType: yup
        .string()
        .oneOf(["Actual", "Estimated"], "Please select Actual or Estimated")
        .required("Please select Actual or Estimated"),
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

      age: yup.mixed().test(
        "age-required-when-estimated",
        "Age is required",
        function (value) {
          if (this.parent.dobType?.toLowerCase() !== "estimated") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Age is required" });
          const n = Number(value);
          if (isNaN(n) || n < 0) return this.createError({ message: "Age must be a non-negative number" });
          if (n > 130) return this.createError({ message: "Age must be 130 or less" });
          return true;
        }
      ),

      sex: yup.string().required("Sex is required"),
      phoneNumber: yup.string(),
      maritalStatus: yup.string(),
      numberOfWives: yup.mixed().test(
        "num-wives-conditional",
        "Number of wives is required and must be at least 1",
        function (value) {
          const { sex, maritalStatus } = this.parent;
          if (sex !== "SEX_MALE" || maritalStatus !== "MARITAL_STATUS_MARRIED") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Number of wives is required" });
          if (Number(value) < 1) return this.createError({ message: "Number of wives must be at least 1" });
          return true;
        }
      ),
      numberOfCoWives: yup.mixed().test(
        "num-co-wives-conditional",
        "Number of co-wives is required",
        function (value) {
          const { sex, maritalStatus } = this.parent;
          if (sex !== "SEX_FEMALE" || maritalStatus !== "MARITAL_STATUS_MARRIED") return true;
          if (value === "" || value === undefined || value === null)
            return this.createError({ message: "Number of co-wives is required" });
          if (Number(value) < 0) return this.createError({ message: "Must be 0 or more" });
          return true;
        }
      ),
      numberOfBiologicalChildren: yup.mixed().test(
        "num-children-non-negative",
        "Must be 0 or more",
        (value) => value === "" || value === undefined || value === null || Number(value) >= 0
      ),
      pregnancyStatus: yup.mixed().test(
        "pregnancy-required-for-female",
        "Pregnancy status is required",
        function (value) {
          if (this.parent.sex !== "SEX_FEMALE") return true;
          return !!value || this.createError({ message: "Pregnancy status is required for female clients" });
        }
      ),
      breastfeedingDuration: yup.mixed().test(
        "breastfeeding-duration-conditional",
        "Duration of breastfeeding is required",
        function (value) {
          if (this.parent.pregnancyStatus !== "PREGANACY_STATUS_BREASTFEEDING") return true;
          return !!value || this.createError({ message: "Duration of breastfeeding is required" });
        }
      ),
      clientState: yup.string(),
      clientLga: yup.string(),
      address: yup.string(),
      landmark: yup.string(),
    }
    : {};

  return yup.object({
    ...demographicFields,
    dateOfVisit: yup
      .date()
      .max(new Date(), "Date of visit cannot be in the future")
      .test(
        "visit-not-before-dob",
        "Date of visit cannot be earlier than date of birth",
        function (value) {
          const { dateOfBirth } = this.parent;
          if (!value || !dateOfBirth) return true;
          return toLocalDateString(value) >= toLocalDateString(dateOfBirth);
        }
      )
      .test(
        "visit-not-before-registration",
        "Date of visit cannot be earlier than date of registration",
        function (value) {
          const { dateOfRegistration } = this.parent;
          if (!value || !dateOfRegistration) return true;
          return toLocalDateString(value) >= toLocalDateString(dateOfRegistration);
        }
      )
      .required("Date of visit is required"),

    clientCode: yup.string().required("Client code could not be generated. Fill in Setting, sub-type, Date of Visit, and Serial Number"),
    
    serialNumber: yup
      .string()
      .required("Serial number is required to generate a client code")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Serial number must contain only letters and numbers — no special characters"
      ),


    setting: yup.string().required("Setting is required"),
    typeOfSession: yup.string().required("Type of session is required"),
    facilitySetting: yup.mixed().test(
      "facility-setting-conditional",
      "Facility setting is required",
      function (value) {
        if (this.parent.setting !== "HTS_ENTRY_POINT_FACILITY") return true;
        return !!value || this.createError({ message: "Facility setting is required" });
      }
    ),
    communityEntryPoint: yup.mixed().test(
      "community-entry-conditional",
      "Community entry point is required",
      function (value) {
        if (this.parent.setting !== "HTS_ENTRY_POINT_COMMUNITY") return true;
        return !!value || this.createError({ message: "Community entry point is required" });
      }
    ),
    indexTesting: yup.mixed().test(
      "index-testing-conditional",
      "Please indicate whether this is index testing",
      function (value) {
        if (this.parent.typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING") return true;
        return !!value || this.createError({ message: "Index testing selection is required" });
      }
    ),
    indexRelationship: yup.mixed().test(
      "index-relationship-conditional",
      "Relationship of index client is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING" || indexTesting !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "Relationship of index client is required" });
      }
    ),
    indexClientCode: yup.mixed().test(
      "index-client-code-conditional",
      "Index client code/ID is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING" || indexTesting !== "YES_NO_YES") return true;
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
    timeOfLastNegativeTest: yup.mixed().test(
      "time-last-negative-conditional",
      "Time of last negative test is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.previouslyTestedNegative !== "YES_NO_YES") return true;
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
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    unprotectedVaginalSex: yup.mixed().test(
      "vaginal-sex-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex !== "SEX_FEMALE") return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    unprotectedAnalSex: yup.mixed().test(
      "anal-sex-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
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
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    historyOfSTI: yup.mixed().test(
      "sti-history-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
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
    complaintsVaginalDischarge: yup.mixed().test(
      "vaginal-discharge-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex !== "SEX_FEMALE") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    complaintsLowerAbdominalPain: yup.mixed().test(
      "lower-abdominal-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex !== "SEX_FEMALE") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    complaintsUrethralDischarge: yup.mixed().test(
      "urethral-discharge-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex !== "SEX_MALE") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    complaintsScroralSwelling: yup.mixed().test(
      "scrotal-swelling-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.sex !== "SEX_MALE") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
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
    partnerNewlyDiagnosed: yup.mixed().test(
      "partner-new-dx-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    partnerPregnantOnArv: yup.mixed().test(
      "partner-pmtct-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    adolescentHivPositive: yup.mixed().test(
      "adolescent-hiv-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        // Use resolveAge so the check works whether age comes from the
        // age field or is derived from dateOfBirth (avoids invisible required error)
        const age = resolveAge(this.parent);
        if (age === null || age < 10 || age > 19) return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    partnerNotRegularlyOnDrugs: yup.mixed().test(
      "partner-not-drugs-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    partnerRecentlyReturnedToTreatment: yup.mixed().test(
      "partner-ltfu-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    hadSexWithHivPositivePartnerInRiskGroup: yup.mixed().test(
      "had-sex-with-hiv-conditional",
      "This field is required",
      function (value) {
        if (skipKnowledgeAndRisk(this)) return true;
        if (this.parent.everHadSexualIntercourse !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "This field is required" });
      }
    ),
    typeOfHivTestDone: yup.string().required("This field is required"),
    hivEarlyDetectResult: yup.mixed().test(
      "earlyDetectResult-conditional",
      "HIV Early Detect Result is required",
      function (value) {
        if (this.parent.typeOfHivTestDone !== "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT") return true;
        return !!value || this.createError({ message: "HIV Early Detect Result is required" });
      }
    ),
    initialHivTest: yup.mixed().test(
      "initialHivTest-conditional",
      "Initial HIV test result is required",
      function (value) {
        // Only required on Path B (Early Detect = NO)
        if (this.parent.typeOfHivTestDone !== "TYPE_OF_HIV_TEST_RAPID_ANTIBODY") return true;
        return !!value || this.createError({ message: "Initial HIV test result is required" });
      }
    ),

    suspectedAcuteInfection: yup.mixed().test(
      "acute-infection-conditional",
      "This field is required",
      function (value) {
        const { hivEarlyDetectResult } = this.parent;
        const isAcutePath =
          hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" ||
          hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";
        if (!isAcutePath) return true;
        return !!value || this.createError({ message: "Suspected Acute Infection is required" });
      }
    ),

    confirmatoryHivTest: yup.mixed().test(
      "confirmatory-conditional",
      "Confirmatory HIV test is required",
      function (value) {
        const { initialHivTest, hivEarlyDetectResult } = this.parent;
        const needsConfirmatory =
          initialHivTest === "STI_HIV_RESULT_POSITIVE" ||
          hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE";
        if (!needsConfirmatory) return true;
        return !!value || this.createError({ message: "Confirmatory HIV test is required" });
      }
    ),


    recencyTest: yup.string(),
    previouslyTestedThisYear: yup.string().required("This field is required"),
    clientReceivedTestResult: yup.string().required("This field is required"),
    hivTestKitsProvided: yup.string().required("This field is required"),
    categoryOfClients: yup.mixed().test(
      "categoryOfClients-conditional",
      "Category of client is required",
      function (value) {
        if (this.parent.hivTestKitsProvided !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "Category of client is required when HIV self test kit provided to client is yes" });
      }
    ),
    acceptedIndexTesting: yup.mixed().test(
      "acceptedIndextesting-conditional",
      "Accepted Index testing is required",
      function (value) {
        if (this.parent.confirmatoryHivTest?.toLowerCase() !== "hiv_confirmatory_test_result_positive") return true;
        return !!value || this.createError({ message: "Accepted Index testing is required when confirmatory HIV test is positive" });
      }
    ),
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