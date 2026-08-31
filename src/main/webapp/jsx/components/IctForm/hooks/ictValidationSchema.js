import * as yup from "yup";

const today = new Date();
today.setHours(23, 59, 59, 999);


const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const buildContactSchema = (htsDateOfVisit) => yup.object({
  firstName: yup
    .string()
    .required("Contact First name is required")
    .test("min2", "Contact First name must contain at least 2 non-space characters", (v) =>
      !!v && v.replace(/\s/g, "").length >= 2
    ),
  middleName: yup.string(),
  surname: yup
    .string()
    .required("Contact Surname is required")
    .test("min2", "Contact Surname must contain at least 2 non-space characters", (v) =>
      !!v && v.replace(/\s/g, "").length >= 2
    ),
  relationshipToIndex: yup.string().required("Relationship is required"),
  sex: yup.string().required("Sex is required"),
  phone: yup.string().nullable().test("phone-digits", "Phone number must be 10 or 11 digits", (val) => {
    if (!val) return true;
    return /^[0-9]{10,11}$/.test(val);
  }),
  notificationMethod: yup.string().required("Notification method is required"),
  followUpLocation: yup.string().required("Follow-up location is required"),
  attempts: yup.number().nullable().min(0, "Minimum 0").max(6, "Maximum 6").integer("Must be a whole number").typeError("Must be a number"),
  knownHivPositive: yup.string().required("Known HIV status is required"),
  dateTestedHiv: yup.date()
    .test(
      "date-contact-tested",
      "Date contact tested cannot be earlier than the HTS record's date of visit",
      function (value) {
        if (!value || !htsDateOfVisit) return true;
        return toLocalDateString(value) >= toLocalDateString(htsDateOfVisit);
      }
    )
    .test(
      "date-contact-tested-required",
      "Date contact tested for HIV is required",
      function (value) {
        const { knownHivPositive, hivTestResult } = this.parent;
        if (knownHivPositive === "YES_NO_NO" && hivTestResult && hivTestResult !== "HIV_TEST_RESULT_NOT_DONE") {
          return !!value;
        }
        return true;
      }
    ),

  hivTestResult: yup.mixed().test("hiv-result-required", "HIV test result is required", function (val) {
    if (this.parent.knownHivPositive !== "YES_NO_NO") return true;
    return !!val || this.createError({ message: "HIV test result is required" });
  }),
  onArt: yup.string(),
  dateEnrolledArt: yup.date()
    .when("onArt", {
      is: "YES_NO_YES",
      then: (schema) =>
        schema
          .required("Date enrolled on ART is required")
          .test(
            "art-not-before-tested",
            "Date enrolled on ART cannot be earlier than date contact was tested",
            function (value) {
              const { dateTestedHiv } = this.parent;
              if (!value || !dateTestedHiv) return true;
              return toLocalDateString(value) >= toLocalDateString(dateTestedHiv);
            }
          ),
      otherwise: (schema) => schema.nullable(),
    }),
  artClinic: yup.string()
    .when("onArt", {
      is: "YES_NO_YES",
      then: (schema) => schema.required("ART clinic is required"),
      otherwise: (schema) => schema.nullable(),
    }),

  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .min(0, "Age cannot be less than 0")
    .max(130, "Age cannot be greater than 130")
    .integer("Age must be a whole number"),


  dateEnrolledOvc: yup.mixed().test("ovc-date-conditional", "OVC enrollment date is required", function (val) {
    if (!this.parent.enrolledInOvc) return true;
    if (!val) return this.createError({ message: "Date enrolled in OVC is required" });
    if (new Date(val) > today) return this.createError({ message: "Cannot be a future date" });
    return true;
  }),
  ovcId: yup.mixed().test("ovc-id-conditional", "OVC ID is required", function (val) {
    if (!this.parent.enrolledInOvc) return true;
    return !!val || this.createError({ message: "OVC ID is required" });
  }),
});

export const buildIctValidationSchema = () =>
  yup.object({
    dateOfService: yup
      .date()
      .max(today, "Visit Date cannot be in the future")
      .test("service-not-before-dob", "Visit date cannot be earlier than index client's date of birth", function (value) {
        const { indexDob } = this.parent;
        if (!value || !indexDob) return true;
        return toLocalDateString(value) >= toLocalDateString(indexDob);

      })
      .test("service-not-before-dor", "Visit date cannot be earlier than index client's date of registration", function (value) {
        const { indexDateOfRegistration } = this.parent;
        if (!value || !indexDateOfRegistration) return true;
        return toLocalDateString(value) >= toLocalDateString(indexDateOfRegistration);
      })
      .test("service-not-before-hts-dov", "Visit date cannot be earlier than index client's HTS record date of visit", function (value) {
        const { htsDateOfVisit } = this.parent;
        if (!value || !htsDateOfVisit) return true;
        return toLocalDateString(value) >= toLocalDateString(htsDateOfVisit);
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
    clientCategoryOther: yup.string()
      .max(200, "Must be at most 200 characters")
      .when("clientCategory", {
        is: "INDEX_CLIENT_CATEGORY_OTHERS",
        then: (schema) => schema.required("Please specify the client category"),
        otherwise: (schema) => schema.nullable(),
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
      const htsDateOfVisit = this.parent.htsDateOfVisit;

      try {
        val.forEach((contact) =>
          buildContactSchema(htsDateOfVisit).validateSync(contact, { abortEarly: false })
        );
        return true;
      } catch (err) {
        return this.createError({ message: err.errors?.[0] || "Contact validation failed" });
      }
    }),
  });

export { buildContactSchema };