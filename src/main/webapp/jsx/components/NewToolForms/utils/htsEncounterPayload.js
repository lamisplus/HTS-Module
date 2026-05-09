// utils/htsEncounterPayload.js

/**
 * Derives a short alphabetic abbreviation from a setting label.
 * e.g. "Facility" → "F", "Community" → "C", "Home Based" → "HB"
 */
const toSettingAbbr = (setting) => {
  if (!setting) return "HTS";
  return setting
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
};

/**
 * Generates a unique HTS Client Code in the format:
 *   {SettingAbbr}01/{YY}/{MM}/{4-digit-random}{2-random-letters}
 *
 * Example: FC01/25/08/0047XR
 *
 * @param {string} setting      — value of the `setting` form field
 * @param {string} dateOfVisit  — ISO date string e.g. "2025-08-14"
 * @returns {string}
 */
export const generateClientCode = (setting, dateOfVisit) => {
  const abbr = toSettingAbbr(setting);
  const FACILITY_CODE = "01";

  const date = dateOfVisit ? new Date(dateOfVisit) : new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const serial = String(Math.floor(Math.random() * 9000) + 1000); // 1000–9999
  const letters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");

  return `${abbr}${FACILITY_CODE}/${yy}/${mm}/${serial}${letters}`;
};

export function arrayToObject(arr) {
  return arr.reduce((acc, item) => {
    acc[item.display] = item.id;
    return acc;
  }, {});
}

/**
 * Builds the request payload for HTS Encounter API from Formik values.
 * @param {Object} formValues - The values from Formik (useNewPatientFormik or useExistingPatientFormik).
 * @param {boolean} isNewPatient - True if creating a new patient (patientId absent), false otherwise.
 * @returns {Object} Payload ready to send to POST /api/v1/hts-encounter
 */
export const buildHtsEncounterPayload = (formValues, isNewPatient) => {
  const {
    patientId,
    dateOfVisit,
    clientCode,
    setting,
    facilitySetting,
    facilityName,
    communityEntryPoint,
    // modality,
    typeOfSession,
    indexTesting,
    indexRelationship,
    indexClientCode,

    // Demographics (used for validation and person creation)
    surname,
    firstName,
    middleName,
    dobType,
    dateOfBirth,
    age,
    sex,
    sexCode,
    phoneNumber,
    maritalStatus,
    maritalStatusCode,
    numberOfWives,
    numberOfCoWives,
    numberOfBiologicalChildren,
    pregnancyStatus,
    breastfeedingDuration,
    clientState,
    clientLga,
    address,
    landmark,

    // Knowledge Assessment
    previouslyTestedNegative,
    timeOfLastNegativeTest,
    clientInformedTransmissionRoutes,
    clientInformedRiskFactors,
    clientInformedPreventionMethods,
    clientInformedPossibleResults,
    informedConsentGiven,

    // Personal HIV Risk Assessment
    everHadSexualIntercourse,
    moreThanOneSexPartner,
    unprotectedVaginalSex,
    unprotectedAnalSex,
    bloodTransfusionLast3Months,
    sexUnderInfluence,
    historyOfSTI,

    // TB Screening
    currentCough,
    weightLoss,
    fever,
    nightSweats,

    // STI Screening
    complaintsVaginalDischarge,
    complaintsLowerAbdominalPain,
    complaintsUrethralDischarge,
    complaintsScroralSwelling,
    complaintsGenitalSores,
    complaintsSwollenLymphNodes,

    // Sex Partner Risk Assessment
    partnerNewlyDiagnosed,
    partnerPregnantOnArv,
    adolescentHivPositive,
    partnerNotRegularlyOnDrugs,
    partnerRecentlyReturnedToTreatment,
    hadSexWithHivPositivePartnerInRiskGroup,

    // Diagnostic Testing
    hivEarlyDetectTestDone,
    hivEarlyDetectResult,
    initialHivTest,
    suspectedAcuteInfection,
    confirmatoryHivTest,
    syphilisTestResult,
    recencyTest,

    // Post-Test Counselling
    previouslyTestedThisYear,
    clientReceivedTestResult,
    hivTestKitsProvided,
    categoryOfClients,
    acceptedIndexTesting,
    providedFpInfo,
    clientPartnerUseFpMethods,
    clientPartnerUseCondoms,
    correctCondomUseDemonstrated,
    condomsProvided,
    clientReferredToOtherServices,
    completedBy,
    designation,
    currentOrganisationUnitId
  } = formValues;


  const payload = {
    dateOfVisit,
    clientCode,
    facilityId: currentOrganisationUnitId ? parseInt(currentOrganisationUnitId, 10) : null,
    setting,
    facilitySetting,
    facilityName,
    communityEntryPoint,
    // modality,
    typeOfSession,
    indexTesting,
    indexRelationship,
    indexClientCode,
    surname,
    firstName,
    middleName,
    dobType,
    dateOfBirth,
    age: age
      ? parseInt(age, 10)
      : dateOfBirth
        ? (() => {
          const birth = new Date(dateOfBirth);
          if (isNaN(birth.getTime())) return null;
          const now = new Date();
          let years = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
          return years >= 0 ? years : null;
        })()
        : null,
    sex,
    phoneNumber,
    maritalStatus,
    numberOfWives: numberOfWives ? parseInt(numberOfWives, 10) : null,
    numberOfCoWives: numberOfCoWives ? parseInt(numberOfCoWives, 10) : null,
    numberOfBiologicalChildren: numberOfBiologicalChildren ? parseInt(numberOfBiologicalChildren, 10) : null,
    pregnancyStatus,
    breastfeedingDuration,
    clientState,
    clientLga,
    address,
    landmark,
    previouslyTestedNegative,
    timeOfLastNegativeTest,
    clientInformedTransmissionRoutes,
    clientInformedRiskFactors,
    clientInformedPreventionMethods,
    clientInformedPossibleResults,
    informedConsentGiven,
    everHadSexualIntercourse,
    moreThanOneSexPartner,
    unprotectedVaginalSex,
    unprotectedAnalSex,
    bloodTransfusionLast3Months,
    sexUnderInfluence,
    historyOfSTI,
    currentCough,
    weightLoss,
    fever,
    nightSweats,
    complaintsVaginalDischarge,
    complaintsLowerAbdominalPain,
    complaintsUrethralDischarge,
    complaintsScroralSwelling,
    complaintsGenitalSores,
    complaintsSwollenLymphNodes,
    partnerNewlyDiagnosed,
    partnerPregnantOnArv,
    adolescentHivPositive,
    partnerNotRegularlyOnDrugs,
    partnerRecentlyReturnedToTreatment,
    hadSexWithHivPositivePartnerInRiskGroup,
    hivEarlyDetectTestDone,
    hivEarlyDetectResult,
    initialHivTest,
    suspectedAcuteInfection,
    confirmatoryHivTest,
    syphilisTestResult,
    recencyTest,
    previouslyTestedThisYear,
    clientReceivedTestResult,
    hivTestKitsProvided,
    categoryOfClients,
    acceptedIndexTesting,
    providedFpInfo,
    clientPartnerUseFpMethods,
    clientPartnerUseCondoms,
    correctCondomUseDemonstrated,
    condomsProvided,
    clientReferredToOtherServices,
    completedBy,
    designation,
  };

  if (!isNewPatient) {
    payload.patientId = patientId;
  } else {
    payload.person = {
      surname,
      firstName,
      otherName: middleName,
      dateOfBirth: dobType?.toLowerCase() === 'actual' ? dateOfBirth : null,
      isDateOfBirthEstimated: dobType?.toLowerCase() === 'estimated',
      sexId: sexCode,
      genderId: sexCode,
      phoneNumber,
      maritalStatusId: maritalStatusCode,
      address: [
        {
          city: address,
          district: clientLga,
          stateId: String(clientState),
          countryId: 1,
          line: [landmark],
          postalCode: '',
          organisationUnitId: "",
        },
      ],
      contact: [],
      contactPoint: [
        {
          type: 'phone',
          value: phoneNumber,
        },
      ],
      dateOfRegistration: dateOfVisit,
      facilityId: currentOrganisationUnitId,
      organizationId: "",
      active: true,
      deceased: false,
      deceasedDateTime: null,
      educationId: null,
      employmentStatusId: null,
      identifier: [
        {
          assignerId: 1,
          type: 'HospitalNumber',
          value: clientCode,
        },
      ],
    };

    if (dobType?.toLowerCase() === 'estimated') {
      delete payload.person.dateOfBirth;
    }
  }

  return payload;
};