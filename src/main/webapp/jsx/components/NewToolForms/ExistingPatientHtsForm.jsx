import React from "react";
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

/**
 * ExistingPatientHtsForm
 *
 * Props:
 *   initialValues  — record fetched from backend (pre-populates all fields)
 *   readOnly       — true  → VIEW mode: all fields disabled, no save button
 *                    false → EDIT mode: clinical fields editable, demographics read-only
 */
const ExistingPatientHtsForm = ({ initialValues, readOnly = false }) => {
  const classes = useStyles();
  const history = useHistory();

  const onSubmit = () => {};

  const { formik } = useExistingPatientFormik(onSubmit, initialValues);

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.titleBlock}>
          <h2 className={classes.title}>
            HIV Testing Form
            <span style={modeBadgeStyle(readOnly)}>
              {readOnly ? "View" : "Edit"}
            </span>
          </h2>
          <p className={classes.subtitle}>
            {readOnly
              ? "Viewing existing HTS record — no changes can be made"
              : "Editing existing HTS record — update the required fields and save"}
          </p>
        </div>
        <Button
          content="Back"
          icon="left arrow"
          labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={() => history.push("/")}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion
            step={1}
            title="Basic Information"
            subtitle="Enter basic information details below"
            defaultExpanded
          >
            <BasicInformationSection
              formik={formik}
              isExistingPatient
              readOnly={readOnly}
            />
          </FormAccordion>

          <FormAccordion
            step={2}
            title="Pre-Test Counselling / Risk Assessment"
            subtitle="Enter pre-test counselling details below"
          >
            <PreTestCounsellingSection formik={formik} readOnly={readOnly} />
          </FormAccordion>

          <FormAccordion
            step={3}
            title="Diagnostic Testing"
            subtitle="Enter diagnostic testing details below"
          >
            <DiagnosticTestingSection formik={formik} readOnly={readOnly} />
          </FormAccordion>

          <FormAccordion
            step={4}
            title="Post Test Counselling"
            subtitle="Enter post test counselling details below"
          >
            <PostTestCounsellingSection formik={formik} readOnly={readOnly} />
          </FormAccordion>

          {!readOnly && (
            <div className={classes.footer}>
              <Button
                content="Update Record"
                icon="save"
                labelPosition="right"
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