// src/NewToolForms/sections/DiagnosticTestingSection.jsx
import React, { useState, useEffect } from "react";
import { FormSelect, SectionSubheading, ReadOnlyField, FormTextField } from "./FormFields";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";

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

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      id: item.id,
      label:
        item.display.toLowerCase() === "yes" || item.display.toLowerCase() === "no"
          ? capitalizeFirstLetter(item.display)
          : item.display,
      value: item.code,
    }));
  };

  const loadCodesets = (data) => setCodesets(data);

  useGetCodesets({
    codesetsKeys: [
      "YES_NO",
      "STI_HIV_RESULT",
      "SYPHILIS_RESULT",
      "HIV_EARLY_DETECT_RESULT",
      "HIV_CONFIRMATORY_TEST_RESULT",
      "TYPE_OF_HIV_TEST",
      "RECENCY_TESTING"
    ],
    patientId: "diagnosticTesting",
    onSuccess: loadCodesets,
  });

  // ── Path flags ────────────────────────────────────────────────────────────
  const earlyDetectDone = values.typeOfHivTestDone === "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT";
  const earlyDetectNo = values.typeOfHivTestDone === "TYPE_OF_HIV_TEST_RAPID_ANTIBODY";
  const showRecency = values.initialHivTest === "STI_HIV_RESULT_POSITIVE";

  const isAcutePath =
    values.hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" ||
    values.hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";

  const isAntibodyReactivePath =
    values.hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE";

  const isNonReactivePath =
    values.hivEarlyDetectResult === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_NON-REACTIVE";

  // Show confirmatory when:
  //   Path A - Antibody Reactive, OR
  //   Path B - Initial HIV Test is Positive
  const showConfirmatory =
    isAntibodyReactivePath ||
    (earlyDetectNo && values.initialHivTest === "STI_HIV_RESULT_POSITIVE");

  // ── Derived Final HIV Test Result ─────────────────────────────────────────
  const getFinalResult = () => {
    if (earlyDetectDone) {
      // if (isAcutePath) return "Suspected Acute Infection"; 
      if (isAcutePath) return ""; // if it is suspected, finalHivTestResult will now remain blank
      if (isNonReactivePath) return "Negative";
      if (isAntibodyReactivePath) {
        if (values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive") return "Positive";
        if (values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_negative") return "Negative";
      }
      return null;
    }
    if (earlyDetectNo) {
      if (values.initialHivTest === "STI_HIV_RESULT_NEGATIVE") return "Negative";
      if (values.initialHivTest === "STI_HIV_RESULT_POSITIVE") {
        if (values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive") return "Positive";
        if (values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_negative") return "Negative";
      }
    }
    return null;
  };

  const finalResult = getFinalResult();

  useEffect(() => {
    setFieldValue("finalHivTestResult", finalResult || "");
  }, [finalResult, setFieldValue]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEarlyDetectDoneChange = (e) => {
    const val = e.target.value;
    setFieldValue("typeOfHivTestDone", val);
    // Clear all downstream on path switch
    setFieldValue("hivEarlyDetectResult", "");
    setFieldValue("suspectedAcuteInfection", "");
    setFieldValue("initialHivTest", "");
    setFieldValue("confirmatoryHivTest", "");
    setFieldValue("recencyTest", "");
  };

  const handleEarlyDetectResultChange = (e) => {
    const val = e.target.value;
    setFieldValue("hivEarlyDetectResult", val);

    const acute =
      val === "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE" ||
      val === "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";

    if (acute) {
      setFieldValue("suspectedAcuteInfection", "YES_NO_YES");
      setFieldValue("confirmatoryHivTest", "");
    } else {
      setFieldValue("suspectedAcuteInfection", "");
      setFieldValue("confirmatoryHivTest", "");
    }
  };

  const handleInitialTestChange = (e) => {
    const val = e.target.value;
    setFieldValue("initialHivTest", val);
    if (val !== "STI_HIV_RESULT_POSITIVE") {
      setFieldValue("confirmatoryHivTest", "");
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const warningBannerStyle = {
    background: "#fff3e0",
    border: "1px solid #ff9800",
    borderRadius: 4,
    padding: "10px 14px",
    marginBottom: 16,
    color: "#e65100",
    fontWeight: 600,
    fontSize: 14,
  };

  const finalResultBoxStyle = (result) => ({
    display: "inline-block",
    padding: "6px 18px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
    background:
      result === "Positive" ? "#fdecea" :
        result === "Negative" ? "#e8f5e9" :
          "#fff3e0",
    color:
      result === "Positive" ? "#c62828" :
        result === "Negative" ? "#2e7d32" :
          "#e65100",
    border:
      result === "Positive" ? "1px solid #ef9a9a" :
        result === "Negative" ? "1px solid #a5d6a7" :
          "1px solid #ff9800",
  });

  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>HIV Testing</SectionSubheading>

      <div className="row">
        {/* Always shown */}
        <div className="col-md-6">
          <FormSelect
            label="Type of HIV Test ?"
            {...sp("typeOfHivTestDone", transformOptions(codesets?.["TYPE_OF_HIV_TEST"]))}
            onChange={readOnly ? undefined : handleEarlyDetectDoneChange}
          />
        </div>

        {/* PATH A - Early Detect = YES */}
        {earlyDetectDone && (
          <div className="col-md-6">
            <FormSelect
              label="HIV Early Detect Result"
              {...sp("hivEarlyDetectResult", transformOptions(codesets?.["HIV_EARLY_DETECT_RESULT"]))}
              onChange={readOnly ? undefined : handleEarlyDetectResultChange}
              required
            />
          </div>
        )}


        {earlyDetectDone && isAcutePath && (
          <>
            <div className="col-md-12">
              <div style={warningBannerStyle}>
                Suspected Acute HIV Infection - This client should be enrolled in
                PrEP/PEP and have access to the HIV Module for laboratory tests only.
              </div>
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Suspected Acute HIV Infection?"
                {...sp("suspectedAcuteInfection", transformOptions(codesets?.["YES_NO"]))}
                disabled // always locked to YES on this path
              />
            </div>
          </>
        )}

        {/* PATH B - Early Detect = NO → show Initial HIV Test */}
        {earlyDetectNo && (
          <div className="col-md-6">
            <FormSelect
              label="Initial HIV Test"
              {...sp("initialHivTest", transformOptions(codesets?.["STI_HIV_RESULT"]))}
              onChange={readOnly ? undefined : handleInitialTestChange}
              required
            />
          </div>
        )}

        {/* SHARED - Confirmatory: shown for Antibody Reactive (Path A) 
                     OR Initial Positive (Path B) */}
        {showConfirmatory && (
          <div className="col-md-6">
            <FormSelect
              label="Confirmatory HIV Test"
              {...sp("confirmatoryHivTest", transformOptions(codesets?.["HIV_CONFIRMATORY_TEST_RESULT"]))}
            />
          </div>
        )}

        {/* Recency - commented out per requirement */}
        {showRecency && (
          <div className="col-md-6">
            <FormSelect
              label="Recency Test Result"
              {...sp("recencyTest", transformOptions(codesets?.["RECENCY_TESTING"]))}
              required
            />
          </div>
        )}
      </div>

      <div className="row">
        {formik?.values?.finalHivTestResult && formik?.values?.finalHivTestResult !== "" && (
          <div className="col-md-6">
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: "14px",
                color: "#014d88",
                fontWeight: "bold",
                marginBottom: "6px",
                display: "block",
              }}>
                Final HIV Test Result
              </label>
              <span style={finalResultBoxStyle(formik?.values?.finalHivTestResult)}>{formik?.values?.finalHivTestResult}</span>
            </div>
          </div>
        )}

        {
          formik?.values?.dateOfFinalHivTestDone && formik?.values?.dateOfFinalHivTestDone !== "" && (
            <div className="col-md-6">
              <FormTextField label="Date of Final HIV test" type="date" value={formik?.values?.dateOfFinalHivTestDone}
                disabled
              />
            </div>
          )
        }
      </div>

      {/* Syphilis - always shown */}
      <SectionSubheading>Syphilis Testing</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Syphilis Test Result"
            {...sp("syphilisTestResult", transformOptions(codesets?.["SYPHILIS_RESULT"]))}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTestingSection;