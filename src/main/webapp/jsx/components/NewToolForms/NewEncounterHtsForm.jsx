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

// ─── Styles (identical to the other HTS forms) ────────────────────────────────

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

// ─── Person → Formik mapper ───────────────────────────────────────────────────

/**
 * Translates the person object (from the patient dashboard) into the flat
 * formik field names used by the HTS form.
 *
 * Confirmed API shape:
 * {
 *   id, surname, firstName, otherName, sex,
 *   gender:        { id, display },
 *   maritalStatus: { id, display },
 *   dateOfBirth, isDateOfBirthEstimated,
 *   identifier:    { identifier: [{ type, value, assignerId }] },
 *   contactPoint:  { contactPoint: [{ type, value }] },
 *   address:       { address: [{ city, line, stateId, district, ... }] },
 *   facilityId
 * }
 *
 * Every accessor uses optional chaining + nullish coalescing so the
 * component never crashes on a partial or future-shaped object.
 */
const mapPersonToFormValues = (person) => {
  if (!person) return {};

  // ── Address ───────────────────────────────────────────────────────────────
  // Confirmed: person.address.address[0]
  // Fallback:  plain array directly on person.address
  const addressArr =
    person?.address?.address ??
    (Array.isArray(person?.address) ? person.address : []);
  const addr = addressArr[0] ?? {};

  // ── Phone ─────────────────────────────────────────────────────────────────
  // Confirmed: person.contactPoint.contactPoint[0]
  // Fallback:  plain array directly on person.contactPoint
  const cpArr =
    person?.contactPoint?.contactPoint ??
    (Array.isArray(person?.contactPoint) ? person.contactPoint : []);
  const phoneEntry = cpArr.find((cp) => cp?.type === "phone") ?? cpArr[0] ?? {};
  const phone = phoneEntry?.value ?? person?.phoneNumber ?? "";

  // ── Hospital Number ───────────────────────────────────────────────────────
  // Confirmed: person.identifier.identifier[0]
  // Fallback:  plain array directly on person.identifier
  const idArr =
    person?.identifier?.identifier ??
    (Array.isArray(person?.identifier) ? person.identifier : []);
  const hospitalNumber =
    idArr.find((id) => id?.type === "HospitalNumber")?.value ??
    idArr[0]?.value ??
    person?.hospitalNumber ??
    "";

  // ── Sex ───────────────────────────────────────────────────────────────────
  // person.sex is the display string  (e.g. "Female")
  // person.gender.id is the numeric code for the payload
  const sexDisplay = person?.sex ?? person?.gender?.display ?? "";
  const sexCode = person?.gender?.id != null ? String(person.gender.id) : "";

  // ── Marital status ────────────────────────────────────────────────────────
  // person.maritalStatus is { id, display } — not a plain string
  const maritalDisplay = person?.maritalStatus?.display ?? "";
  const maritalCode = person?.maritalStatus?.id != null
    ? String(person.maritalStatus.id)
    : "";

  // ── DOB & age ─────────────────────────────────────────────────────────────
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
    // ── Identity ──────────────────────────────────────────────────────────
    surname: person?.surname ?? "",
    firstName: person?.firstName ?? "",
    middleName: person?.otherName ?? "",   // API field is otherName; formik uses middleName

    // ── DOB ───────────────────────────────────────────────────────────────
    dobType: isEstimated ? "Estimated" : "Actual",
    // dateOfBirth: isEstimated ? "" : dob,   // blank the picker when estimated
    dateOfBirth: dob,   // blank the picker when estimated
    age: computedAge,

    // ── Demographics ──────────────────────────────────────────────────────
    sex: sexDisplay,
    sexCode: sexCode,
    maritalStatus: maritalDisplay,
    maritalStatusCode: maritalCode,
    phoneNumber: phone,

    // ── Address ───────────────────────────────────────────────────────────
    clientState: addr?.stateId != null ? String(addr.stateId) : "",
    clientLga: addr?.district ?? "",
    address: addr?.city ?? "",

    // ── Identifiers ───────────────────────────────────────────────────────
    clientCode: hospitalNumber,

    // ── System linkage (passed to payload builder) ────────────────────────
    personId: person?.id != null ? String(person.id) : "",
    currentOrganisationUnitId: person?.facilityId != null ? String(person.facilityId) : "",
  };
};

// ─── Blank clinical values (everything NOT demographic) ───────────────────────

const blankClinicalValues = {
  dateOfVisit: "",
  facilityName: "",
  setting: "",
  facilitySetting: "",
  communityEntryPoint: "",
  modality: "",
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
  hivEarlyDetectTestDone: "",
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



/**
 * NewEncounterHtsForm
 *
 * Creates a brand-new HTS encounter for a patient who is already registered.
 * Demographics are pre-populated from `person` prop and locked (read-only).
 * All clinical fields start blank and are fully editable.
 *
 * Props
 * ─────
 * person           {Object}   Full patient/person object from the dashboard.
 * backButtonAction {Function} Called on Back button click and after successful submit.
 */
const NewEncounterHtsForm = ({ person, backButtonAction, onValuesChange, onSubmitSuccess }) => {
  console.log("person payload", person)
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(person)
  const [isFetchingPatientInfo, setIsFetchingPatientInfo] = useState(false)


  // Build the merged initial values once on mount
  const demographicValues = mapPersonToFormValues(person);
  const mergedInitialValues = { ...blankClinicalValues, ...demographicValues };

  const onSubmit = async (values) => {
    // isNewPatient=false → payload builder attaches personId instead of full person block
    const payload = buildHtsEncounterPayload(values, false);

    try {
      setIsLoading(true);
      const response = await createEncounter(payload);
      toast.success("New HTS encounter created successfully");
      if (onSubmitSuccess) {
        // createEncounter already unwraps axios response.data
        // so response IS the HTS encounter object — pass it + values to orchestrator
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

  // Use the full "new patient" validation schema — demographics are pre-filled
  // so they will pass; clinical fields are validated as normal.
  const formik = useFormik({
    initialValues: mergedInitialValues,
    validationSchema: buildValidationSchema(true),
    enableReinitialize: false, // values are set once; don't wipe on re-render
    onSubmit,
  });

  // Forward every formik value change to the orchestrator for real-time
  // eligibility detection (typeOfSession + HIV test result watching).
  React.useEffect(() => {
    onValuesChange?.(formik.values);
  }, [formik.values]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the person prop updates (unlikely but safe), re-seed only the demographic
  // fields without touching any clinical fields the user may have started filling.
  useEffect(() => {
    if (!patientInfo) return;
    const demo = mapPersonToFormValues(patientInfo);
    Object.entries(demo).forEach(([key, val]) => {
      formik.setFieldValue(key, val, false); // false = skip revalidation on seed
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientInfo]);

  const { errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;

  const sectionHasError = (fields) =>
    hasSubmitted && fields.some((f) => !!errors[f]);

  const basicFields = [
    "dateOfVisit", "clientCode", "setting", "facilitySetting", "communityEntryPoint",
    "modality", "typeOfSession", "indexRelationship", "indexClientCode",
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
    "partnerNotRegularlyOnDrugs", "partnerRecentlyReturnedToTreatment",
  ];

  const diagnosticFields = [
    "hivEarlyDetectTestDone", "initialHivTest", "suspectedAcuteInfection",
    "confirmatoryHivTest", "syphilisTestResult", "recencyTest",
  ];

  const postTestFields = [
    "previouslyTestedThisYear", "clientReceivedTestResult", "hivTestKitsProvided",
    "categoryOfClients", "acceptedIndexTesting", "providedFpInfo",
    "clientPartnerUseFpMethods", "clientPartnerUseCondoms",
    "correctCondomUseDemonstrated", "condomsProvided",
    "clientReferredToOtherServices", "completedBy", "designation",
  ];


  const fetchPatientCurrentBio = async () => {
    setIsFetchingPatientInfo(true)
    axios
      .get(
        `${url}patient/${person?.id || person?.personId
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        console.log(response.data)
        setPatientInfo(response.data)
        setIsFetchingPatientInfo(false)
      })
      .catch((error) => {
        console.log(error)
        setIsFetchingPatientInfo(false)
      });
  }

  useEffect(() => {
    if (person?.id || person?.personId) {
      fetchPatientCurrentBio()
    }
  }, [person])


  return (
    <div className={classes.root}>
      {/* ── Top bar ── */}
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
              {[person?.firstName, person?.surname].filter(Boolean).join(" ") ||
                "existing patient"}
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

      {/* ── Form body ── */}
      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>

          {/* isExistingPatient=true → BasicInformationSection renders demographics
              as ReadOnlyField components, exactly like ExistingPatientHtsForm does */}
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