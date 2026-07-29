import { useFormik } from "formik";
import { buildHIVSTValidationSchema } from "./HivstEncounterValidationSchema";

// NOTE: This now mirrors the FULL field set that HIVSTBasicInformationSection
// renders (it's a straight copy of HTS's BasicInformationSection). Fields such
// as maritalStatus, clientState/clientLga/landmark/address, sex, dateOfBirth,
// etc. are read-only reference fields for existing patients, but formik still
// needs them declared here or those inputs render as uncontrolled.
const defaultValues = {
  patientId: "",

  // Encounter fields
  dateOfVisit: "",
  serialNumber: "",
  clientCode: "",
  setting: "",
  facilitySetting: "",
  communityEntryPoint: "",
  typeOfSession: "",
  htsPopulationType: "",
  indexTesting: "",
  indexRelationship: "",
  indexClientCode: "",

  // Marital / pregnancy / family sub-fields (shared with HTS)
  maritalStatus: "",
  maritalStatusCode: "",
  numberOfWives: "",
  numberOfCoWives: "",
  numberOfBiologicalChildren: "",
  pregnancyStatus: "",
  breastfeedingDuration: "",

  // Patient/person reference fields rendered (read-only) inside
  // HIVSTBasicInformationSection — populated from the existing patient record,
  // never edited from this form.
  surname: "",
  firstName: "",
  middleName: "",
  dobType: "",
  dateOfBirth: "",
  age: "",
  sex: "",
  sexCode: "",
  phoneNumber: "",
  clientState: "",
  clientLga: "",
  landmark: "",
  address: "",

  // Facility context (auto-populated by HIVSTBasicInformationSection)
  facilityName: "",
  currentOrganisationUnitId: "",

  // HIVST-specific fields
  hivTestKitsProvided: "",
  categoryOfClients: "",
  numberOfHivstKitDistributed: "",
  completedBy: "",
  designation: "",
};

export const useHIVSTFormik = (onSubmit, initialValues = {}) => {
  const formik = useFormik({
    initialValues: { ...defaultValues, ...initialValues },
    validationSchema: buildHIVSTValidationSchema(),
    enableReinitialize: true,
    onSubmit,
  });
  return { formik };
};