import React, { useState } from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import {
  HIV_TEST_RESULT_OPTIONS,
  CONFIRMATORY_TEST_OPTIONS,
  SYPHILIS_TEST_OPTIONS,
  RECENCY_TEST_OPTIONS,
  HIV_EARLY_DETECT_OPTIONS,
  YES_NO_OPTIONS,
} from "../constants";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";

const DiagnosticTestingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
  const [codesets, setCodesets] = useState(null);


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
    if (val.toLowerCase() !== "positive") {
      setFieldValue("confirmatoryHivTest", "");
      setFieldValue("recencyTest", "");
    }
    if (val.toLowerCase() !== "negative") {
      setFieldValue("suspectedAcuteInfection", "");
    }
  };

  const showConfirmatory = values.initialHivTest.toLowerCase() === "positive";
  const showRecency = values.initialHivTest.toLowerCase() === "positive";
  const showSuspectedAcute = values.initialHivTest.toLowerCase() === "negative";

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: item.display?.toLowerCase() === "yes" || item.display?.toLowerCase() === "no" ? item.display.toLowerCase(): item.display,
      value: item.display
    }));
  };


  const loadCodesets = (data) => {
    setCodesets(data);
  };

  useGetCodesets({
    codesetsKeys: [
      "YES_NO",
      "RECENT_HIV_TEST",
      "HIV_TEST_RESULT",
      "TEST_RESULT_COMMON",
      "STI_HIV_RESULT",
      "PARTNER_SYPHILIS_STATUS",
      "RECENCY_TESTING"
    ],
    patientId: "diagnosticTesting",
    onSuccess: loadCodesets,
  });


  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>HIV Testing</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="HIV Early Detect Test Result"
            {...sp("hivEarlyDetectResult", transformOptions(codesets?.["TEST_RESULT_COMMON"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Initial HIV Test"
            {...sp("initialHivTest", transformOptions(codesets?.["STI_HIV_RESULT"]))}
            onChange={readOnly ? undefined : handleInitialTestChange}
            required
          />
        </div>
        {showSuspectedAcute && (
          <div className="col-md-6">
            <FormSelect
              label="Suspected Acute HIV Infection?"
              {...sp("suspectedAcuteInfection", transformOptions(codesets?.["YES_NO"]))}
            />
          </div>
        )}
        {showConfirmatory && (
          <div className="col-md-6">
            <FormSelect
              label="Confirmatory HIV Test"
              {...sp("confirmatoryHivTest", transformOptions(codesets?.["STI_HIV_RESULT"]))}
            />
          </div>
        )}
      </div>

      <SectionSubheading>Syphilis / Recency Testing</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Syphilis Test Result"
            {...sp("syphilisTestResult", transformOptions(codesets?.["PARTNER_SYPHILIS_STATUS"]))}
          />
        </div>
        {showRecency && (
          <div className="col-md-6">
            <FormSelect
              label="Recency Test (for positive clients only)"
              {...sp("recencyTest", transformOptions(codesets?.["RECENCY_TESTING"]))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTestingSection;