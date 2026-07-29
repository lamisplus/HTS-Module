import * as yup from "yup";

// Reuse the same validation rules from HTS for biosection
// but we only need the fields present in HIVST form.
const nonBlankMin2 = (label) =>
  yup
    .string()
    .required(`${label} is required`)
    .test(
      `${label}-min2-nonblank`,
      `${label} must contain at least 2 non-space characters`,
      (val) => !!val && val.replace(/\s/g, "").length >= 2
    );

const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const buildHIVSTValidationSchema = () => {
  return yup.object({
    dateOfVisit: yup
      .date()
      .max(new Date(), "Date of visit cannot be in the future")
      .required("Date of visit is required"),
    serialNumber: yup.string().required("Serial number is required"),
    clientCode: yup.string().required("Client code is required"),
    setting: yup.string().required("Setting is required"),
    facilitySetting: yup.mixed().test(
      "facility-setting-conditional",
      "Facility setting is required",
      function (value) {
        if (this.parent.setting !== "HTS_ENTRY_POINT_FACILITY") return true;
        return !!value || this.createError({ message: "Facility setting is required" });
      }
    ),
    communityEntryPoint: yup.mixed().test(
      "community-entry-conditional",
      "Community entry point is required",
      function (value) {
        if (this.parent.setting !== "HTS_ENTRY_POINT_COMMUNITY") return true;
        return !!value || this.createError({ message: "Community entry point is required" });
      }
    ),
    typeOfSession: yup.string().required("Type of session is required"),
    htsPopulationType: yup.string(),
    indexTesting: yup.mixed().test(
      "index-testing-conditional",
      "Please indicate whether this is index testing",
      function (value) {
        if (this.parent.typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING") return true;
        return !!value || this.createError({ message: "Index testing selection is required" });
      }
    ),
    indexRelationship: yup.mixed().test(
      "index-relationship-conditional",
      "Relationship of index client is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING" || indexTesting !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "Relationship of index client is required" });
      }
    ),
    indexClientCode: yup.mixed().test(
      "index-client-code-conditional",
      "Index client code/ID is required",
      function (value) {
        const { typeOfSession, indexTesting } = this.parent;
        if (typeOfSession !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING" || indexTesting !== "YES_NO_YES") return true;
        return !!value || this.createError({ message: "Index client code/ID is required" });
      }
    ),
    // HIVST-specific fields
    hivTestKitsProvided: yup.string().required("This field is required"),
    categoryOfClients: yup.mixed().test(
      "categoryOfClients-conditional",
      "Category of client is required",
      function (value) {
        if (this.parent.hivTestKitsProvided !== "YES_NO_YES") return true;
        if (!value) {
          return this.createError({
            message: "Category of client is required when HIV self test kit provided to client is yes",
          });
        }
        return true;
      }
    ),
    numberOfHivstKitDistributed: yup.mixed().test(
      "numberOfHivstKitDistributed-conditional",
      "Number of Kits Distributed is required",
      function (value) {
        if (this.parent.hivTestKitsProvided !== "YES_NO_YES") return true;
        if (!value || value === "") {
          return this.createError({
            message: "Number of Kits Distributed is required when HIV self test kit provided to client is yes",
          });
        }
        if (Number(value) < 1) {
          return this.createError({ message: "Number of kits must be at least 1" });
        }
        return true;
      }
    ),
    completedBy: yup.string().required("This field is required"),
    designation: yup.string().required("This field is required"),
  });
};