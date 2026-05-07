import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { useFormik } from "formik";
import { buildValidationSchema } from "./hooks/validationSchema";
import FormAccordion from "./sections/FormAccordion";
import BasicInformationSection from "./sections/BasicInformationSection";
import PreTestCounsellingSection from "./sections/PreTestCounsellingSection";
import DiagnosticTestingSection from "./sections/DiagnosticTestingSection";
import PostTestCounsellingSection from "./sections/PostTestCounsellingSection";
import { COLORS } from "./constants";
import { createEncounter } from "../../services/createHtsEncounter.service";
import { buildHtsEncounterPayload } from "./utils/htsEncounterPayload";
import { toast } from "react-toastify";
import { token, url } from "../../../api";
import axios from "axios";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";
import { getCodesets } from "../../services/getCodesets.service";
import { convertFieldsToCodes } from "../../../utils";


// ─── Styles ────────────────────────────────────────────────────────────────
const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: "#f6f8fa",
    minHeight: "100vh",
    padding: "0",
    width: "100%",
  },
  topBar: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #d0d7de",
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  titleBlock: {},
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: COLORS.primary,
    margin: 0,
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#57606a",
    marginTop: 4,
    marginBottom: 0,
  },
  body: { padding: "28px" },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "8px",
    paddingBottom: "24px",
  },
}));

// ─── Person → Formik mapper (unchanged, returns display strings) ───────────
const mapPersonToFormValues = (person) => {
  if (!person) return {};

  const addressArr =
    person?.address?.address ??
    (Array.isArray(person?.address) ? person.address : []);
  const addr = addressArr[0] ?? {};

  const cpArr =
    person?.contactPoint?.contactPoint ??
    (Array.isArray(person?.contactPoint) ? person.contactPoint : []);
  const phoneEntry = cpArr.find((cp) => cp?.type === "phone") ?? cpArr[0] ?? {};
  const phone = phoneEntry?.value ?? person?.phoneNumber ?? "";

  const idArr =
    person?.identifier?.identifier ??
    (Array.isArray(person?.identifier) ? person.identifier : []);
  const hospitalNumber =
    idArr.find((id) => id?.type === "HospitalNumber")?.value ??
    idArr[0]?.value ??
    person?.hospitalNumber ??
    "";

  const sexDisplay = person?.sex ?? person?.gender?.display ?? "";
  const sexCode = person?.gender?.id != null ? String(person.gender.id) : "";

  const maritalDisplay = person?.maritalStatus?.display ?? "";
  const maritalCode = person?.maritalStatus?.id != null
    ? String(person.maritalStatus.id)
    : "";

  const dob = person?.dateOfBirth ?? "";
  const isEstimated = !!person?.isDateOfBirthEstimated;

  let computedAge = "";
  if (dob) {
    const birth = new Date(dob);
    if (!isNaN(birth.getTime())) {
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
      computedAge = years >= 0 ? String(years) : "";
    }
  }

  return {
    surname: person?.surname ?? "",
    firstName: person?.firstName ?? "",
    middleName: person?.otherName ?? "",
    dobType: isEstimated ? "Estimated" : "Actual",
    dateOfBirth: dob,
    age: computedAge,

    sex: sexDisplay,
    sexCode: sexCode,
    maritalStatus: maritalDisplay,
    maritalStatusCode: maritalCode,
    phoneNumber: phone,

    clientState: addr?.stateId != null ? String(addr.stateId) : "",
    clientLga: addr?.district ?? "",
    address: addr?.city ?? "",
    clientCode: "",
    personId: person?.id != null ? String(person.id) : "",
    currentOrganisationUnitId: person?.facilityId != null ? String(person.facilityId) : "",
  };
};

// ─── Blank clinical values ────────────────────────────────────────────────
const blankClinicalValues = {
  dateOfVisit: "",
  facilityName: "",
  setting: "",
  facilitySetting: "",
  communityEntryPoint: "",
  typeOfSession: "",
  indexTesting: "",
  indexRelationship: "",
  indexClientCode: "",
  numberOfWives: "",
  numberOfCoWives: "",
  numberOfBiologicalChildren: "",
  pregnancyStatus: "",
  breastfeedingDuration: "",
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
  hivEarlyDetectTestDone: "",
  hivEarlyDetectResult: "",
  initialHivTest: "",
  suspectedAcuteInfection: "",
  confirmatoryHivTest: "",
  syphilisTestResult: "",
  recencyTest: "",
  previouslyTestedThisYear: "",
  clientReceivedTestResult: "",
  hivTestKitsProvided: "",
  categoryOfClients: "",
  acceptedIndexTesting: "",
  providedFpInfo: "",
  clientPartnerUseFpMethods: "",
  clientPartnerUseCondoms: "",
  correctCondomUseDemonstrated: "",
  condomsProvided: "",
  clientReferredToOtherServices: "",
  completedBy: "",
  designation: "",
};

// ─── Component ────────────────────────────────────────────────────────────
const NewEncounterHtsForm = ({ person, backButtonAction, onValuesChange, onSubmitSuccess }) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(person);
  const [isFetchingPatientInfo, setIsFetchingPatientInfo] = useState(false);
  const [codesets, setCodesets] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState(null); // merged values, ready for formik

  // Fetch the required codesets once on mount
  useEffect(() => {
    getCodesets("SEX", "MARITAL_STATUS", "PREGNANCY_STATUS", "YES_NO", "DURATION_OF_BREASTFEEDING")
      .then(setCodesets)
      .catch(err => console.error("Failed to load codesets", err));
  }, []);

  // Fetch latest patient data when person.id changes
  const fetchPatientCurrentBio = async () => {
    setIsFetchingPatientInfo(true);
    try {
      const response = await axios.get(
        `${url}patient/${person?.id || person?.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch patient", error);
      toast.error("Failed to fetch patient details");
    } finally {
      setIsFetchingPatientInfo(false);
    }
  };

  useEffect(() => {
    if (person?.id || person?.personId) {
      fetchPatientCurrentBio();
    }
  }, [person?.id, person?.personId]);

  // When both patientInfo and codesets are ready, build the merged initial values
  useEffect(() => {
    if (!patientInfo || !codesets) return;

    // 1. Get raw demographic values (display strings)
    const demoValues = mapPersonToFormValues(patientInfo);

    // 2. Define which fields correspond to which codesets
    const fieldCodesetMap = {
      sex: codesets["SEX"],
      maritalStatus: codesets["MARITAL_STATUS"],
      pregnancyStatus: codesets["PREGNANCY_STATUS"],
      breastfeedingDuration: codesets["DURATION_OF_BREASTFEEDING"],
      // add more fields as needed
    };

    // 3. Convert the display strings to codes (e.g. "Female" -> "SEX_FEMALE")
    const convertedDemo = convertFieldsToCodes(demoValues, fieldCodesetMap);

    // 4. Merge with blank clinical values
    const merged = { ...blankClinicalValues, ...convertedDemo };
    setFormInitialValues(merged);
  }, [patientInfo, codesets]);

  // Formik initialisation only when formInitialValues is ready.
  // We'll use a conditional to avoid rendering form before values are set.
  const onSubmit = async (values) => {
    // Prevent duplicate HTS encounter for the same person on the same date
    if (person?.id) {
      try {
        const existingEncounters = await getHtsEcounterForAPatient(person.id);
        const hasDuplicate = Array.isArray(existingEncounters) &&
          existingEncounters.some(enc => enc.dateOfVisit === values.dateOfVisit);
        if (hasDuplicate) {
          toast.error("An HTS record already exists for this patient on the selected date.");
          return;
        }
      } catch (err) {
        toast.error("Unable to verify existing encounters. Please try again.");
        return;
      }
    }

    const payload = buildHtsEncounterPayload(values, false);
    try {
      setIsLoading(true);
      const response = await createEncounter(payload);
      toast.success("New HTS encounter created successfully");
      if (onSubmitSuccess) {
        onSubmitSuccess(response, values);
      } else {
        backButtonAction?.();
      }
    } catch (error) {
      console.error("Failed to create encounter:", error.response?.data || error.message);
      toast.error("Failed to create HTS encounter");
    } finally {
      setIsLoading(false);
    }
  };

  // Only create the formik instance when initial values are ready
  const formik = useFormik({
    initialValues: formInitialValues || blankClinicalValues,
    validationSchema: buildValidationSchema(false), // false because demographics are read-only for existing patient
    enableReinitialize: true, // reinitialize when formInitialValues updates
    onSubmit,
  });

  // Forward values to orchestrator for eligibility watcher
  React.useEffect(() => {
    onValuesChange?.(formik.values);
  }, [formik.values]);

  // Standard section error helpers
  const { errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;
  const sectionHasError = (fields) =>
    hasSubmitted && fields.some((f) => !!errors[f]);

  const basicFields = [
    "dateOfVisit", "clientCode", "setting", "facilitySetting", "communityEntryPoint",
    "typeOfSession", "indexRelationship", "indexClientCode",
    "facilityName", "surname", "firstName", "dobType", "dateOfBirth", "age",
    "sex", "phoneNumber", "maritalStatus", "numberOfWives", "numberOfCoWives",
    "numberOfBiologicalChildren", "pregnancyStatus", "breastfeedingDuration",
    "clientState", "clientLga", "address",
  ];

  const preTestFields = [
    "previouslyTestedNegative", "timeOfLastNegativeTest",
    "clientInformedTransmissionRoutes", "clientInformedRiskFactors",
    "clientInformedPreventionMethods", "clientInformedPossibleResults",
    "informedConsentGiven", "everHadSexualIntercourse", "moreThanOneSexPartner",
    "unprotectedVaginalSex", "unprotectedAnalSex", "bloodTransfusionLast3Months",
    "sexUnderInfluence", "historyOfSTI", "currentCough", "weightLoss", "fever",
    "nightSweats", "complaintsVaginalDischarge", "complaintsLowerAbdominalPain",
    "complaintsUrethralDischarge", "complaintsScroralSwelling",
    "complaintsGenitalSores", "complaintsSwollenLymphNodes",
    "partnerNewlyDiagnosed", "partnerPregnantOnArv", "adolescentHivPositive",
    "partnerNotRegularlyOnDrugs", "partnerRecentlyReturnedToTreatment", "hadSexWithHivPositivePartnerInRiskGroup"
  ];

  const diagnosticFields = [
    "hivEarlyDetectTestDone", "hivEarlyDetectResult", "initialHivTest",
    "suspectedAcuteInfection", "confirmatoryHivTest", "syphilisTestResult", "recencyTest",
  ];

  const postTestFields = [
    "previouslyTestedThisYear", "clientReceivedTestResult", "hivTestKitsProvided",
    "categoryOfClients", "acceptedIndexTesting", "providedFpInfo",
    "clientPartnerUseFpMethods", "clientPartnerUseCondoms",
    "correctCondomUseDemonstrated", "condomsProvided",
    "clientReferredToOtherServices", "completedBy", "designation",
  ];

  // If still loading initial values, show a loading indicator
  if (!formInitialValues || isFetchingPatientInfo) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#57606a", fontSize: 14 }}>
        Loading patient details…
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.titleBlock}>
          <h2 className={classes.title}>
            HIV Testing Form
            <span
              style={{
                display: "inline-block",
                padding: "2px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                background: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              New Encounter
            </span>
          </h2>
          <p className={classes.subtitle}>
            New HTS encounter for{" "}
            <strong>
              {[person?.firstName, person?.surname].filter(Boolean).join(" ") || "existing patient"}
            </strong>{" "}
            — demographics are locked, all clinical fields are blank
          </p>
        </div>
        <Button
          content="Back"
          icon="left arrow"
          labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={() => backButtonAction?.()}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion
            step={1}
            title="Basic Information"
            subtitle="Patient demographics are pre-filled and locked — complete the visit and clinical fields"
            defaultExpanded
            hasError={sectionHasError(basicFields)}
          >
            <BasicInformationSection
              formik={formik}
              isExistingPatient={true}
              readOnly={isFetchingPatientInfo}
            />
          </FormAccordion>

          <FormAccordion
            step={2}
            title="Pre-Test Counselling / Risk Assessment"
            subtitle="Enter pre-test counselling details below"
            hasError={sectionHasError(preTestFields)}
          >
            <PreTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion
            step={3}
            title="Diagnostic Testing"
            subtitle="Enter diagnostic testing details below"
            hasError={sectionHasError(diagnosticFields)}
          >
            <DiagnosticTestingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion
            step={4}
            title="Post Test Counselling"
            subtitle="Enter post test counselling details below"
            hasError={sectionHasError(postTestFields)}
          >
            <PostTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <div className={classes.footer}>
            <Button
              content={isLoading ? "Submitting..." : "Save Encounter"}
              icon="save"
              labelPosition="right"
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEncounterHtsForm;