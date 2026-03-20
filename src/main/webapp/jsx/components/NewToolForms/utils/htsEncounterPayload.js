// utils/htsEncounterPayload.js

export function arrayToObject(arr) {
    return arr.reduce((acc, item) => {
      acc[item.display] = item.id;
      return acc;
    }, {});
  }

/**
 * Builds the request payload for HTS Encounter API from Formik values.
 * @param {Object} formValues - The values from Formik (useNewPatientFormik or useExistingPatientFormik).
 * @param {boolean} isNewPatient - True if creating a new patient (personId absent), false otherwise.
 * @param {Object} resolvers - Object containing functions to resolve IDs:
 *   - getSexId(sexString) => number
 *   - getMaritalStatusId(maritalStatusString) => number
 *   - getStateId(stateName) => number
 * @returns {Object} Payload ready to send to POST /api/v1/hts-encounter
 */
export const buildHtsEncounterPayload = (formValues, isNewPatient) => {
    const {
      personId,
      dateOfVisit,
      clientCode,
      setting,
      facilitySetting,
      facilityName,
      communityEntryPoint,
      modality,
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
  
      // Diagnostic Testing
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
      setting,
      facilitySetting,
      facilityName,
      communityEntryPoint,
      modality,
      typeOfSession,
      indexTesting,
      indexRelationship,
      indexClientCode,
      surname,
      firstName,
      middleName,
      dobType,
      dateOfBirth,
      age: age ? parseInt(age, 10) : null,
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
      payload.personId = personId;
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