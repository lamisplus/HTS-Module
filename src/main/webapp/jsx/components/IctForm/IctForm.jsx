/**
 * IctForm.jsx
 *
 * Main ICT form component.
 *
 * Props:
 *   htsValues        — Formik values from the completed HTS form (pre-populates Section A)
 *   htsRecord        — Full HTS record object returned by the API after HTS submission
 *                      (used to get the hts encounter id for the API call)
 *   isOnArt          — Boolean; shows ART Clinic field in Section A
 *   onSubmitSuccess  — Callback fired after successful ICT submission
 *   onBack           — Callback for the Back button
 *   readOnly         — View-only mode (e.g. opening an existing ICT record)
 *   initialValues    — Pre-populate the whole form from an existing record
 */

import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useIctFormik } from "./hooks/useIctFormik";
import IctSectionA from "./sections/IctSectionA";
import IctSectionB from "./sections/IctSectionB";
import FormAccordion from "../NewToolForms/sections/FormAccordion";
import { buildIctEncounterPayload } from "./utils/ictEncounterPayload";
import { COLORS } from "../NewToolForms/constants";
// TODO: replace with actual ICT API service
// import { createIctEncounter } from "../../services/createIctEncounter.service";
// import { updateIctEncounter } from "../../services/updateIctEncounter.service";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: "#f6f8fa",
    minHeight: "100vh",
    padding: 0,
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
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: COLORS.primary,
    margin: 0,
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: 10,
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

const modeBadgeStyle = (readOnly) => ({
  display: "inline-block",
  padding: "2px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  background: readOnly ? "#e8f0f7" : "#e8f5e9",
  color: readOnly ? COLORS.primary : "#2e7d32",
});

const IctForm = ({
  htsValues,
  htsRecord,
  isOnArt = false,
  onSubmitSuccess,
  onBack,
  readOnly = false,
  initialValues,
}) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  // Merge isOnArt flag into htsValues so the hook can access it
  const mergedHtsValues = { ...htsValues, isOnArt };

  const onSubmit = async (values) => {
    const payload = buildIctEncounterPayload(values);
    // Attach the HTS encounter id so the backend can link the records
    if (htsRecord?.id) payload.htsEncounterId = htsRecord.id;

    try {
      setIsLoading(true);
      // TODO: swap this console.log for the real API service call
      console.log("[ICT Payload]", JSON.stringify(payload, null, 2));
      // const response = await createIctEncounter(payload);
      toast.success("ICT record saved successfully");
      onSubmitSuccess?.();
    } catch (err) {
      console.error("ICT submission failed:", err?.response?.data || err.message);
      toast.error("Failed to save ICT record");
    } finally {
      setIsLoading(false);
    }
  };

  // Use initialValues if provided (view/edit mode), else hydrate from HTS values
  const { formik } = useIctFormik(
    onSubmit,
    initialValues ? undefined : mergedHtsValues
  );

  // If viewing an existing record, override with saved values
  React.useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([k, v]) => formik.setFieldValue(k, v));
    }
  }, []); // eslint-disable-line

  const { values, errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;

  const sectionHasError = (fields) =>
    hasSubmitted && fields.some((f) => !!errors[f]);

  const sectionAFields = [
    "dateOfService", "setting", "facilitySetting", "communityEntryPoint",
    "clientCategory", "clientCategoryOther", "offeredPns", "acceptedPns",
  ];

  // ── Section B gate logic ──────────────────────────────────────────────────
  const pnsNotOffered = values.offeredPns === "No";
  const pnsDeclined = values.offeredPns === "Yes" && values.acceptedPns === "No";
  const offeredPnsUnset = !values.offeredPns;

  const sectionBLocked = pnsNotOffered || pnsDeclined || offeredPnsUnset;

  const lockReason = pnsNotOffered
    ? "PNS was not offered to the index client. Section B is not applicable."
    : pnsDeclined
    ? "The index client declined PNS. Section B is not applicable."
    : "Please complete the 'Offered PNS' and 'Accepted PNS' fields in Section A first.";

  return (
    <div className={classes.root}>
      {/* ── Top bar ── */}
      <div className={classes.topBar}>
        <div>
          <h2 className={classes.title}>
            Index Contact Testing (ICT) Form
            {readOnly && <span style={modeBadgeStyle(true)}>View</span>}
            {!readOnly && <span style={modeBadgeStyle(false)}>New</span>}
          </h2>
          <p className={classes.subtitle}>
            {readOnly
              ? "Viewing ICT record — no changes can be made"
              : "Complete Section A, then add all elicited contacts in Section B"}
          </p>
        </div>
        <Button
          content="Back"
          icon="left arrow"
          labelPosition="left"
          style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          onClick={onBack}
        />
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>

          {/* ── Section A ── */}
          <FormAccordion
            step={1}
            title="Section A — Index Client Details"
            subtitle="Facility context, visit details and index client identity"
            defaultExpanded
            hasError={sectionHasError(sectionAFields)}
          >
            <IctSectionA formik={formik} readOnly={readOnly} />
          </FormAccordion>

          {/* ── Section B ── */}
          <FormAccordion
            step={2}
            title="Section B — Contact Enumeration & Testing Tracker"
            subtitle={
              sectionBLocked
                ? "Locked — complete PNS fields in Section A to enable"
                : `${values.contacts?.length || 0} contact(s) added`
            }
            hasError={hasSubmitted && !!errors.contacts}
          >
            <IctSectionB
              formik={formik}
              sectionLocked={sectionBLocked}
              lockReason={lockReason}
              readOnly={readOnly}
            />
          </FormAccordion>

          {/* ── Footer ── */}
          {!readOnly && (
            <div className={classes.footer}>
              <Button
                content={isLoading ? "Saving..." : "Save ICT Record"}
                icon="save"
                labelPosition="right"
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: COLORS.primary, color: "#fff" }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default IctForm;
