// NewEncounterHtsForm.jsx
import React, { useState, useEffect, useRef } from "react";
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

const useStyles = makeStyles(() => ({
  root: { backgroundColor: "#f6f8fa", minHeight: "100vh", padding: "0", width: "100%" },
  topBar: {
    backgroundColor: "#fff", borderBottom: "1px solid #d0d7de", padding: "14px 28px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
  },
  titleBlock: {},
  title: {
    fontSize: "20px", fontWeight: 700, color: COLORS.primary, margin: 0,
    lineHeight: 1.2, display: "flex", alignItems: "center", gap: "10px",
  },
  subtitle: { fontSize: "13px", color: "#57606a", marginTop: 4, marginBottom: 0 },
  body: { padding: "28px" },
  footer: { display: "flex", justifyContent: "flex-end", paddingTop: "8px", paddingBottom: "24px" },
}));

// ── Resolve person id regardless of which object shape the caller passes ─────
// Handles: { personId, personResponseDto } OR bare personResponseDto { id, ... }
const resolvePersonId = (p) =>
  p?.personResponseDto?.id ?? p?.personId ?? p?.id ?? p?.patientId ?? null;

// ── Map personResponseDto → flat Formik values (display strings, not codes) ──
const mapPersonToFormValues = (dto) => {

  
  if (!dto) return {};

  const addressArr = dto?.address?.address ?? [];
  const addr = addressArr[0] ?? {};

  const cpArr = dto?.contactPoint?.contactPoint ?? [];
  const phoneEntry = cpArr.find((cp) => cp?.type === "phone") ?? cpArr[0] ?? {};
  const phone = phoneEntry?.value ?? "";

  const sexDisplay = dto?.gender?.display ?? dto?.sex ?? "";
  const maritalDisplay = dto?.maritalStatus?.display ?? "";
  const dob = dto?.dateOfBirth ?? "";
  const isEstimated = !!dto?.isDateOfBirthEstimated;

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
    surname: dto?.surname ?? "",
    firstName: dto?.firstName ?? "",
    middleName: dto?.otherName ?? "",
    dobType: isEstimated ? "Estimated" : "Actual",
    dateOfBirth: dob,
    age: computedAge,
    sex: sexDisplay,       // display → converted to code below
    maritalStatus: maritalDisplay,   // display → converted to code below
    phoneNumber: phone,
    clientState: addr?.stateId != null ? String(addr.stateId) : "",
    clientLga: addr?.district != null ? String(addr.district) : "",
    address: addr?.line?.[0] ?? "",
    landmark: addr?.line?.[0] ?? "",
    clientCode: "",
    patientId: dto?.id != null ? String(dto.id) : "",
    currentOrganisationUnitId: dto?.facilityId != null ? String(dto.facilityId) : "",
    sexCode: dto?.gender?.id != null ? String(dto.gender.id) : "",
    maritalStatusCode: dto?.maritalStatus?.id != null ? String(dto.maritalStatus.id) : "",
    dateOfRegistration: dto?.dateOfRegistration
  };
};

const blankClinicalValues = {
  dateOfVisit: "", facilityName: "", setting: "", facilitySetting: "",
  communityEntryPoint: "", typeOfSession: "", indexTesting: "", indexRelationship: "",
  indexClientCode: "", numberOfWives: "", numberOfCoWives: "", numberOfBiologicalChildren: "",
  pregnancyStatus: "", breastfeedingDuration: "", previouslyTestedNegative: "",
  timeOfLastNegativeTest: "", clientInformedTransmissionRoutes: "", clientInformedRiskFactors: "",
  clientInformedPreventionMethods: "", clientInformedPossibleResults: "", informedConsentGiven: "",
  everHadSexualIntercourse: "", moreThanOneSexPartner: "", unprotectedVaginalSex: "",
  unprotectedAnalSex: "", bloodTransfusionLast3Months: "", sexUnderInfluence: "",
  historyOfSTI: "", currentCough: "", weightLoss: "", fever: "", nightSweats: "",
  complaintsVaginalDischarge: "", complaintsLowerAbdominalPain: "", complaintsUrethralDischarge: "",
  complaintsScroralSwelling: "", complaintsGenitalSores: "", complaintsSwollenLymphNodes: "",
  partnerNewlyDiagnosed: "", partnerPregnantOnArv: "", adolescentHivPositive: "",
  partnerNotRegularlyOnDrugs: "", partnerRecentlyReturnedToTreatment: "",
  hadSexWithHivPositivePartnerInRiskGroup: "", hivEarlyDetectTestDone: "", hivEarlyDetectResult: "",
  initialHivTest: "", suspectedAcuteInfection: "", confirmatoryHivTest: "", syphilisTestResult: "",
  recencyTest: "", previouslyTestedThisYear: "", clientReceivedTestResult: "",
  hivTestKitsProvided: "", categoryOfClients: "", acceptedIndexTesting: "", providedFpInfo: "",
  clientPartnerUseFpMethods: "", clientPartnerUseCondoms: "", correctCondomUseDemonstrated: "",
  condomsProvided: "", clientReferredToOtherServices: "", completedBy: "", designation: "",
  sexCode: "", maritalStatusCode: "", currentOrganisationUnitId: "", patientId: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
const NewEncounterHtsForm = ({ person, backButtonAction, onValuesChange, onSubmitSuccess }) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [formInitialValues, setFormInitialValues] = useState(null);

  // Keep fetched personDto and codesets in refs so the merge effect
  // can access the latest of both without stale closure issues.
  const personDtoRef = useRef(null);
  const codesetsRef = useRef(null);

  const personId = resolvePersonId(person);

  // ── Attempt to merge as soon as BOTH personDto AND codesets are available ──
  const tryBuildFormValues = () => {
    const dto = personDtoRef.current;
    const codesets = codesetsRef.current;
    if (!dto || !codesets) return; // wait for the other one

    const raw = mapPersonToFormValues(dto);
    const converted = convertFieldsToCodes(raw, {
      sex: codesets["SEX"],
      maritalStatus: codesets["MARITAL_STATUS"],
    });
    setFormInitialValues({ ...blankClinicalValues, ...converted });
    setIsLoadingForm(false);
  };

  // ── 1. Fetch patient record ───────────────────────────────────────────────
  useEffect(() => {
    if (!personId) {
      // No id — nothing to fetch; show blank form immediately
      setIsLoadingForm(false);
      return;
    }

    const fetch = async () => {
      try {
        const res = await axios.get(`${url}patient/${personId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // API returns { personId, personResponseDto, ... } — extract the dto
        const dto = res.data?.personResponseDto ?? res.data;
        personDtoRef.current = dto;
        tryBuildFormValues();
      } catch (err) {
        console.error("Failed to fetch patient", err);
        toast.error("Failed to fetch patient details");
        // Fall back: use whatever was in the prop
        const dto = person?.personResponseDto ?? (person?.id ? person : null);
        personDtoRef.current = dto ?? {};
        tryBuildFormValues();
      }
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  // ── 2. Load codesets ──────────────────────────────────────────────────────
  useEffect(() => {
    getCodesets("SEX", "MARITAL_STATUS", "PREGNANCY_STATUS", "YES_NO", "DURATION_OF_BREASTFEEDING")
      .then((data) => {
        codesetsRef.current = data;
        tryBuildFormValues();
      })
      .catch((err) => {
        console.error("Failed to load codesets", err);
        // Still allow form to render even if codesets fail
        codesetsRef.current = {};
        tryBuildFormValues();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values) => {
    if (personId) {
      try {
        const existing = await getHtsEcounterForAPatient(personId);
        const hasDuplicate =
          Array.isArray(existing) &&
          existing.some((enc) => enc.dateOfVisit === values.dateOfVisit);
        if (hasDuplicate) {
          toast.error("An HTS record already exists for this patient on the selected date.");
          return;
        }
      } catch {
        toast.error("Unable to verify existing encounters. Please try again.");
        return;
      }
    }

    const payload = buildHtsEncounterPayload(values, false);
    try {
      setIsLoading(true);
      const response = await createEncounter(payload);
      toast.success("New HTS encounter created successfully");
      onSubmitSuccess ? onSubmitSuccess(response, values) : backButtonAction?.();
    } catch (error) {
      console.error("Failed to create encounter:", error.response?.data || error.message);
      toast.error("Failed to create HTS encounter");
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: formInitialValues || blankClinicalValues,
    validationSchema: buildValidationSchema(false),
    enableReinitialize: true,
    onSubmit,
  });

  useEffect(() => {
    onValuesChange?.(formik.values);
  }, [formik.values]); // eslint-disable-line react-hooks/exhaustive-deps

  const { errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;
  const sectionHasError = (fields) => hasSubmitted && fields.some((f) => !!errors[f]);

  const basicFields = [
    "dateOfVisit", "clientCode", "setting", "facilitySetting", "communityEntryPoint",
    "typeOfSession", "indexRelationship", "indexClientCode", "facilityName",
    "surname", "firstName", "dobType", "dateOfBirth", "age", "sex", "phoneNumber",
    "maritalStatus", "numberOfWives", "numberOfCoWives", "numberOfBiologicalChildren",
    "pregnancyStatus", "breastfeedingDuration", "clientState", "clientLga", "address",
  ];
  const preTestFields = [
    "previouslyTestedNegative", "timeOfLastNegativeTest", "clientInformedTransmissionRoutes",
    "clientInformedRiskFactors", "clientInformedPreventionMethods", "clientInformedPossibleResults",
    "informedConsentGiven", "everHadSexualIntercourse", "moreThanOneSexPartner", "unprotectedVaginalSex",
    "unprotectedAnalSex", "bloodTransfusionLast3Months", "sexUnderInfluence", "historyOfSTI",
    "currentCough", "weightLoss", "fever", "nightSweats", "complaintsVaginalDischarge",
    "complaintsLowerAbdominalPain", "complaintsUrethralDischarge", "complaintsScroralSwelling",
    "complaintsGenitalSores", "complaintsSwollenLymphNodes", "partnerNewlyDiagnosed",
    "partnerPregnantOnArv", "adolescentHivPositive", "partnerNotRegularlyOnDrugs",
    "partnerRecentlyReturnedToTreatment", "hadSexWithHivPositivePartnerInRiskGroup",
  ];
  const diagnosticFields = [
    "hivEarlyDetectTestDone", "hivEarlyDetectResult", "initialHivTest",
    "suspectedAcuteInfection", "confirmatoryHivTest", "syphilisTestResult", "recencyTest",
  ];
  const postTestFields = [
    "previouslyTestedThisYear", "clientReceivedTestResult", "hivTestKitsProvided",
    "categoryOfClients", "acceptedIndexTesting", "providedFpInfo", "clientPartnerUseFpMethods",
    "clientPartnerUseCondoms", "correctCondomUseDemonstrated", "condomsProvided",
    "clientReferredToOtherServices", "completedBy", "designation",
  ];

  const displayName = [
    formik.values.firstName || person?.personResponseDto?.firstName,
    formik.values.surname || person?.personResponseDto?.surname,
  ].filter(Boolean).join(" ") || "existing patient";

  if (isLoadingForm) {
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
            <span style={{
              display: "inline-block", padding: "2px 12px", borderRadius: "12px",
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em",
              textTransform: "uppercase", background: "#e8f5e9", color: "#2e7d32",
            }}>
              New Encounter
            </span>
          </h2>
          <p className={classes.subtitle}>
            New HTS encounter for <strong>{displayName}</strong> — demographics are locked, all clinical fields are blank
          </p>
        </div>
        <Button content="Back" icon="left arrow" labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={() => backButtonAction?.()}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion step={1} title="Basic Information"
            subtitle="Patient demographics are pre-filled and locked — complete the visit and clinical fields"
            defaultExpanded hasError={sectionHasError(basicFields)}>
            <BasicInformationSection formik={formik} isExistingPatient readOnly={false} />
          </FormAccordion>

          <FormAccordion step={2} title="Pre-Test Counselling / Risk Assessment"
            subtitle="Enter pre-test counselling details below" hasError={sectionHasError(preTestFields)}>
            <PreTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion step={3} title="Diagnostic Testing"
            subtitle="Enter diagnostic testing details below" hasError={sectionHasError(diagnosticFields)}>
            <DiagnosticTestingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion step={4} title="Post Test Counselling"
            subtitle="Enter post test counselling details below" hasError={sectionHasError(postTestFields)}>
            <PostTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <div className={classes.footer}>
            <Button content={isLoading ? "Submitting…" : "Save Encounter"} icon="save"
              labelPosition="right" type="submit" disabled={isLoading}
              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEncounterHtsForm;