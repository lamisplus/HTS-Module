/**
 * ictEncounterPayload.js
 *
 * Builds the flat API request payload from ICT Formik values.
 * Matches the IctEncounterRequest DTO shape exactly:
 *   - All index client fields are flat top-level keys (not nested under indexClient)
 *   - contacts array uses the field names from IctContactRequest
 *   - Null-guards applied for all conditional fields
 *
 * Fixes applied:
 *   [1] contactAge  — parseInt to Integer  (was `|| null`, sent raw string; broke @NotNull Integer)
 *   [2] personId    — Number() cast        (was raw string from Formik; backend expects Long)
 *   [3] htsEncounterId — explicit null placeholder so callers cannot silently omit it
 *   [4] contactOnArt   — null fallback     (was bare `c.contactOnArt`, could send undefined)
 *   [5] indexAge    — safe null check      (was falsy `?` check, broke on age 0)
 *   [6] contactAge  — safe null check      (was `|| null`, broke on age 0)
 */

/**
 * Safe integer parser.
 * Returns null when val is null / undefined / empty string.
 * Correctly handles 0.
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
    // ── Person & facility linkage ────────────────────────────────────────────
    // FIX [2]: cast personId to Number — backend expects Long, Formik gives string
    personId: values.personId != null ? Number(values.personId) : null,
    facilityId:
      values.currentOrganisationUnitId != null
        ? Number(values.currentOrganisationUnitId)
        : null,

    // FIX [3]: explicit null so the caller (IctForm.jsx) is forced to overwrite
    // this field with htsRecord.id after the HTS form submits.
    // Leaving it absent caused silent unlinked ICT saves when callers forgot.
    htsEncounterId: null,

    // ── Section A: Visit & Setting ──────────────────────────────────────────
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

    // ── Section A: Facility context (stored in JSONB on backend) ─────────────
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
    // FIX [5]: was `values.indexAge ? parseInt(...)` — falsy check sent null for age 0
    indexAge: toIntOrNull(values.indexAge),
    indexPhone: values.indexPhone || null,
    indexAltPhone: values.indexAltPhone || null,
    indexAddress: values.indexAddress || null,

    // ── Section A: Category & Index Testing Services ────────────────────────
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
  const isKnownNegative = c.knownHivPositive?.toLowerCase() === "no";
  const contactOnArt    = c.contactOnArt?.toLowerCase() === "yes";
  const newTestPositive = c.hivTestResult?.toLowerCase() === "positive";
  const isUnder15       = c.contactAgeGroup === "<15";

  return {
    contactId:            c.contactId || null,
    firstnameOfContact:   c.firstnameOfContact || null,
    middlenameOfContact:  c.middlenameOfContact || null,
    surnameOfContact:     c.surnameOfContact || null,
    relationshipToIndex:  c.relationshipToIndex || null,
    contactSex:           c.contactSex || null,
    contactAgeGroup:      c.contactAgeGroup || null,

    // FIX [1] + [6]: was `c.contactAge || null` — sent raw string AND broke on age 0.
    // Backend @NotNull Integer requires a parsed integer, never a string.
    contactAge: toIntOrNull(c.contactAge),

    contactPhone:         c.contactPhone || null,
    contactAddress:       c.contactAddress || null,
    sameAddressAsIndex:   !!c.sameAddressAsIndex,
    notificationMethod:   c.notificationMethod || null,
    followUpLocation:     c.followUpLocation || null,
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

    // ART enrolment: required when known positive OR newly tested positive OR on ART
    dateEnrolledArt:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.dateEnrolledArt || null
        : null,

    contactArtClinic:
      isKnownPositive || (isKnownNegative && newTestPositive) || contactOnArt
        ? c.contactArtClinic || null
        : null,

    // FIX [4]: was bare `c.contactOnArt` — could send undefined if user skipped field
    contactOnArt: c.contactOnArt || null,

    // OVC: only applicable when contact is under 15
    enrolledInOvc:   isUnder15 ? !!c.enrolledInOvc : false,
    dateEnrolledOvc: isUnder15 && c.enrolledInOvc ? c.dateEnrolledOvc || null : null,
    ovcId:           isUnder15 && c.enrolledInOvc ? c.ovcId || null : null,
  };
};