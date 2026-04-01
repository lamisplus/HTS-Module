import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { useNewPatientFormik } from "../NewToolForms/hooks/useNewPatientFormik"; 
import FormAccordion from "../NewToolForms/sections/FormAccordion";
import BasicInformationSection from "../NewToolForms/sections/BasicInformationSection";
import PreTestCounsellingSection from "../NewToolForms/sections/PreTestCounsellingSection";
import DiagnosticTestingSection from "../NewToolForms/sections/DiagnosticTestingSection";
import PostTestCounsellingSection from "../NewToolForms/sections/PostTestCounsellingSection";
import { COLORS } from "../NewToolForms/constants";
import { createEncounter } from "../../services/createHtsEncounter.service";
import { arrayToObject, buildHtsEncounterPayload } from "../NewToolForms/utils/htsEncounterPayload";
import { toast } from "react-toastify";

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

const NewPatientHtsForm = ({ onValuesChange, onSubmitSuccess, onBack } = {}) => {
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false)


  const onSubmit = async (values) => {
    const payload = buildHtsEncounterPayload(values, true);

    try {
      setIsLoading(true)
      const response = await createEncounter(payload);
      setIsLoading(false)
      toast.success("Encounter created successfully")
      if (onSubmitSuccess) {
        onSubmitSuccess(response?.data, values);
      } else {
        history.push("/")
      }

    } catch (error) {
      console.error("Failed to create encounter:", error.response?.data || error.message);
      toast.error("Failed to create encounter")
    }
    finally {
      setIsLoading(false)

    }
  };
  const { formik } = useNewPatientFormik(onSubmit);

  // Real-time value forwarding for the orchestrator eligibility watcher
  React.useEffect(() => {
    onValuesChange?.(formik.values);
  }, [formik.values]); // eslint-disable-line react-hooks/exhaustive-deps

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
    "hivEarlyDetectResult", "initialHivTest", "suspectedAcuteInfection",
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
          <h2 className={classes.title}>HIV Testing Form</h2>
          <p className={classes.subtitle}>New Client Registration — complete all required fields</p>
        </div>
        <Button
          content="Back"
          icon="left arrow"
          labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={() => onBack ? onBack() : history.push("/")}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion
            step={1}
            title="Basic Information"
            subtitle="Enter basic information details below"
            defaultExpanded
            hasError={sectionHasError(basicFields)}
          >
            <BasicInformationSection
              formik={formik}
              isExistingPatient={false}
              readOnly={false}
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
              content={isLoading ? "Submitting..." : "Save Record"}
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

export default NewPatientHtsForm;