/**
 * ictEncounterPayload.js
 */
const toIntOrNull = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

export const buildIctEncounterPayload = (values) => {
  const isAccepted =
    values.offeredPns?.toLowerCase() === "yes" &&
    values.acceptedPns?.toLowerCase() === "yes";

  return {
    patientId: values.patientId != null ? Number(values.patientId) : null,
    facilityId: values.facilityId != null ? Number(values.facilityId) : null,
    htsEncounterId: values.htsEncounterId != null ? Number(values.htsEncounterId) : null,

    dateOfService: values.dateOfService || null,
    setting: values.setting || null,
    facilitySetting:
      values.setting?.toLowerCase() === "facility"
        ? values.facilitySetting || null
        : null,
    communityEntryPoint:
      values.setting?.toLowerCase() === "community"
        ? values.communityEntryPoint || null
        : null,
    artClinic: values.isOnArt ? values.artClinic || null : null,

    // JSONB fields
    facilityName: values.facilityName || null,
    state: values.state || null,
    lga: values.lga || null,

    indexClientId: values.indexClientId || null,
    artUniqueId: values.artUniqueId || null,
    indexFirstName: values.indexFirstName || null,
    indexMiddleName: values.indexMiddleName || null,
    indexSurname: values.indexSurname || null,
    indexSex: values.indexSex || null,
    indexDob: values.indexDob || null,
    indexAge: toIntOrNull(values.indexAge),
    indexPhone: values.indexPhone || null,
    indexAltPhone: values.indexAltPhone || null,
    indexAddress: values.indexAddress || null,

    clientCategory: values.clientCategory || null,
    clientCategoryOther:
      values.clientCategory?.toLowerCase() === "other"
        ? values.clientCategoryOther || null
        : null,
    offeredPns: values.offeredPns || null,
    acceptedPns:
      values.offeredPns?.toLowerCase() === "yes"
        ? values.acceptedPns || null
        : null,

    contacts: isAccepted
      ? (values.contacts || []).map((c) => buildContactPayload(c))
      : [],
  };
};

const buildContactPayload = (c) => {
  const isKnownPositive = c.knownHivPositive?.toLowerCase() === "yes";
  const isKnownNegative = c.knownHivPositive?.toLowerCase() === "no";
  const contactOnArt    = c.onArt?.toLowerCase() === "yes";
  const newTestPositive = c.hivTestResult?.toLowerCase() === "positive";

  return {
    contactCode: c.contactCode || null,
    firstName: c.firstName || null,
    middleName: c.middleName || null,
    surname: c.surname || null,
    relationshipToIndex: c.relationshipToIndex || null,
    sex: c.sex || null,
    phone: c.phone || null,
    address: c.address || null,
    sameAddressAsIndex: !!c.sameAddressAsIndex,
    notificationMethod: c.notificationMethod || null,
    followUpLocation: c.followUpLocation || null,
    attempts:
      c.attempts !== "" && c.attempts != null
        ? parseInt(c.attempts, 10)
        : 0,
    knownHivPositive: c.knownHivPositive || null,
    hivTestResult: isKnownNegative ? c.hivTestResult || null : null,
    dateTestedHiv: c.dateTestedHiv || null,
    dateEnrolledArt:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.dateEnrolledArt || null
        : null,
    artClinic:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.artClinic || null
        : null,
    onArt: c.onArt || null,
    enrolledInOvc: !!c.enrolledInOvc,
    dateEnrolledOvc: c.enrolledInOvc ? c.dateEnrolledOvc || null : null,
    ovcId: c.enrolledInOvc ? c.ovcId || null : null,
  };
};