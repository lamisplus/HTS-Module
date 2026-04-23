/**
 * ictEncounterPayload.js
 *
 * Builds the flat API request payload from ICT Formik values.
 * Matches the IctEncounterRequest DTO shape exactly:
 *   - All index client fields are flat top-level keys (not nested under indexClient)
 *   - contacts array uses the field names from IctContactRequest
 *   - Null-guards applied for all conditional fields
 */

export const buildIctEncounterPayload = (values) => {
  const isAccepted =
    values.offeredPns?.toLowerCase() === "yes" &&
    values.acceptedPns?.toLowerCase() === "yes";

  return {
    // ── Person & facility linkage ────────────────────────────────────────────
    // personId always required. facilityId from currentOrganisationUnitId,
    // matching the same pattern used by the HTS payload builder.
    personId: values.personId ?? null,
    facilityId: values.currentOrganisationUnitId != null
      ? Number(values.currentOrganisationUnitId)
      : null,

    // htsEncounterId is attached by the caller (IctForm.jsx) from htsRecord.id
    // after the HTS form submits. We don't set it here to keep the builder pure.

    // ── Section A: Visit & Setting ──────────────────────────────────────────
    dateOfService: values.dateOfService || null,
    setting: values.setting || null,
    facilitySetting:
      values.setting?.toLowerCase() === "facility" ? values.facilitySetting || null : null,
    communityEntryPoint:
      values.setting?.toLowerCase() === "community" ? values.communityEntryPoint || null : null,
    artClinic: values.isOnArt ? values.artClinic || null : null,

    // ── Section A: Facility context (stored in JSONB on backend) ─────────────
    // These three are display values needed to re-populate the form on view/edit.
    // state and lga are the human-readable names resolved by IctSectionA at fill time.
    facilityName: values.facilityName || null,
    state: values.state || null,
    lga: values.lga || null,

    // ── Section A: Index Client Snapshot (flat, stored in JSONB on backend) ─
    indexClientId: values.indexClientId || null,
    artUniqueId: values.artUniqueId || null,
    indexFirstName: values.indexFirstName || null,
    indexMiddleName: values.indexMiddleName || null,
    indexSurname: values.indexSurname || null,
    indexSex: values.indexSex || null,
    indexDob: values.indexDob || null,
    indexAge: values.indexAge ? parseInt(values.indexAge, 10) : null,
    indexPhone: values.indexPhone || null,
    indexAltPhone: values.indexAltPhone || null,
    indexAddress: values.indexAddress || null,

    // ── Section A: Category & Index Testing Services ───────────────────────────────────────────
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

    // ── Section B: Contacts ─────────────────────────────────────────────────
    // Only included (and validated by backend) when offeredPns=Yes & acceptedPns=Yes
    contacts: isAccepted
      ? (values.contacts || []).map((c) => buildContactPayload(c))
      : [],
  };
};

const buildContactPayload = (c) => {
  const isKnownPositive = c.knownHivPositive?.toLowerCase() === "yes";
  const contactOnArt = c.contactOnArt?.toLowerCase() === "yes";
  const isKnownNegative = c.knownHivPositive?.toLowerCase() === "no";
  const newTestPositive = c.hivTestResult?.toLowerCase() === "positive";
  const isUnder15 = c.contactAgeGroup === "<15";

  return {
    contactId: c.contactId || null,
    firstnameOfContact: c.firstnameOfContact || null,
    middlenameOfContact: c.middlenameOfContact || null,
    surnameOfContact: c.surnameOfContact || null,
    relationshipToIndex: c.relationshipToIndex || null,
    contactSex: c.contactSex || null,
    contactAgeGroup: c.contactAgeGroup || null,
    contactAge: c.contactAge || null,
    contactPhone: c.contactPhone || null,
    contactAddress: c.contactAddress || null,
    sameAddressAsIndex: !!c.sameAddressAsIndex,
    notificationMethod: c.notificationMethod || null,
    followUpLocation: c.followUpLocation || null,
    attempts:
      c.attempts !== "" && c.attempts != null
        ? parseInt(c.attempts, 10)
        : 0,

    // HIV status
    knownHivPositive: c.knownHivPositive || null,

    // Only relevant when knownHivPositive = No
    hivTestResult: isKnownNegative ? c.hivTestResult || null : null,

    // Date of test: present for both known positive (previous test) and known negative (new test)
    dateTestedHiv: c.dateTestedHiv || null,

    // ART enrolment: required when known positive OR newly tested positive )
    dateEnrolledArt:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.dateEnrolledArt || null
        : null,

    contactArtClinic:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.contactArtClinic || null
        : null,

    contactOnArt: c.contactOnArt,

    // OVC: only applicable when contact is under 15
    enrolledInOvc: isUnder15 ? !!c.enrolledInOvc : false,
    dateEnrolledOvc:
      isUnder15 && c.enrolledInOvc ? c.dateEnrolledOvc || null : null,
    ovcId:
      isUnder15 && c.enrolledInOvc ? c.ovcId || null : null,
  };
};