/**
 * ictEncounterPayload.js
 *
 * Builds the API request payload from ICT Formik values.
 * Call this just before POST /api/v1/ict-encounter (or equivalent).
 */

export const buildIctEncounterPayload = (values) => {
  const {
    facilityName,
    state,
    lga,
    indexClientId,
    indexFirstName,
    indexMiddleName,
    indexSurname,
    indexSex,
    indexDob,
    indexAge,
    indexPhone,
    indexAltPhone,
    indexAddress,
    artUniqueId,
    isOnArt,
    dateOfService,
    setting,
    facilitySetting,
    communityEntryPoint,
    artClinic,
    clientCategory,
    clientCategoryOther,
    offeredPns,
    acceptedPns,
    contacts,
  } = values;

  return {
    // Section A
    facilityName,
    state,
    lga,
    dateOfService,
    setting,
    facilitySetting: setting === "Facility" ? facilitySetting : null,
    communityEntryPoint: setting === "Community" ? communityEntryPoint : null,
    artClinic: isOnArt ? artClinic : null,
    indexClient: {
      indexClientId,
      firstName: indexFirstName,
      middleName: indexMiddleName,
      surname: indexSurname,
      sex: indexSex,
      dateOfBirth: indexDob,
      age: indexAge ? parseInt(indexAge, 10) : null,
      phoneNumber: indexPhone,
      alternatePhone: indexAltPhone || null,
      address: indexAddress,
      artUniqueId: artUniqueId || null,
    },
    clientCategory,
    clientCategoryOther: clientCategory === "Other" ? clientCategoryOther : null,
    offeredPns,
    acceptedPns: offeredPns === "Yes" ? acceptedPns : null,

    // Section B — only included when PNS was accepted
    contacts:
      acceptedPns === "Yes"
        ? contacts.map((c) => ({
            contactId: c.contactId,
            nameOfContact: c.nameOfContact,
            relationshipToIndex: c.relationshipToIndex,
            sex: c.contactSex,
            ageGroup: c.contactAgeGroup,
            address: c.contactAddress || null,
            phoneNumber: c.contactPhone || null,
            sameAddressAsIndex: !!c.sameAddressAsIndex,
            notificationMethod: c.notificationMethod,
            followUpLocation: c.followUpLocation,
            attempts: c.attempts !== "" ? parseInt(c.attempts, 10) : null,
            knownHivPositive: c.knownHivPositive,
            dateTestedHiv: c.dateTestedHiv || null,
            hivTestResult: c.knownHivPositive === "No" ? c.hivTestResult : null,
            dateEnrolledArt:
              c.knownHivPositive === "Yes" || c.hivTestResult === "Positive"
                ? c.dateEnrolledArt
                : null,
            enrolledInOvc: c.contactAgeGroup === "<15" ? !!c.enrolledInOvc : false,
            dateEnrolledOvc:
              c.contactAgeGroup === "<15" && c.enrolledInOvc
                ? c.dateEnrolledOvc
                : null,
            ovcId:
              c.contactAgeGroup === "<15" && c.enrolledInOvc ? c.ovcId : null,
          }))
        : [],
  };
};
