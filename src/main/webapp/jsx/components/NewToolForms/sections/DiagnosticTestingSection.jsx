// src/NewToolForms/sections/DiagnosticTestingSection.jsx
import React, { useState } from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";

const HIV_EARLY_DETECT_RESULT_OPTIONS = [
  { label: "Antigen Reactive", value: "Antigen Reactive" }, // these are not codesets, keep as is
  { label: "Antigen + Antibody Reactive", value: "Antigen + Antibody Reactive" },
  { label: "Antibody Reactive", value: "Antibody Reactive" },
];

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
    if (val !== "STI_HIV_RESULT_POSITIVE") {
      setFieldValue("confirmatoryHivTest", "");
      setFieldValue("recencyTest", "");
    }
  };

  const handleEarlyDetectResultChange = (e) => {
    const val = e.target.value;
    setFieldValue("hivEarlyDetectResult", val);
    if (val === "Antigen Reactive" || val === "Antigen + Antibody Reactive") {
      setFieldValue("suspectedAcuteInfection", "YES_NO_YES");
    } else {
      setFieldValue("suspectedAcuteInfection", "");
    }
    if (val === "Antibody Reactive") {
      // keep existing confirmatory, do nothing
    } else {
      setFieldValue("confirmatoryHivTest", "");
    }
  };

  const showConfirmatory =
    values.initialHivTest === "STI_HIV_RESULT_POSITIVE" ||
    values.hivEarlyDetectResult === "Antibody Reactive";
  const showRecency = values.initialHivTest === "STI_HIV_RESULT_POSITIVE";
  const showEarlyDetectResult = values.hivEarlyDetectTestDone === "YES_NO_YES";
  const showAcuteInfectionBanner =
    values.hivEarlyDetectResult === "Antigen Reactive" ||
    values.hivEarlyDetectResult === "Antigen + Antibody Reactive";

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: capitalizeFirstLetter(item.display),
      value: item.code,
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
      "RECENCY_TESTING",
      "SYPHILIS_RESULT",
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
            label="HIV Early Detect Test Done ?"
            {...sp("hivEarlyDetectTestDone", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        {showEarlyDetectResult && (
          <div className="col-md-6">
            <FormSelect
              label="HIV Early Detect Result"
              {...sp("hivEarlyDetectResult", HIV_EARLY_DETECT_RESULT_OPTIONS)}
              onChange={readOnly ? undefined : handleEarlyDetectResultChange}
              required
            />
          </div>
        )}
        {showEarlyDetectResult && (
          <div className="col-md-6">
            <FormSelect
              label="Suspected Acute HIV Infection?"
              {...sp("suspectedAcuteInfection", transformOptions(codesets?.["YES_NO"]))}
              required
            />
          </div>
        )}
        {showAcuteInfectionBanner && (
          <div className="col-md-12">
            <div style={{
              background: "#fff3e0",
              border: "1px solid #ff9800",
              borderRadius: 4,
              padding: "10px 14px",
              marginBottom: 16,
              color: "#e65100",
              fontWeight: 600,
              fontSize: 14,
            }}>
              ⚠️ Suspected Acute HIV Infection — This client should be enrolled in PrEP/PEP and have access to the HIV Module for laboratory tests only.
            </div>
          </div>
        )}
        <div className="col-md-6">
          <FormSelect
            label="Initial HIV Test"
            {...sp("initialHivTest", transformOptions(codesets?.["STI_HIV_RESULT"]))}
            onChange={readOnly ? undefined : handleInitialTestChange}
            required
          />
        </div>
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
            {...sp("syphilisTestResult", transformOptions(codesets?.["SYPHILIS_RESULT"]))}
          />
        </div>
        {showRecency && (
          <div className="col-md-6">
            <FormSelect
              label="Recency Test Result"
              {...sp("recencyTest", transformOptions(codesets?.["RECENCY_TESTING"]))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTestingSection;