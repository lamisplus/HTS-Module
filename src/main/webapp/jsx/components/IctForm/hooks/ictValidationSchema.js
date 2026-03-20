/**
 * ictValidationSchema.js
 *
 * Yup schema for the ICT form.
 *
 * Section A — index client details (mostly pre-populated, a few editable fields)
 * Section B — array of contacts, validated only when acceptedPns === "Yes"
 *
 * Skip-logic mirrors the UI exactly:
 *   • acceptedPns field only visible when offeredPns === "Yes"
 *   • Section B contacts only validated when acceptedPns === "Yes"
 *   • Per-contact: knownHivPositive=Yes → dateTestedHiv + dateEnrolledArt required
 *   • Per-contact: knownHivPositive=No → hivTestResult + dateTestedHiv required
 *   • Per-contact: hivTestResult=Positive → dateEnrolledArt required
 *   • Per-contact: ageGroup=<15 + enrolledInOvc=true → dateEnrolledOvc + ovcId required
 */

import * as yup from "yup";

const today = new Date();
today.setHours(23, 59, 59, 999);

const pastOrToday = (label) =>
  yup
    .string()
    .nullable()
    .test(`${label}-no-future`, `${label} cannot be a future date`, (val) => {
      if (!val) return true;
      return new Date(val) <= today;
    });

// ── Per-contact schema ──────────────────────────────────────────────────────

const contactSchema = yup.object({
  nameOfContact: yup
    .string()
    .required("Contact name is required")
    .test("min2", "Must contain at least 2 non-space characters", (v) =>
      !!v && v.replace(/\s/g, "").length >= 2
    ),

  relationshipToIndex: yup.string().required("Relationship is required"),
  contactSex: yup.string().required("Sex is required"),
  contactAgeGroup: yup.string().required("Age group is required"),

  contactPhone: yup
    .string()
    .nullable()
    .test("phone-digits", "Phone number must be 10 or 11 digits", (val) => {
      if (!val) return true;
      return /^[0-9]{10,11}$/.test(val);
    }),
    
    indexAltPhone: yup
    .string()
    .nullable()
    .test("alt-phone-digits", "Phone number must be 10 or 11 digits", (val) => {
      if (!val) return true;
      return /^[0-9]{10,11}$/.test(val);
    }),

    indexPhone: yup
    .string()
    .nullable()
    .test("index-phone-digits", "Phone number must be 10 or 11 digits", (val) => {
      if (!val) return true;
      return /^[0-9]{10,11}$/.test(val);
    }),

  notificationMethod: yup.string().required("Notification method is required"),

  followUpLocation: yup.string().required("Follow-up location is required"),

  attempts: yup
    .number()
    .nullable()
    .min(0, "Minimum 0")
    .max(6, "Maximum 6")
    .integer("Must be a whole number")
    .typeError("Must be a number"),

  knownHivPositive: yup.string().required("Known HIV status is required"),

  // If knownHivPositive = Yes → dateTested + dateEnrolledArt required
  dateTestedHiv: yup.mixed().test("date-tested-hiv", "Date tested is required", function (val) {
    const { knownHivPositive, hivTestResult } = this.parent;
    // Required when: knownHivPositive=Yes OR (knownHivPositive=No and we show new test)
    if (knownHivPositive?.toLowerCase() === "yes" || knownHivPositive?.toLowerCase() === "no") {
      if (!val) return this.createError({ message: "Date tested is required" });
      if (new Date(val) > today)
        return this.createError({ message: "Cannot be a future date" });
    }
    return true;
  }),

  hivTestResult: yup.mixed().test("hiv-result-required", "HIV test result is required", function (val) {
    if (this.parent.knownHivPositive.toLowerCase() !== "no") return true;
    return !!val || this.createError({ message: "HIV test result is required" });
  }),

  dateEnrolledArt: yup.mixed().test("art-enroll-conditional", "ART enrollment date is required", function (val) {
    const { knownHivPositive, hivTestResult } = this.parent;
    const needsArt =
      knownHivPositive?.toLowerCase() === "yes" || hivTestResult?.toLowerCase() === "positive";
    if (!needsArt) return true;
    if (!val) return this.createError({ message: "Date enrolled on ART is required" });
    if (new Date(val) > today)
      return this.createError({ message: "Cannot be a future date" });
    return true;
  }),

  // OVC — only for contacts < 15 years
  dateEnrolledOvc: yup.mixed().test("ovc-date-conditional", "OVC enrollment date is required", function (val) {
    if (this.parent.contactAgeGroup !== "<15") return true;
    if (!this.parent.enrolledInOvc) return true;
    if (!val) return this.createError({ message: "Date enrolled in OVC is required" });
    if (new Date(val) > today)
      return this.createError({ message: "Cannot be a future date" });
    return true;
  }),

  ovcId: yup.mixed().test("ovc-id-conditional", "OVC ID is required", function (val) {
    if (this.parent.contactAgeGroup !== "<15") return true;
    if (!this.parent.enrolledInOvc) return true;
    return !!val || this.createError({ message: "OVC ID is required" });
  }),
});

// ── Main schema ─────────────────────────────────────────────────────────────

export const buildIctValidationSchema = () =>
  yup.object({
    // ── Section A ──────────────────────────────────────────────────────────

    dateOfService: yup
      .date()
      .max(today, "Date of service cannot be in the future")
      .required("Date of service is required"),

    setting: yup.string().required("Setting is required"),

    facilitySetting: yup.mixed().test("facility-setting-conditional", "Facility setting is required", function (val) {
      if (this.parent.setting.toLowerCase() !== "facility") return true;
      return !!val || this.createError({ message: "Facility setting is required" });
    }),

    communityEntryPoint: yup.mixed().test("community-ep-conditional", "Community entry point is required", function (val) {
      if (this.parent.setting.toLowerCase() !== "community") return true;
      return !!val || this.createError({ message: "Community entry point is required" });
    }),

    clientCategory: yup.string().required("Client category is required"),
    clientCategoryOther: yup.mixed().test("category-other", "Please specify", function (val) {
      if (this.parent.clientCategory.toLowerCase() !== "other") return true;
      return !!val || this.createError({ message: "Please specify the client category" });
    }),

    offeredPns: yup.string().required("Offered PNS is required"),

    acceptedPns: yup.mixed().test("accepted-pns-conditional", "Accepted PNS is required", function (val) {
      if (this.parent.offeredPns?.toLowerCase() !== "yes") return true;
      return !!val || this.createError({ message: "Accepted PNS is required when PNS was offered" });
    }),

    // ── Section B ──────────────────────────────────────────────────────────
    // Only validate contacts array when acceptedPns === "Yes"

    contacts: yup.mixed().test("contacts-required", "At least one contact is required", function (val) {
      if (this.parent.acceptedPns?.toLowerCase() !== "yes") return true;
      if (!Array.isArray(val) || val.length === 0)
        return this.createError({ message: "At least one contact must be added when PNS is accepted" });
      // Run per-contact schema against each item
      try {
        val.forEach((contact, i) => contactSchema.validateSync(contact, { abortEarly: false }));
        return true;
      } catch (err) {
        return this.createError({ message: err.errors?.[0] || "Contact validation failed" });
      }
    }),
  });

export { contactSchema };