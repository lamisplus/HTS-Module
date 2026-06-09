// src/NewToolForms/ExistingPatientHtsForm.jsx
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { useExistingPatientFormik } from "./hooks/useExistingPatientFormik";
import FormAccordion from "./sections/FormAccordion";
import BasicInformationSection from "./sections/BasicInformationSection";
import PreTestCounsellingSection from "./sections/PreTestCounsellingSection";
import DiagnosticTestingSection from "./sections/DiagnosticTestingSection";
import PostTestCounsellingSection from "./sections/PostTestCounsellingSection";
import { COLORS } from "./constants";
import { buildHtsEncounterPayload } from "./utils/htsEncounterPayload";
import { updateHtsEncounter } from "../../services/updateHtsEncounter";
import { toast } from "react-toastify";
import { getHtsEcounter } from "../../services/getHtsEncounter";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";
import { getCodesets } from "../../services/getCodesets.service";
import { convertFieldsToCodes } from "../../../utils";
import { getAge } from "./NewIctForExistingPatient";

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
  body: {
    padding: "28px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "8px",
    paddingBottom: "24px",
  },
}));

const modeBadgeStyle = (readOnly) => ({
  display: "inline-block",
  padding: "2px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  background: readOnly ? "#e8f0f7" : "#fff3e0",
  color: readOnly ? COLORS.primary : "#e65100",
});

// Map of field names to codeset arrays needed for conversion from display to code
const FIELD_CODESET_MAP = {
  setting: "HTS_ENTRY_POINT",
  facilitySetting: "FACILITY_HTS_TEST_SETTING",
  communityEntryPoint: "COMMUNITY_HTS_TEST_SETTING",
  typeOfSession: "COUNSELING_TYPE",
  indexTesting: "YES_NO",
  indexRelationship: "INDEX_TESTING",
  sex: "SEX",
  maritalStatus: "MARITAL_STATUS",
  pregnancyStatus: "PREGNANCY_STATUS",
  breastfeedingDuration: "DURATION_OF_BREASTFEEDING",
  previouslyTestedNegative: "YES_NO",
  timeOfLastNegativeTest: "RECENT_HIV_TEST",
  initialHivTest: "STI_HIV_RESULT",
  confirmatoryHivTest: "HIV_CONFIRMATORY_TEST_RESULT",
  recencyTest: "RECENCY_TESTING",
  syphilisTestResult: "SYPHILIS_RESULT",
  typeOfHivTestDone: "TYPE_OF_HIV_TEST",
  suspectedAcuteInfection: "YES_NO",
  hivTestKitsProvided: "YES_NO",
  categoryOfClients: "TARGET_GROUP",
  acceptedIndexTesting: "YES_NO",
  providedFpInfo: "YES_NO",
  clientPartnerUseFpMethods: "YES_NO",
  clientPartnerUseCondoms: "YES_NO",
  correctCondomUseDemonstrated: "YES_NO",
  condomsProvided: "YES_NO",
  clientReferredToOtherServices: "YES_NO",
  completedBy: null, // no codeset
  designation: null,
};

const ExistingPatientHtsForm = ({ fullRecord, initialValues, readOnly = false, backButtonAction }) => {

  const maritalStatusMap = {
    cohabiting: "MARITAL_STATUS_COHABITING",
    divorced: "MARITAL_STATUS_DIVORCED",
    married: "MARITAL_STATUS_MARRIED",
    separated: "MARITAL_STATUS_SEPARATED",
    single: "MARITAL_STATUS_SINGLE",
    widowed: "MARITAL_STATUS_WIDOWED"
  };

  const sexMap = {
    female: "SEX_FEMALE",
    male: "SEX_MALE"
  }

  const formInitialValuecontruct = {
    ...fullRecord?.observation,
    clientCode: fullRecord?.clientCode,
    dateOfVisit: fullRecord?.dateOfVisit,
    facilityId: fullRecord?.facilityId,
    patientId: fullRecord?.patientId,
    id: fullRecord?.id,
    patientUuid: fullRecord?.patientUuid,
    person: fullRecord?.person,
    setting: fullRecord?.setting,
    uuid: fullRecord?.uuid,


    surname: fullRecord?.person?.surname,
    firstName: fullRecord?.person?.firstName,
    middleName: fullRecord?.person?.otherName,
    dateOfBirth: fullRecord?.person?.dateOfBirth,
    age: getAge(fullRecord?.person?.dateOfBirth) || "",
    sex: sexMap[fullRecord?.person?.gender?.display?.toLowerCase() || ""] || null,
    // phoneNumber,

    clientState: fullRecord?.person?.address?.address?.[0]?.stateId,
    clientLga: fullRecord?.person?.address?.address?.[0]?.district,
    address: fullRecord?.person?.address?.address?.[0]
      ? [fullRecord?.person?.address?.address?.[0].city, ...(fullRecord?.person?.address?.address?.[0].line ?? [])].filter(Boolean).join(", ")
      : "",
    landmark: fullRecord?.person?.address?.address?.[0].line,
    maritalStatus: maritalStatusMap[fullRecord?.person?.maritalStatus?.display?.toLowerCase() || ""] || null


  }
  const [formInitialValues, setFormInitialValues] = useState(formInitialValuecontruct);
  const [isRefreshingEncounter, setIsRefreshingEncounter] = useState(false);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [codesets, setCodesets] = useState(null);


  useEffect(() => {
    getCodesets(
      "HTS_ENTRY_POINT",
      "FACILITY_HTS_TEST_SETTING",
      "COMMUNITY_HTS_TEST_SETTING",
      "COUNSELING_TYPE",
      "YES_NO",
      "INDEX_TESTING",
      "SEX",
      "MARITAL_STATUS",
      "PREGNANCY_STATUS",
      "DURATION_OF_BREASTFEEDING",
      "RECENT_HIV_TEST",
      "STI_HIV_RESULT",
      "HIV_CONFIRMATORY_TEST_RESULT",
      "RECENCY_TESTING",
      "SYPHILIS_RESULT",
      "TYPE_OF_HIV_TEST",
      "TARGET_GROUP",
      "RELATIONSHIP_CONTACT"
    ).then(data => setCodesets(data)).catch(err => console.error("Failed to load codesets", err));
  }, []);




  const refreshEncounterData = async () => {
    setIsRefreshingEncounter(true);
    try {
      const response = await getHtsEcounter(fullRecord?.id);


      const formInitialValuecontruct = response?.observation ? {
        ...response?.observation,
        clientCode:
          response?.clientCode,
        dateOfVisit:
          response?.dateOfVisit,
        facilityId:
          response?.facilityId,
        patientId: response?.patientId,
        id: response?.id,
        patientUuid: response?.patientUuid,
        person: response?.person,
        setting: response?.setting,
        uuid: response?.uuid,
        clientState: response?.person?.address?.address?.[0]?.stateId,
        clientLga: response?.person?.address?.address?.[0]?.district,
        landmark: response?.person?.address?.address?.[0].line,
        address: response?.person?.address?.address?.[0].city,
        maritalStatus: maritalStatusMap[response?.person?.maritalStatus?.display?.toLowerCase()] || null,
        sex: sexMap[response?.person?.gender?.display?.toLowerCase() || ""] || null,

      } : {}



      if (codesets && Object.keys(formInitialValuecontruct).length > 0) {
        const codesetLookup = {};
        Object.keys(FIELD_CODESET_MAP).forEach((field) => {
          const codesetName = FIELD_CODESET_MAP[field];
          if (codesetName && codesets[codesetName]) {
            codesetLookup[field] = codesets[codesetName];
          }
        });
        const converted = convertFieldsToCodes(formInitialValuecontruct, codesetLookup);

        setFormInitialValues(converted);
      } else {
        setFormInitialValues(formInitialValuecontruct);
      }
    } catch (err) {
      console.error("Failed to refresh encounter", err);
      toast.error("Failed to load encounter data");
    } finally {
      setIsRefreshingEncounter(false);
    }
  };

  useEffect(() => {
    if (fullRecord?.id && codesets) {
      refreshEncounterData();
    }
  }, [fullRecord?.id, codesets]);



  const onSubmit = async (values) => {
    const isBeingSetToPositive =
      values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive";

    // Guard: if this record is being saved as HIV Positive, ensure no OTHER
    // encounter for the same patient already carries a positive result.
    // A patient cannot have two HIV-positive records.
    if (isBeingSetToPositive) {
      try {
        const patientId = fullRecord?.patientId;
        const allEncounters = await getHtsEcounterForAPatient(patientId);

        const conflictingRecord = Array.isArray(allEncounters)
          ? allEncounters.find(
            (enc) =>
              enc.id !== fullRecord?.id && // exclude the record being edited
              enc?.observation?.confirmatoryHivTest?.toLowerCase() ===
              "hiv_confirmatory_test_result_positive"
          )
          : null;

        if (conflictingRecord) {
          toast.error(
            `Cannot save: another HTS record for this patient (visited ${conflictingRecord.dateOfVisit}) already has an HIV Positive result. A patient cannot have two HIV-positive records.`,
            { autoClose: 8000 }
          );
          return; // abort — do not call the API
        }
      } catch (err) {
        console.error("Failed to validate existing encounters before update:", err);
        toast.error("Could not verify patient's existing HIV test results. Please try again.");
        return;
      }
    }

    const payload = buildHtsEncounterPayload(values, false);
    try {
      setIsLoading(true);
      await updateHtsEncounter(fullRecord?.id, payload);
      setIsLoading(false);
      toast.success("Encounter updated successfully");
      backButtonAction();
    } catch (error) {
      console.error("Failed to update encounter:", error.response?.data || error.message);
      toast.error("Failed to update encounter");
      setIsLoading(false);
    }
  };


  const { formik } = useExistingPatientFormik(onSubmit, formInitialValues);

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
    "typeOfHivTestDone", "initialHivTest", "suspectedAcuteInfection",
    "confirmatoryHivTest", "syphilisTestResult", "recencyTest",
  ];

  const postTestFields = [
    "previouslyTestedThisYear", "clientReceivedTestResult", "hivTestKitsProvided",
    "categoryOfClients", "acceptedIndexTesting", "providedFpInfo",
    "clientPartnerUseFpMethods", "clientPartnerUseCondoms",
    "correctCondomUseDemonstrated", "condomsProvided",
    "clientReferredToOtherServices", "completedBy", "designation",
  ];

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.titleBlock}>
          <h2 className={classes.title}>
            HIV Testing Form
            <span style={modeBadgeStyle(readOnly)}>{readOnly ? "View" : "Edit"}</span>
          </h2>
          <p className={classes.subtitle}>
            {readOnly ? "Viewing existing HTS record — no changes can be made" : "Editing existing HTS record — update the required fields and save"}
          </p>
          {isRefreshingEncounter && <p className={classes.subtitle}>Refreshing Record, Please wait...</p>}
        </div>
        <Button
          content="Back"
          icon="left arrow"
          labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={() => backButtonAction()}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion step={1} title="Basic Information" subtitle="Enter basic information details below" defaultExpanded hasError={sectionHasError(basicFields)}>
            <BasicInformationSection formik={formik} isExistingPatient readOnly={readOnly || isRefreshingEncounter} />
          </FormAccordion>

          <FormAccordion step={2} title="Pre-Test Counselling / Risk Assessment" subtitle="Enter pre-test counselling details below" hasError={sectionHasError(preTestFields)}>
            <PreTestCounsellingSection formik={formik} readOnly={readOnly || isRefreshingEncounter} />
          </FormAccordion>

          <FormAccordion step={3} title="Diagnostic Testing" subtitle="Enter diagnostic testing details below" hasError={sectionHasError(diagnosticFields)}>
            <DiagnosticTestingSection formik={formik} readOnly={readOnly || isRefreshingEncounter} />
          </FormAccordion>

          <FormAccordion step={4} title="Post Test Counselling" subtitle="Enter post test counselling details below" hasError={sectionHasError(postTestFields)}>
            <PostTestCounsellingSection formik={formik} readOnly={readOnly || isRefreshingEncounter} />
          </FormAccordion>

          {!readOnly && (
            <div className={classes.footer}>
              <Button
                content={isLoading ? "Submitting..." : "Update Record"}
                icon="save"
                labelPosition="right"
                disabled={isLoading || isRefreshingEncounter}
                type="submit"
                style={{ backgroundColor: COLORS.primary, color: "#fff" }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ExistingPatientHtsForm;