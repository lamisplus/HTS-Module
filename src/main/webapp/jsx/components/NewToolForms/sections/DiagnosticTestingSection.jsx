import React from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import {
  HIV_TEST_RESULT_OPTIONS,
  CONFIRMATORY_TEST_OPTIONS,
  SYPHILIS_TEST_OPTIONS,
  RECENCY_TEST_OPTIONS,
  HIV_EARLY_DETECT_OPTIONS,
  YES_NO_OPTIONS,
} from "../constants";

const DiagnosticTestingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  const fp = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name],
    disabled: readOnly,
  });

  const sp = (name, options) => ({ ...fp(name), options });

  const handleInitialTestChange = (e) => {
    const val = e.target.value;
    setFieldValue("initialHivTest", val);
    if (val !== "Positive") {
      setFieldValue("confirmatoryHivTest", "");
      setFieldValue("recencyTest", "");
    }
    if (val !== "Negative") {
      setFieldValue("suspectedAcuteInfection", "");
    }
  };

  const showConfirmatory = values.initialHivTest === "Positive";
  const showRecency = values.initialHivTest === "Positive";
  const showSuspectedAcute = values.initialHivTest === "Negative";

  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>HIV Testing</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="HIV Early Detect Test Result"
            {...sp("hivEarlyDetectResult", HIV_EARLY_DETECT_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Initial HIV Test"
            {...sp("initialHivTest", HIV_TEST_RESULT_OPTIONS)}
            onChange={readOnly ? undefined : handleInitialTestChange}
            required
          />
        </div>
        {showSuspectedAcute && (
          <div className="col-md-6">
            <FormSelect
              label="Suspected Acute HIV Infection?"
              {...sp("suspectedAcuteInfection", YES_NO_OPTIONS)}
            />
          </div>
        )}
        {showConfirmatory && (
          <div className="col-md-6">
            <FormSelect
              label="Confirmatory HIV Test"
              {...sp("confirmatoryHivTest", CONFIRMATORY_TEST_OPTIONS)}
            />
          </div>
        )}
      </div>

      <SectionSubheading>Syphilis / Recency Testing</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Syphilis Test Result"
            {...sp("syphilisTestResult", SYPHILIS_TEST_OPTIONS)}
          />
        </div>
        {showRecency && (
          <div className="col-md-6">
            <FormSelect
              label="Recency Test (for positive clients only)"
              {...sp("recencyTest", RECENCY_TEST_OPTIONS)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTestingSection;