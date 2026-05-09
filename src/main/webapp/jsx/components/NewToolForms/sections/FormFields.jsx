import React from "react";
import { FormGroup, Label, Input } from "reactstrap";
import { COLORS } from "../constants";

const today = new Date().toISOString().split("T")[0];

export const labelStyle = {
  fontSize: "14px",
  color: "#014d88",
  fontWeight: "bold",
  marginBottom: "4px",
  display: "block",
};

export const inputStyle = {
  border: "1px solid #014D88",
  borderRadius: "0.25rem",
  height: "41px",
  fontSize: "14px",
  width: "100%",
};

export const selectStyle = {
  border: "1px solid #014D88",
  borderRadius: "0.2rem",
  height: "41px",
  fontSize: "14px",
  width: "100%",
  WebkitAppearance: "listbox",
};

const errorStyle = {
  color: "#f85032",
  fontSize: "12.8px",
  marginTop: "4px",
  display: "block",
};

const readOnlyValueStyle = {
  fontSize: "14px",
  color: "#24292f",
  padding: "9px 12px",
  border: "1px solid #d0d7de",
  borderRadius: "0.25rem",
  background: "#f6f8fa",
  minHeight: "41px",
  display: "block",
};

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  helperText,
  disabled,
  required,
}) => (
  <FormGroup style={{ marginBottom: "16px" }}>

    {console.log("formfields",options)}
    <Label style={labelStyle}>
      {label}
      {required && <span style={{ color: "red" }}> *</span>}
    </Label>
    <select
      className="form-control"
      name={name}
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      style={selectStyle}
    >
      <option value="">Select option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {(error || helperText) && (
      <span style={errorStyle}>{helperText || error}</span>
    )}
  </FormGroup>
);

export const FormTextField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  required,
  type = "text",
  rows,
  min,
}) => (
  <FormGroup style={{ marginBottom: "16px" }}>
    <Label style={labelStyle}>
      {label}
      {required && <span style={{ color: "red" }}> *</span>}
    </Label>
    <Input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      rows={rows}
      min={min}
      max={type === "date" ? today : undefined}
      onKeyPress={type === "date" ? (e) => e.preventDefault() : undefined}
      style={
        type === "textarea"
          ? { ...inputStyle, height: "100px", resize: "vertical" }
          : inputStyle
      }
    />
    {(error || helperText) && (
      <span style={errorStyle}>{helperText || error}</span>
    )}
  </FormGroup>
);

export const ReadOnlyField = ({ label, value }) => (
  <FormGroup style={{ marginBottom: "16px" }}>
    <Label style={labelStyle}>{label}</Label>
    <span style={readOnlyValueStyle}>{value || "—"}</span>
  </FormGroup>
);

export const SectionSubheading = ({ children }) => (
  <div
    style={{
      fontSize: "15px",
      fontWeight: 700,
      color: COLORS.primary,
      marginTop: "12px",
      marginBottom: "12px",
      paddingBottom: "6px",
      borderBottom: `2px solid ${COLORS.primaryLight}`,
      width: "100%",
    }}
  >
    {children}
  </div>
);

export const ScoreDisplay = ({ label, score }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginTop: "4px",
      marginBottom: "16px",
      fontSize: "14px",
      color: "#24292f",
      fontWeight: 600,
    }}
  >
    {label}
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "40px",
        height: "40px",
        borderRadius: "6px",
        background: COLORS.primary,
        color: "#fff",
        fontWeight: 700,
        fontSize: "16px",
        marginLeft: "12px",
        padding: "0 10px",
      }}
    >
      {score}
    </span>
  </div>
);