// ictValidationSchema.js
import * as yup from "yup";

const today = new Date();
today.setHours(23, 59, 59, 999);

const contactSchema = yup.object({
  firstnameOfContact: yup
    .string()
    .required("Contact First name is required")
    .test("min2", "Must contain at least 2 non-space characters", (v) =>
      !!v && v.replace(/\s/g, "").length >= 2
    ),
  middlenameOfContact: yup.string(),
  surnameOfContact: yup
    .string()
    .required("Contact Surname is required")
    .test("min2", "Must contain at least 2 non-space characters", (v) =>
      !!v && v.replace(/\s/g, "").length >= 2
    ),
  relationshipToIndex: yup.string().required("Relationship is required"),
  contactSex: yup.string().required("Sex is required"),
  contactAge: yup.mixed().test(
    "contact-age-required-when-estimated",
    "Age is required",
    function (value) {
      if (value === "" || value === undefined || value === null)
        return this.createError({ message: "Age is required" });
      const n = Number(value);
      if (isNaN(n) || n < 0) return this.createError({ message: "Age must be a non-negative number" });
      if (n > 130) return this.createError({ message: "Age must be 130 or less" });
      return true;
    }
  ),
  contactAgeGroup: yup.string().required("Age group is required"),
  contactPhone: yup.string().nullable().test("phone-digits", "Phone number must be 10 or 11 digits", (val) => {
    if (!val) return true;
    return /^[0-9]{10,11}$/.test(val);
  }),
  indexAltPhone: yup.string().nullable().test("alt-phone-digits", "Phone number must be 10 or 11 digits", (val) => {
    if (!val) return true;
    return /^[0-9]{10,11}$/.test(val);
  }),
  indexPhone: yup.string().nullable().test("index-phone-digits", "Phone number must be 10 or 11 digits", (val) => {
    if (!val) return true;
    return /^[0-9]{10,11}$/.test(val);
  }),
  notificationMethod: yup.string().required("Notification method is required"),
  followUpLocation: yup.string().required("Follow-up location is required"),
  attempts: yup.number().nullable().min(0, "Minimum 0").max(6, "Maximum 6").integer("Must be a whole number").typeError("Must be a number"),
  knownHivPositive: yup.string().required("Known HIV status is required"),
  dateTestedHiv: yup.date(),
  hivTestResult: yup.mixed().test("hiv-result-required", "HIV test result is required", function (val) {
    if (this.parent.knownHivPositive !== "YES_NO_NO") return true;
    return !!val || this.createError({ message: "HIV test result is required" });
  }),
  contactOnArt: yup.string(),
  dateEnrolledArt: yup.string(),
  contactArtClinic: yup.string(),
  dateEnrolledOvc: yup.mixed().test("ovc-date-conditional", "OVC enrollment date is required", function (val) {
    if (this.parent.contactAgeGroup !== "<15") return true;
    if (!this.parent.enrolledInOvc) return true;
    if (!val) return this.createError({ message: "Date enrolled in OVC is required" });
    if (new Date(val) > today) return this.createError({ message: "Cannot be a future date" });
    return true;
  }),
  ovcId: yup.mixed().test("ovc-id-conditional", "OVC ID is required", function (val) {
    if (this.parent.contactAgeGroup !== "<15") return true;
    if (!this.parent.enrolledInOvc) return true;
    return !!val || this.createError({ message: "OVC ID is required" });
  }),
});

export const buildIctValidationSchema = () =>
  yup.object({
    dateOfService: yup
      .date()
      .max(today, "Date of service cannot be in the future")
      .test("service-not-before-dob", "Date of service cannot be earlier than index client's date of birth", function (value) {
        const { indexDob } = this.parent;
        if (!value || !indexDob) return true;
        return new Date(value) >= new Date(indexDob);
      })
      .required("Date of service is required"),
    setting: yup.string().required("Setting is required"),

    facilitySetting: yup.mixed().test("facility-setting-conditional", "Facility setting is required", function (val) {
      if (this.parent.setting !== "HTS_ENTRY_POINT_FACILITY") return true;
      return !!val || this.createError({ message: "Facility setting is required" });
    }),
    communityEntryPoint: yup.mixed().test("community-ep-conditional", "Community entry point is required", function (val) {
      if (this.parent.setting !== "HTS_ENTRY_POINT_COMMUNITY") return true;
      return !!val || this.createError({ message: "Community entry point is required" });
    }),
    clientCategory: yup.string().required("Client category is required"),
    clientCategoryOther: yup.mixed().test("category-other", "Please specify", function (val) {
      if (this.parent.clientCategory !== "Other") return true;
      return !!val || this.createError({ message: "Please specify the client category" });
    }),
    offeredPns: yup.string().required("Offered Index Testing Services is required"),
    acceptedPns: yup.mixed().test("accepted-pns-conditional", "Accepted Index Testing Services is required", function (val) {
      if (this.parent.offeredPns !== "YES_NO_YES") return true;
      return !!val || this.createError({ message: "Accepted Index Testing Services is required when offered" });
    }),
    contacts: yup.mixed().test("contacts-required", "At least one contact is required", function (val) {
      if (this.parent.acceptedPns !== "YES_NO_YES") return true;
      if (!Array.isArray(val) || val.length === 0)
        return this.createError({ message: "At least one contact must be added when Index Testing Services is accepted" });
      try {
        val.forEach((contact, i) => contactSchema.validateSync(contact, { abortEarly: false }));
        return true;
      } catch (err) {
        return this.createError({ message: err.errors?.[0] || "Contact validation failed" });
      }
    }),
  });

export { contactSchema };