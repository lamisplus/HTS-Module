/**
 * useIctFormik.js
 *
 * Formik hook for the ICT form.
 *
 * htsValues — the submitted/current HTS form values (passed from the parent
 *             HTS→ICT orchestrator). Used to pre-populate Section A read-only
 *             fields (name, sex, DOB, age, phone, address, clientCode, facilityName).
 *
 * onSubmit  — async handler, receives ICT payload.
 */

import { useFormik } from "formik";
import { buildIctValidationSchema } from "./ictValidationSchema";

/** Generate a unique Index Contact ID for each contact in Section B */
export const generateContactId = (indexClientId, sequence) => {
  const ts = Date.now().toString(36).toUpperCase();
  const seq = String(sequence).padStart(2, "0");
  return `ICT-${indexClientId || "X"}-${seq}-${ts}`;
};

/** Build a blank contact row with a pre-generated ID */
export const makeBlankContact = (indexClientId, existingCount) => ({
  contactId: generateContactId(indexClientId, existingCount + 1),
  nameOfContact: "",
  relationshipToIndex: "",
  contactSex: "",
  contactAgeGroup: "",
  contactAddress: "",
  contactPhone: "",
  sameAddressAsIndex: false,
  notificationMethod: "",
  followUpLocation: "",
  attempts: "",
  knownHivPositive: "",
  dateTestedHiv: "",
  hivTestResult: "",
  dateEnrolledArt: "",
  enrolledInOvc: false,
  dateEnrolledOvc: "",
  ovcId: "",
});

const buildInitialValues = (htsValues) => ({
  // ── Auto-populated from HTS (read-only in Section A) ──────────────────
  facilityName: htsValues?.facilityName || "",
  state: htsValues?.clientState || "",
  lga: htsValues?.clientLga || "",
  indexClientId: htsValues?.clientCode || "",
  indexFirstName: htsValues?.firstName || "",
  indexMiddleName: htsValues?.middleName || "",
  indexSurname: htsValues?.surname || "",
  indexSex: htsValues?.sex || "",
  indexDob: htsValues?.dateOfBirth || "",
  indexAge: htsValues?.age || "",
  indexPhone: htsValues?.phoneNumber || "",
  indexAltPhone: "",
  indexAddress: htsValues?.address || "",
  artUniqueId: htsValues?.artUniqueId || "",
  isOnArt: htsValues?.isOnArt || false,

  // ── Editable Section A fields ─────────────────────────────────────────
  dateOfService: "",
  setting: htsValues?.setting || "",
  facilitySetting: htsValues?.facilitySetting || "",
  communityEntryPoint: htsValues?.communityEntryPoint || "",
  artClinic: "",           // shown only when isOnArt=true
  clientCategory: "",
  clientCategoryOther: "",
  offeredPns: "",
  acceptedPns: "",

  // ── Section B ─────────────────────────────────────────────────────────
  contacts: [],
});

export const useIctFormik = (onSubmit, htsValues) => {
  const formik = useFormik({
    initialValues: buildInitialValues(htsValues),
    validationSchema: buildIctValidationSchema(),
    enableReinitialize: true,
    onSubmit,
  });
  return { formik };
};
