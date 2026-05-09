/**
 * ictEncounterPayload.js
 *
 * All boolean guards use codeset code comparisons (e.g. "YES_NO_YES")
 * not plain English strings (e.g. "yes") to match what the form stores.
 */

const toIntOrNull = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

export const buildIctEncounterPayload = (values) => {
  // Use codeset codes for all guards — values are always codeset codes
  const offeredYes  = values.offeredPns  === "YES_NO_YES";
  const acceptedYes = values.acceptedPns === "YES_NO_YES";
  const isAccepted  = offeredYes && acceptedYes;

  const isFacility  = values.setting === "HTS_ENTRY_POINT_FACILITY";
  const isCommunity = values.setting === "HTS_ENTRY_POINT_COMMUNITY";

  return {
    patientId:       values.patientId  != null ? Number(values.patientId)  : null,
    facilityId:      values.facilityId != null ? Number(values.facilityId) : null,
    htsEncounterId:  values.htsEncounterId != null ? Number(values.htsEncounterId) : null,

    dateOfService: values.dateOfService || null,
    setting:       values.setting       || null,

    // Only send the relevant sub-setting based on the setting code
    facilitySetting:     isFacility  ? values.facilitySetting     || null : null,
    communityEntryPoint: isCommunity ? values.communityEntryPoint || null : null,

    // artClinic only when the index client is on ART
    artClinic: values.isOnArt ? values.artClinic || null : null,

    // Facility context — send numeric IDs for state/LGA, not display names
    facilityName: values.facilityName || null,
    state:        values.state        || null,   // stored as numeric id string e.g. "7"
    lga:          values.lga          || null,   // stored as numeric id string e.g. "156"

    // Index client fields
    indexClientId:   values.indexClientId   || null,
    artUniqueId:     values.artUniqueId     || null,
    indexFirstName:  values.indexFirstName  || null,
    indexMiddleName: values.indexMiddleName || null,
    indexSurname:    values.indexSurname    || null,
    indexSex:        values.indexSex        || null,  // codeset code e.g. "SEX_FEMALE"
    indexDob:        values.indexDob        || null,
    indexAge:        toIntOrNull(values.indexAge),
    indexPhone:      values.indexPhone      || null,
    indexAltPhone:   values.indexAltPhone   || null,
    indexAddress:    values.indexAddress    || null,

    clientCategory:      values.clientCategory || null,
    clientCategoryOther: values.clientCategory === "INDEX_CLIENT_CATEGORY_OTHER"
      ? values.clientCategoryOther || null
      : null,

    offeredPns:  values.offeredPns || null,
    // Only send acceptedPns when PNS was offered
    acceptedPns: offeredYes ? values.acceptedPns || null : null,

    // Only send contacts when both offered AND accepted
    contacts: isAccepted
      ? (values.contacts || []).map(buildContactPayload)
      : [],
  };
};

const buildContactPayload = (c) => {
  const isKnownPositive = c.knownHivPositive === "YES_NO_YES";
  const isKnownNegative = c.knownHivPositive === "YES_NO_NO";
  const contactOnArt    = c.onArt            === "YES_NO_YES";
  const newTestPositive = c.hivTestResult     === "HIV_TEST_RESULT_POSITIVE";

  const needsArtFields = isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt;

  return {
    contactCode:         c.contactCode         || null,
    firstName:           c.firstName           || null,
    middleName:          c.middleName           || null,
    surname:             c.surname             || null,
    relationshipToIndex: c.relationshipToIndex || null,
    sex:                 c.sex                 || null,  // codeset code e.g. "SEX_FEMALE"
    phone:               c.phone               || null,
    address:             c.address             || null,
    sameAddressAsIndex:  !!c.sameAddressAsIndex,
    notificationMethod:  c.notificationMethod  || null,
    followUpLocation:    c.followUpLocation    || null,
    attempts:            c.attempts !== "" && c.attempts != null ? parseInt(c.attempts, 10) : 0,
    knownHivPositive:    c.knownHivPositive    || null,
    // hivTestResult only relevant when known negative (new test result)
    hivTestResult:       isKnownNegative ? c.hivTestResult || null : null,
    dateTestedHiv:       c.dateTestedHiv       || null,
    // ART fields only when applicable
    dateEnrolledArt:     needsArtFields ? c.dateEnrolledArt || null : null,
    artClinic:           needsArtFields ? c.artClinic       || null : null,
    onArt:               c.onArt               || null,
    enrolledInOvc:       !!c.enrolledInOvc,
    dateEnrolledOvc:     c.enrolledInOvc ? c.dateEnrolledOvc || null : null,
    ovcId:               c.enrolledInOvc ? c.ovcId          || null : null,
  };
};