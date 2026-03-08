/**
 * ContactCard.jsx
 *
 * Renders one contact in Section B.
 * Receives the contact object, its index in the array, and handlers to
 * update or remove it from the parent formik contacts array.
 *
 * All skip-logic is handled locally using the contact's own field values.
 */

import React from "react";
import { FormGroup, Label, Input } from "reactstrap";
import {
  FormSelect,
  FormTextField,
  SectionSubheading,
  labelStyle,
  inputStyle,
  selectStyle,
} from "../../NewToolForms/sections/FormFields";
import {
  RELATIONSHIP_TO_INDEX_OPTIONS,
  CONTACT_SEX_OPTIONS,
  CONTACT_AGE_GROUP_OPTIONS,
  NOTIFICATION_METHOD_OPTIONS,
  FOLLOW_UP_LOCATION_OPTIONS,
  HIV_TEST_RESULT_OPTIONS,
  YES_NO_OPTIONS,
} from "../ictConstants";
import { COLORS } from "../../NewToolForms/constants";

const today = new Date().toISOString().split("T")[0];

const errorStyle = {
  color: "#f85032",
  fontSize: "12.8px",
  marginTop: "4px",
  display: "block",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f6f8fa",
  color: "#8c959f",
  cursor: "not-allowed",
};

const cardStyle = {
  border: "1px solid #d0d7de",
  borderRadius: "6px",
  padding: "20px 24px",
  marginBottom: "16px",
  background: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid #e8ecf0",
};

const contactBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: COLORS.primary,
  color: "#fff",
  fontWeight: 700,
  fontSize: "13px",
  marginRight: 10,
};

const ContactCard = ({
  contact,
  index,
  indexAddress,
  indexPhone,
  readOnly,
  onChange,
  onRemove,
  errors = {},
  touched = {},
}) => {
  // ── Field helpers ─────────────────────────────────────────────────────────
  const val = (name) => contact[name] ?? "";

  const set = (name, value) => onChange(index, name, value);

  const fp = (name) => ({
    name,
    value: val(name),
    onChange: (e) => set(name, e.target.value),
    onBlur: () => {},
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name],
    disabled: readOnly,
  });

  const sp = (name, options, extraDisabled = false) => ({
    ...fp(name),
    options,
    disabled: readOnly || extraDisabled,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSameAddress = (e) => {
    const checked = e.target.checked;
    set("sameAddressAsIndex", checked);
    if (checked) {
      set("contactAddress", indexAddress || "");
      set("contactPhone", indexPhone || "");
    } else {
      set("contactAddress", "");
      set("contactPhone", "");
    }
  };

  const handleKnownHivChange = (e) => {
    const v = e.target.value;
    set("knownHivPositive", v);
    // Reset downstream fields
    set("dateTestedHiv", "");
    set("hivTestResult", "");
    set("dateEnrolledArt", "");
  };

  const handleHivResultChange = (e) => {
    const v = e.target.value;
    set("hivTestResult", v);
    if (v !== "Positive") set("dateEnrolledArt", "");
  };

  const handleEnrolledOvcChange = (e) => {
    const checked = e.target.checked;
    set("enrolledInOvc", checked);
    if (!checked) {
      set("dateEnrolledOvc", "");
      set("ovcId", "");
    }
  };

  // ── Visibility flags ──────────────────────────────────────────────────────
  const isKnownPositive = contact.knownHivPositive === "Yes";
  const isKnownNegative = contact.knownHivPositive === "No";
  const showNewTestResult = isKnownNegative;
  const showArtEnrollDate =
    isKnownPositive || contact.hivTestResult === "Positive";
  const isUnder15 = contact.contactAgeGroup === "<15";

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={contactBadgeStyle}>{index + 1}</span>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#24292f" }}>
            {contact.nameOfContact || `Contact ${index + 1}`}
          </span>
          {contact.contactId && (
            <span
              style={{
                marginLeft: 10,
                fontSize: "11px",
                color: "#57606a",
                fontFamily: "monospace",
                background: "#f0f0f0",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              ID: {contact.contactId}
            </span>
          )}
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              background: "none",
              border: "1px solid #d32f2f",
              color: "#d32f2f",
              borderRadius: "4px",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* ── Identity ── */}
      <div className="row">
        <div className="col-md-6">
          <FormTextField label="Name of Contact" {...fp("nameOfContact")} required />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Relationship to Index Client"
            {...sp("relationshipToIndex", RELATIONSHIP_TO_INDEX_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-3">
          <FormSelect
            label="Sex"
            {...sp("contactSex", CONTACT_SEX_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-3">
          <FormSelect
            label="Age Group"
            {...sp("contactAgeGroup", CONTACT_AGE_GROUP_OPTIONS)}
            required
          />
        </div>
      </div>

      {/* ── Address / Phone with "same as index" checkbox ── */}
      <div className="row">
        <div className="col-md-12" style={{ marginBottom: 8 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "14px",
              color: "#24292f",
              cursor: readOnly ? "default" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={!!contact.sameAddressAsIndex}
              onChange={readOnly ? undefined : handleSameAddress}
              disabled={readOnly}
            />
            Contact lives at the same address as the index client
          </label>
        </div>
        <div className="col-md-4">
          <FormTextField
            label="Contact Phone Number"
            {...fp("contactPhone")}
            disabled={readOnly || !!contact.sameAddressAsIndex}
          />
        </div>
        <div className="col-md-8">
          <FormTextField
            label="Home / Contact Address (include landmark)"
            type="textarea"
            {...fp("contactAddress")}
            disabled={readOnly || !!contact.sameAddressAsIndex}
          />
        </div>
      </div>

      {/* ── Notification & Follow-up ── */}
      <div className="row">
        <div className="col-md-4">
          <FormSelect
            label="Notification Method Selected"
            {...sp("notificationMethod", NOTIFICATION_METHOD_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormSelect
            label="Follow-Up Appointment Location"
            {...sp("followUpLocation", FOLLOW_UP_LOCATION_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Number of Follow-Up Attempts (0–6)</Label>
            <Input
              type="number"
              name="attempts"
              value={val("attempts")}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || (Number(v) >= 0 && Number(v) <= 6 && !v.includes(".")))
                  set("attempts", v);
              }}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
              min="0"
              max="6"
              step="1"
              disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
            />
            {touched.attempts && errors.attempts && (
              <span style={errorStyle}>{errors.attempts}</span>
            )}
          </FormGroup>
        </div>
      </div>

      {/* ── HIV Status ── */}
      <SectionSubheading>HIV Testing & Linkage</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <FormSelect
            label="Known HIV Positive?"
            {...sp("knownHivPositive", YES_NO_OPTIONS)}
            onChange={readOnly ? undefined : (e) => handleKnownHivChange(e)}
            required
          />
        </div>

        {/* Known Positive path */}
        {isKnownPositive && (
          <>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date Previously Tested for HIV <span style={{ color: "red" }}> *</span>
                </Label>
                <Input
                  type="date"
                  value={val("dateTestedHiv")}
                  onChange={readOnly ? undefined : (e) => set("dateTestedHiv", e.target.value)}
                  max={today}
                  onKeyPress={(e) => e.preventDefault()}
                  disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle}
                />
                {touched.dateTestedHiv && errors.dateTestedHiv && (
                  <span style={errorStyle}>{errors.dateTestedHiv}</span>
                )}
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date Enrolled on ART <span style={{ color: "red" }}> *</span>
                </Label>
                <Input
                  type="date"
                  value={val("dateEnrolledArt")}
                  onChange={readOnly ? undefined : (e) => set("dateEnrolledArt", e.target.value)}
                  max={today}
                  onKeyPress={(e) => e.preventDefault()}
                  disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle}
                />
                {touched.dateEnrolledArt && errors.dateEnrolledArt && (
                  <span style={errorStyle}>{errors.dateEnrolledArt}</span>
                )}
              </FormGroup>
            </div>
          </>
        )}

        {/* Known Negative / newly testing path */}
        {isKnownNegative && (
          <>
            <div className="col-md-4">
              <FormSelect
                label="HIV Test Result"
                {...sp("hivTestResult", HIV_TEST_RESULT_OPTIONS)}
                onChange={readOnly ? undefined : (e) => handleHivResultChange(e)}
                required
              />
            </div>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date Partner Tested <span style={{ color: "red" }}> *</span>
                </Label>
                <Input
                  type="date"
                  value={val("dateTestedHiv")}
                  onChange={readOnly ? undefined : (e) => set("dateTestedHiv", e.target.value)}
                  max={today}
                  onKeyPress={(e) => e.preventDefault()}
                  disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle}
                />
                {touched.dateTestedHiv && errors.dateTestedHiv && (
                  <span style={errorStyle}>{errors.dateTestedHiv}</span>
                )}
              </FormGroup>
            </div>
            {showArtEnrollDate && (
              <div className="col-md-4">
                <FormGroup style={{ marginBottom: "16px" }}>
                  <Label style={labelStyle}>
                    Date Enrolled on ART <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="date"
                    value={val("dateEnrolledArt")}
                    onChange={readOnly ? undefined : (e) => set("dateEnrolledArt", e.target.value)}
                    max={today}
                    onKeyPress={(e) => e.preventDefault()}
                    disabled={readOnly}
                    style={readOnly ? disabledInputStyle : inputStyle}
                  />
                  {touched.dateEnrolledArt && errors.dateEnrolledArt && (
                    <span style={errorStyle}>{errors.dateEnrolledArt}</span>
                  )}
                </FormGroup>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── OVC — only for contacts < 15 years ── */}
      {isUnder15 && (
        <div className="row" style={{ marginTop: 4 }}>
          <div className="col-md-12" style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "14px",
                color: "#24292f",
                cursor: readOnly ? "default" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!contact.enrolledInOvc}
                onChange={readOnly ? undefined : handleEnrolledOvcChange}
                disabled={readOnly}
              />
              Contact is enrolled in OVC program
            </label>
          </div>
          {contact.enrolledInOvc && (
            <>
              <div className="col-md-4">
                <FormGroup style={{ marginBottom: "16px" }}>
                  <Label style={labelStyle}>
                    Date Enrolled in OVC <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="date"
                    value={val("dateEnrolledOvc")}
                    onChange={readOnly ? undefined : (e) => set("dateEnrolledOvc", e.target.value)}
                    max={today}
                    onKeyPress={(e) => e.preventDefault()}
                    disabled={readOnly}
                    style={readOnly ? disabledInputStyle : inputStyle}
                  />
                  {touched.dateEnrolledOvc && errors.dateEnrolledOvc && (
                    <span style={errorStyle}>{errors.dateEnrolledOvc}</span>
                  )}
                </FormGroup>
              </div>
              <div className="col-md-4">
                <FormTextField label="OVC ID" {...fp("ovcId")} required />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactCard;
