const SETTING_PREFIX_MAP = {
  "HTS_ENTRY_POINT_FACILITY": "FC",
  "HTS_ENTRY_POINT_COMMUNITY": "CM",
  "HTS_ENTRY_POINT_OTHERS": "OT",
};

const getSubtypeCode = (setting, facilitySetting, communityEntryPoint) => {
  // "Others" has no subtype segment
  if (setting === "HTS_ENTRY_POINT_OTHERS") return null;

  const subtype =
    setting === "HTS_ENTRY_POINT_FACILITY" ? facilitySetting :
      setting === "HTS_ENTRY_POINT_COMMUNITY" ? communityEntryPoint :
        null;

  if (!subtype) return null;

  if (subtype.includes("SETTING_STI")) return "STI";
  if (subtype.includes("EMERGENCY")) return "EME";
  if (subtype.includes("SETTING_INDEX")) return "IND";
  if (subtype.includes("INPATIENT") || subtype.includes("NPATIENT")) return "INP";
  if (subtype.includes("PMTCT")) return "PMTCT";
  if (subtype.includes("TB")) return "TB";
  if (subtype.includes("VCT")) return "VCT";
  if (subtype.includes("MOBILE")) return "MOB";
  if (subtype.includes("SETTING_SNS")) return "SNS";
  if (subtype.includes("SETTING_ANC")) return "ANC";
  if (subtype.includes("RETESTING")) return "RET";
  if (subtype.includes("SETTING_L&D")) return "L&D";
  if (subtype.includes("POST_NATAL_WARD_BREASTFEEDING")) return "PNWB";
  if (subtype.includes("SETTING_CT")) return "CT";
  if (subtype.includes("SETTING_FP")) return "FP";
  if (subtype.includes("BLOOD_BANK")) return "BB";
  if (subtype.includes("PEDIATRIC")) return "PED";
  if (subtype.includes("MALNUTRITION")) return "MAL";
  if (subtype.includes("PREP_TESTING")) return "PrEPT";
  if (subtype.includes("SPOKE_HEALTH_FACILITY")) return "SPHF";
  if (subtype.includes("STANDALONE")) return "STAN";
  if (subtype.includes("CONGREGATIONAL")) return "CON";
  if (subtype.includes("DELIVERY_HOMES")) return "DEL";
  if (subtype.includes("TBA_ORTHODOX")) return "TBAO";
  if (subtype.includes("TBA_RT-HCW")) return "TBAH";
  if (subtype.includes("SETTING_OVC")) return "OVC";
  if (subtype.includes("OUTREACH")) return "OUT";
  if (subtype.includes("OTHER")) return "OTH";

  return null;
};

export const generateClientCode = (
  setting,
  facilitySetting,
  communityEntryPoint,
  dateOfVisit,
  facilityCode,
  serialNumber
) => {
  const settingPrefix = SETTING_PREFIX_MAP[setting];
  if (!settingPrefix 
    // || !facilityCode 
    || !serialNumber || !dateOfVisit) return null;

  const date = new Date(dateOfVisit);
  if (isNaN(date.getTime())) return null;

  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const subtypeCode = getSubtypeCode(setting, facilitySetting, communityEntryPoint);

  // "Others" has no subtype
  const segments =
    setting === "HTS_ENTRY_POINT_OTHERS"
      ? [settingPrefix, yyyy, mm, serialNumber]
      : subtypeCode
        ? [settingPrefix, subtypeCode, yyyy, mm, serialNumber]
        : null; // facility/community selected but subtype not yet chosen

  if (!segments) return null;

  return segments.join("/");
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
    serialNumber,
    setting,
    facilitySetting,
    facilityName,
    communityEntryPoint,
    typeOfSession,
    htsPopulationType,
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
    typeOfHivTestDone,
    hivEarlyDetectResult,
    initialHivTest,
    suspectedAcuteInfection,
    confirmatoryHivTest,
    syphilisTestResult,
    recencyTest,
    finalHivTestResult,
    dateOfFinalHivTestDone,

    // Post-Test Counselling
    previouslyTestedThisYear,
    clientReceivedTestResult,
    hivTestKitsProvided,
    categoryOfClients,
    numberOfHivstKitDistributed,
    acceptedIndexTesting,
    providedFpInfo,
    clientPartnerUseFpMethods,
    clientPartnerUseCondoms,
    correctCondomUseDemonstrated,
    condomsProvided,
    clientReferredToOtherServices,
    completedBy,
    designation,
    currentOrganisationUnitId,

  } = formValues;

  const payload = {
    dateOfVisit,
    clientCode,
    facilityId: currentOrganisationUnitId ? parseInt(currentOrganisationUnitId, 10) : null,
    setting,
    facilitySetting,
    facilityName,
    communityEntryPoint,
    typeOfSession,
    htsPopulationType,
    indexTesting,
    indexRelationship,
    indexClientCode,
    // surname,
    // firstName,
    // middleName,
    // dobType,
    // dateOfBirth,
    // age: age
    //   ? parseInt(age, 10)
    //   : dateOfBirth
    //     ? (() => {
    //         const birth = new Date(dateOfBirth);
    //         if (isNaN(birth.getTime())) return null;
    //         const now = new Date();
    //         let years = now.getFullYear() - birth.getFullYear();
    //         const m = now.getMonth() - birth.getMonth();
    //         if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
    //         return years >= 0 ? years : null;
    //       })()
    //     : null,
    // sex,
    // phoneNumber,
    // maritalStatus,
    numberOfWives: numberOfWives ? parseInt(numberOfWives, 10) : null,
    numberOfCoWives: numberOfCoWives ? parseInt(numberOfCoWives, 10) : null,
    numberOfBiologicalChildren: numberOfBiologicalChildren ? parseInt(numberOfBiologicalChildren, 10) : null,
    pregnancyStatus,
    breastfeedingDuration,
    // clientState,
    // clientLga,
    // address,
    // landmark,
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
    typeOfHivTestDone,
    hivEarlyDetectResult,
    initialHivTest,
    suspectedAcuteInfection,
    confirmatoryHivTest,
    syphilisTestResult,
    recencyTest,
    finalHivTestResult,
    dateOfFinalHivTestDone,
    previouslyTestedThisYear,
    clientReceivedTestResult,
    hivTestKitsProvided,
    categoryOfClients,
    numberOfHivstKitDistributed,
    acceptedIndexTesting,
    providedFpInfo,
    clientPartnerUseFpMethods,
    clientPartnerUseCondoms,
    correctCondomUseDemonstrated,
    condomsProvided,
    clientReferredToOtherServices,
    completedBy,
    designation,
    pmtctHts: isNewPatient ? (formValues?.pmtctHts ?? false) : formValues?.pmtctHts
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