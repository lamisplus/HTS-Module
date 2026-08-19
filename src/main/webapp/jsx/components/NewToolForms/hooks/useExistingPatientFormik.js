import { useFormik } from "formik";
import { buildValidationSchema } from "./validationSchema";

const defaultValues = {
  dateOfVisit: "",
  clientCode: "",
  serialNumber: "",
  setting: "",
  facilitySetting: "",
  communityEntryPoint: "",
  typeOfSession: "",
  htsPopulationType: "",
  indexTesting: "",
  indexRelationship: "",
  indexClientCode: "",
  surname: "",
  firstName: "",
  middleName: "",
  dobType: "Actual",
  dateOfBirth: "",
  age: "",
  sex: "",
  phoneNumber: "",
  maritalStatus: "",
  numberOfWives: "",
  numberOfCoWives: "",
  numberOfBiologicalChildren: "",
  pregnancyStatus: "",
  breastfeedingDuration: "",
  clientState: "",
  clientLga: "",
  address: "",
  landmark: "",
  previouslyTestedNegative: "",
  timeOfLastNegativeTest: "",
  clientInformedTransmissionRoutes: "",
  clientInformedRiskFactors: "",
  clientInformedPreventionMethods: "",
  clientInformedPossibleResults: "",
  informedConsentGiven: "",
  everHadSexualIntercourse: "",
  moreThanOneSexPartner: "",
  unprotectedVaginalSex: "",
  unprotectedAnalSex: "",
  bloodTransfusionLast3Months: "",
  sexUnderInfluence: "",
  historyOfSTI: "",
  currentCough: "",
  weightLoss: "",
  fever: "",
  nightSweats: "",
  complaintsVaginalDischarge: "",
  complaintsLowerAbdominalPain: "",
  complaintsUrethralDischarge: "",
  complaintsScroralSwelling: "",
  complaintsGenitalSores: "",
  complaintsSwollenLymphNodes: "",
  partnerNewlyDiagnosed: "",
  partnerPregnantOnArv: "",
  adolescentHivPositive: "",
  partnerNotRegularlyOnDrugs: "",
  partnerRecentlyReturnedToTreatment: "",
  hadSexWithHivPositivePartnerInRiskGroup: "",
  typeOfHivTestDone: "",
  initialHivTest: "",
  suspectedAcuteInfection: "",
  confirmatoryHivTest: "",
  syphilisTestResult: "",
  recencyTest: "",
  finalHivTestResult: "",
  dateOfFinalHivTestDone: "",
  previouslyTestedThisYear: "",
  clientReceivedTestResult: "",
  hivTestKitsProvided: "",
  categoryOfClients: "",
  numberOfHivstKitDistributed: "",
  acceptedIndexTesting: "",
  providedFpInfo: "",
  clientPartnerUseFpMethods: "",
  clientPartnerUseCondoms: "",
  correctCondomUseDemonstrated: "",
  condomsProvided: "",
  clientReferredToOtherServices: "",
  completedBy: "",
  designation: "",
  sexCode: "",
  maritalStatusCode: "",
  currentOrganisationUnitId: "",
  patientId: ""
};


export const useExistingPatientFormik = (onSubmit, externalInitialValues) => {
  const deriveSerialNumber = (initialVals) => {
    if (!initialVals?.clientCode) return "";
    const parts = String(initialVals.clientCode).split("/");
    return parts[parts.length - 1] || "";
  };

  const formik = useFormik({
    initialValues: externalInitialValues
      ? {
        ...defaultValues,
        ...externalInitialValues,
        serialNumber: externalInitialValues.serialNumber || deriveSerialNumber(externalInitialValues),
      }
      : defaultValues,
    validationSchema: buildValidationSchema(false),
    enableReinitialize: true,
    onSubmit,
  });
  return { formik };
};