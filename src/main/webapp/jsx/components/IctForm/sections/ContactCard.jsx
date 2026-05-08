// ContactCard.jsx
import React, { useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import {
  FormSelect,
  FormTextField,
  SectionSubheading,
  labelStyle,
  inputStyle,
  selectStyle,
} from "../../NewToolForms/sections/FormFields";
import { COLORS } from "../../NewToolForms/constants";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";

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

const disabledSelectStyle = {
  ...selectStyle,
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

const checkboxRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: "14px",
  color: "#24292f",
  marginBottom: 12,
  userSelect: "none",
};

const ContactCard = ({
  contact, index, indexAddress, indexPhone, readOnly,
  onChange, onRemove,
  errors = {}, touched = {},
}) => {
  const [codesets, setCodesets] = useState(null);

  useGetCodesets({
    codesetsKeys: [
      "YES_NO", "SEX", "HIV_TEST_RESULT", "RELATIONSHIP_CONTACT",
      "NOTIFICATION_CONTACT", "FOLLOW UP_APPOINTMENT_LOCATION"
    ],
    patientId: `contactCard_${index}`,
    onSuccess: (data) => setCodesets(data),
  });

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: capitalizeFirstLetter(item.display),
      value: item.code,
    }));
  };

  const val = (name) => contact[name] ?? "";

  const set = (name, value) => onChange(index, name, value);

  const patch = (patchObj) => onChange(index, patchObj);

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
    name,
    value: val(name),
    onBlur: () => {},
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name],
    disabled: readOnly || extraDisabled,
    options,
  });

  // Handlers
  const handleSameAddress = (e) => {
    if (readOnly) return;
    const checked = e.target.checked;
    if (checked) {
      patch({ sameAddressAsIndex: true, address: indexAddress || "" });
    } else {
      patch({ sameAddressAsIndex: false, address: "" });
    }
  };

  const handleKnownHivChange = (e) => {
    if (readOnly) return;
    const v = e.target.value;
    patch({
      knownHivPositive: v,
      dateTestedHiv: "",
      hivTestResult: "",
      onArt: "",
      dateEnrolledArt: "",
      artClinic: "",
    });
  };

  const handleHivResultChange = (e) => {
    if (readOnly) return;
    const v = e.target.value;
    if (v !== "HIV_TEST_RESULT_POSITIVE") {
      patch({ hivTestResult: v, dateEnrolledArt: "", onArt: "", artClinic: "" });
    } else {
      set("hivTestResult", v);
    }
  };

  const handleOnArt = (e) => {
    if (readOnly) return;
    const v = e.target.value;
    patch({ onArt: v, dateEnrolledArt: "", artClinic: "" });
  };

  const handleEnrolledOvcChange = (e) => {
    if (readOnly) return;
    const checked = e.target.checked;
    if (checked) {
      set("enrolledInOvc", true);
    } else {
      patch({ enrolledInOvc: false, dateEnrolledOvc: "", ovcId: "" });
    }
  };

  const handlePhoneKeyDown = (e) => {
    const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ["a","c","v","x"].includes(e.key.toLowerCase())) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const handlePhonePaste = (e) => {
    if (readOnly) return;
    const pasted = e.clipboardData.getData("text");
    const digitsOnly = pasted.replace(/\D/g, "");
    e.preventDefault();
    set("phone", digitsOnly);
  };

  const isKnownPositive = val("knownHivPositive") === "YES_NO_YES";
  const isKnownNegative = val("knownHivPositive") === "YES_NO_NO";
  const showArtEnrollDate = isKnownPositive || val("hivTestResult") === "HIV_TEST_RESULT_POSITIVE";
  const showisArtStartDate = val("onArt") === "YES_NO_YES";

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={contactBadgeStyle}>{index + 1}</span>
          {contact.contactCode && (
            <span style={{
              marginLeft: 10, fontSize: "11px", color: "#57606a", fontFamily: "monospace",
              background: "#f0f0f0", padding: "2px 8px", borderRadius: 4,
            }}>
              Code: {contact.contactCode}
            </span>
          )}
        </div>
        {!readOnly && (
          <button type="button" onClick={() => onRemove(index)} style={{
            background: "none", border: "1px solid #d32f2f", color: "#d32f2f",
            borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
          }}>Remove</button>
        )}
      </div>

      {/* Identity */}
      <div className="row">
        <div className="col-md-4"><FormTextField label="Contact Code" {...fp("contactCode")} required disabled /></div>
        <div className="col-md-4"><FormTextField label="First Name of Contact" {...fp("firstName")} required /></div>
        <div className="col-md-4"><FormTextField label="Middle Name of Contact" {...fp("middleName")} /></div>
        <div className="col-md-4"><FormTextField label="Surname of Contact" {...fp("surname")} required /></div>
        <div className="col-md-4">
          <FormSelect
            label="Relationship to Index Client"
            {...sp("relationshipToIndex", transformOptions(codesets?.["RELATIONSHIP_CONTACT"]))}
            onChange={(e) => !readOnly && set("relationshipToIndex", e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormSelect
            label="Sex"
            {...sp("sex", transformOptions(codesets?.["SEX"]))}
            onChange={(e) => !readOnly && set("sex", e.target.value)}
            required
          />
        </div>
        {/* Age fields removed */}
      </div>

      {/* Address / Phone */}
      <div className="row">
        <div className="col-md-12">
          <label style={{ ...checkboxRowStyle, cursor: readOnly ? "default" : "pointer" }}>
            <input type="checkbox" checked={!!contact.sameAddressAsIndex} onChange={handleSameAddress} disabled={readOnly} />
            Contact lives at the same address as the index client
          </label>
        </div>
        <div className="col-md-12">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Contact Phone Number</Label>
            <Input
              type="text" name="phone" value={val("phone")}
              onChange={(e) => { const clean = e.target.value.replace(/\D/g, ""); set("phone", clean); }}
              onKeyDown={handlePhoneKeyDown} onPaste={handlePhonePaste} maxLength={11} disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle} placeholder="Numbers only"
            />
            {touched.phone && errors.phone && <span style={errorStyle}>{errors.phone}</span>}
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormTextField label="Home / Contact Address (include landmark)" type="textarea" {...fp("address")} disabled={readOnly || !!contact.sameAddressAsIndex} />
        </div>
      </div>

      {/* Notification & Follow-up */}
      <div className="row">
        <div className="col-md-4">
          <FormSelect
            label="Notification Method Selected"
            {...sp("notificationMethod", transformOptions(codesets?.["NOTIFICATION_CONTACT"]))}
            onChange={(e) => !readOnly && set("notificationMethod", e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormSelect
            label="Follow-Up Appointment Location"
            {...sp("followUpLocation", transformOptions(codesets?.["FOLLOW UP_APPOINTMENT_LOCATION"]))}
            onChange={(e) => !readOnly && set("followUpLocation", e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Number of Follow-Up Attempts (0–6)</Label>
            <Input
              type="number" name="attempts" value={val("attempts")}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || (Number(v) >= 0 && Number(v) <= 6 && !v.includes("."))) set("attempts", v);
              }}
              onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }}
              min="0" max="6" step="1" disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
            />
            {touched.attempts && errors.attempts && <span style={errorStyle}>{errors.attempts}</span>}
          </FormGroup>
        </div>
      </div>

      {/* HIV Testing & Linkage */}
      <SectionSubheading>HIV Testing &amp; Linkage</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Known HIV Positive? <span style={{ color: "red" }}>*</span></Label>
            <select
              className="form-control" name="knownHivPositive" value={val("knownHivPositive") ?? ""}
              onChange={handleKnownHivChange} disabled={readOnly}
              style={readOnly ? disabledSelectStyle : selectStyle}
            >
              <option value="">Select option</option>
              {transformOptions(codesets?.["YES_NO"]).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {touched.knownHivPositive && errors.knownHivPositive && <span style={errorStyle}>{errors.knownHivPositive}</span>}
          </FormGroup>
        </div>

        {isKnownPositive && (
          <>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>Date Previously Tested for HIV <span style={{ color: "red" }}>*</span></Label>
                <Input type="date" value={val("dateTestedHiv")}
                  onChange={(e) => !readOnly && set("dateTestedHiv", e.target.value)}
                  max={today} onKeyPress={(e) => e.preventDefault()} disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle} />
                {touched.dateTestedHiv && errors.dateTestedHiv && <span style={errorStyle}>{errors.dateTestedHiv}</span>}
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormSelect
                label="On ART ?"
                {...sp("onArt", transformOptions(codesets?.["YES_NO"]))}
                onChange={readOnly ? undefined : handleOnArt}
              />
            </div>
            {showisArtStartDate && (
              <>
                <div className="col-md-4">
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <Label style={labelStyle}>Date Enrolled on ART <span style={{ color: "red" }}>*</span></Label>
                    <Input type="date" value={val("dateEnrolledArt")}
                      onChange={(e) => !readOnly && set("dateEnrolledArt", e.target.value)}
                      max={today} onKeyPress={(e) => e.preventDefault()} disabled={readOnly}
                      style={readOnly ? disabledInputStyle : inputStyle} />
                    {touched.dateEnrolledArt && errors.dateEnrolledArt && <span style={errorStyle}>{errors.dateEnrolledArt}</span>}
                  </FormGroup>
                </div>
                <div className="col-md-4">
                  <FormTextField label="ART Clinic" {...fp("artClinic")} required />
                </div>
              </>
            )}
          </>
        )}

        {isKnownNegative && (
          <>
            <div className="col-md-4">
              <FormSelect
                label="HIV Test Result"
                {...sp("hivTestResult", transformOptions(codesets?.["HIV_TEST_RESULT"]))}
                onChange={handleHivResultChange}
                required
              />
            </div>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>Date Contact Tested <span style={{ color: "red" }}>*</span></Label>
                <Input type="date" value={val("dateTestedHiv")}
                  onChange={(e) => !readOnly && set("dateTestedHiv", e.target.value)}
                  max={today} onKeyPress={(e) => e.preventDefault()} disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle} />
                {touched.dateTestedHiv && errors.dateTestedHiv && <span style={errorStyle}>{errors.dateTestedHiv}</span>}
              </FormGroup>
            </div>
            {showArtEnrollDate && (
              <>
                <div className="col-md-4">
                  <FormSelect
                    label="On ART ?"
                    {...sp("onArt", transformOptions(codesets?.["YES_NO"]))}
                    onChange={readOnly ? undefined : handleOnArt}
                  />
                </div>
                {showisArtStartDate && (
                  <>
                    <div className="col-md-4">
                      <FormGroup style={{ marginBottom: "16px" }}>
                        <Label style={labelStyle}>Date Enrolled on ART <span style={{ color: "red" }}>*</span></Label>
                        <Input type="date" value={val("dateEnrolledArt")}
                          onChange={(e) => !readOnly && set("dateEnrolledArt", e.target.value)}
                          max={today} onKeyPress={(e) => e.preventDefault()} disabled={readOnly}
                          style={readOnly ? disabledInputStyle : inputStyle} />
                        {touched.dateEnrolledArt && errors.dateEnrolledArt && <span style={errorStyle}>{errors.dateEnrolledArt}</span>}
                      </FormGroup>
                    </div>
                    <div className="col-md-4">
                      <FormTextField label="ART Clinic" {...fp("artClinic")} required />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* OVC (now always visible) */}
      <div className="row" style={{ marginTop: 4 }}>
        <div className="col-md-12">
          <label style={{ ...checkboxRowStyle, cursor: readOnly ? "default" : "pointer" }}>
            <input type="checkbox" checked={!!contact.enrolledInOvc} onChange={handleEnrolledOvcChange} disabled={readOnly} />
            Contact is enrolled in OVC program
          </label>
        </div>
        {!!contact.enrolledInOvc && (
          <>
            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>Date Enrolled in OVC <span style={{ color: "red" }}>*</span></Label>
                <Input type="date" value={val("dateEnrolledOvc")}
                  onChange={(e) => !readOnly && set("dateEnrolledOvc", e.target.value)}
                  max={today} onKeyPress={(e) => e.preventDefault()} disabled={readOnly}
                  style={readOnly ? disabledInputStyle : inputStyle} />
                {touched.dateEnrolledOvc && errors.dateEnrolledOvc && <span style={errorStyle}>{errors.dateEnrolledOvc}</span>}
              </FormGroup>
            </div>
            <div className="col-md-4">
              <FormTextField label="OVC ID" {...fp("ovcId")} required />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactCard;