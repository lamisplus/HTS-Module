import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { useNewPatientFormik } from "./hooks/useNewPatientFormik";
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

const NewPatientHtsForm = () => {
  const classes = useStyles();
  const history = useHistory();

  const onSubmit = () => {};

  const { formik } = useNewPatientFormik(onSubmit);

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
              isExistingPatient={false}
              readOnly={false}
            />
          </FormAccordion>

          <FormAccordion
            step={2}
            title="Pre-Test Counselling / Risk Assessment"
            subtitle="Enter pre-test counselling details below"
          >
            <PreTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion
            step={3}
            title="Diagnostic Testing"
            subtitle="Enter diagnostic testing details below"
          >
            <DiagnosticTestingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <FormAccordion
            step={4}
            title="Post Test Counselling"
            subtitle="Enter post test counselling details below"
          >
            <PostTestCounsellingSection formik={formik} readOnly={false} />
          </FormAccordion>

          <div className={classes.footer}>
            <Button
              content="Save Record"
              icon="save"
              labelPosition="right"
              type="submit"
              style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientHtsForm;