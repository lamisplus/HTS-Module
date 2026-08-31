/**
 * useIctFormik.js
 */
import { useFormik } from "formik";
import { buildIctValidationSchema } from "./ictValidationSchema";

/** Generate a unique Index Contact Code */
export const generateContactCode = (indexClientId, sequence) => {
  const ts = Date.now().toString(36).toUpperCase();
  const seq = String(sequence).padStart(2, "0");
  return `ICT-${indexClientId || "X"}-${seq}-${ts}`;
};

/** Build a blank contact row with a pre-generated ID */
export const makeBlankContact = (indexClientId, existingCount) => ({
  contactCode: generateContactCode(indexClientId, existingCount + 1),
  firstName: "",
  middleName: "",
  surname: "",
  age: "",
  relationshipToIndex: "",
  sex: "",
  phone: "",
  address: "",
  sameAddressAsIndex: false,
  notificationMethod: "",
  followUpLocation: "",
  attempts: "",
  knownHivPositive: "",
  dateTestedHiv: "",
  hivTestResult: "",
  dateEnrolledArt: "",
  onArt: "",
  artClinic: "",
  enrolledInOvc: false,
  dateEnrolledOvc: "",
  ovcId: "",
});

const buildInitialValues = (htsValues) => ({
  facilityName: htsValues?.facilityName || "",
  state: htsValues?.clientState || "",
  lga: htsValues?.clientLga || "",
  indexClientId: htsValues?.clientCode || "",
  indexFirstName: htsValues?.firstName || "",
  indexMiddleName: htsValues?.middleName || "",
  indexSurname: htsValues?.surname || "",
  indexSex: htsValues?.sex || "",
  indexDob: htsValues?.dateOfBirth || "",
  indexAge: (() => {
    if (htsValues?.age) return String(htsValues.age);
    const dob = htsValues?.dateOfBirth;
    if (!dob) return "";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "";
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
    return years >= 0 ? String(years) : "";
  })(),
  indexPhone: htsValues?.phoneNumber || "",
  indexAltPhone: "",
  indexAddress: htsValues?.address || "",
  artUniqueId: htsValues?.artUniqueId || "",
  isOnArt: htsValues?.isOnArt || false,
  facilityId: htsValues?.currentOrganisationUnitId || htsValues?.facilityId || "",
  patientId: htsValues?.patientId || "",
  htsEncounterId: "",
  indexDateOfRegistration: htsValues?.indexDateOfRegistration,
  htsDateOfVisit: htsValues?.dateOfVisit,
  dateOfService: "",
  setting: htsValues?.setting || "",
  facilitySetting: htsValues?.facilitySetting || "",
  communityEntryPoint: htsValues?.communityEntryPoint || "",
  artClinic: "",
  clientCategory: "",
  clientCategoryOther: "",
  offeredPns: "",
  acceptedPns: "",
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