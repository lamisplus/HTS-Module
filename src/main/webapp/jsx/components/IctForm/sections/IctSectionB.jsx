/**
 * IctSectionB.jsx — Contact Enumeration & Testing Tracker
 *
 * Rendered only when the parent decides to show it (acceptedPns logic
 * is handled in IctForm, not here). This component just renders the
 * list of ContactCards plus the Add button.
 *
 * If sectionLocked=true, shows a greyed-out overlay with explanatory message.
 */

import React from "react";
import { Button } from "semantic-ui-react";
import ContactCard from "./ContactCard";
import { makeBlankContact } from "../hooks/useIctFormik";
import { COLORS } from "../../NewToolForms/constants";
import { SectionSubheading } from "../../NewToolForms/sections/FormFields";

const lockedOverlayStyle = {
  padding: "24px",
  background: "#f6f8fa",
  border: "1px dashed #d0d7de",
  borderRadius: "6px",
  textAlign: "center",
  color: "#57606a",
  fontSize: "14px",
};

const lockIconStyle = {
  fontSize: "28px",
  display: "block",
  marginBottom: "8px",
  color: "#d0d7de",
};

const IctSectionB = ({
  formik,
  sectionLocked,
  lockReason,
  readOnly = false,
}) => {
  const { values, setFieldValue, errors, touched } = formik;
  const contacts = values.contacts || [];

  // ── Contact array management ──────────────────────────────────────────────

  const handleAddContact = () => {
    const newContact = makeBlankContact(values.indexClientId, contacts.length);
    setFieldValue("contacts", [...contacts, newContact]);
  };

  const handleRemoveContact = (idx) => {
    const updated = contacts.filter((_, i) => i !== idx);
    setFieldValue("contacts", updated);
  };

  // Handles two call signatures from ContactCard:
  //   (idx, fieldName, value)  → single field update
  //   (idx, patchObject)       → atomic multi-field update (object as 2nd arg)
  //
  // The patch signature is critical for checkboxes and dropdowns that must
  // clear dependent fields simultaneously. Without it, a forEach loop calling
  // this handler multiple times reads the same stale contacts closure each time,
  // causing all but the last update to be lost.
  const handleContactChange = (idx, fieldOrPatch, value) => {
    const updated = contacts.map((c, i) => {
      if (i !== idx) return c;
      if (typeof fieldOrPatch === "object" && fieldOrPatch !== null) {
        // Patch object — spread all fields atomically
        return { ...c, ...fieldOrPatch };
      }
      // Single field
      return { ...c, [fieldOrPatch]: value };
    });
    setFieldValue("contacts", updated);
  };

  // ── Locked state ──────────────────────────────────────────────────────────

  if (sectionLocked) {
    return (
      <div style={lockedOverlayStyle}>
        <span style={lockIconStyle}>🔒</span>
        <strong style={{ display: "block", marginBottom: 6, color: "#24292f" }}>
          Section B is not available
        </strong>
        <span>{lockReason}</span>
      </div>
    );
  }

  // ── Active state ──────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: "14px", color: "#57606a", margin: 0 }}>
          Add each elicited contact below. Each contact receives a unique
          auto-generated ID.
          {contacts.length > 0 && (
            <strong style={{ marginLeft: 6, color: COLORS.primary }}>
              {contacts.length} contact{contacts.length > 1 ? "s" : ""} added
            </strong>
          )}
        </p>
        {!readOnly && (
          <Button
            type="button"
            icon="plus"
            content="Add Contact"
            labelPosition="left"
            size="small"
            onClick={handleAddContact}
            style={{ backgroundColor: COLORS.primary, color: "#fff" }}
          />
        )}
      </div>

      {contacts.length === 0 && !readOnly && (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            background: "#f6f8fa",
            border: "1px dashed #d0d7de",
            borderRadius: "6px",
            color: "#57606a",
            fontSize: "14px",
            marginBottom: 16,
          }}
        >
          No contacts added yet. Click <strong>Add Contact</strong> to begin.
        </div>
      )}

      {contacts.map((contact, idx) => (
        <ContactCard
          key={contact.contactId}
          contact={contact}
          index={idx}
          indexAddress={values.indexAddress}
          indexPhone={values.indexPhone}
          readOnly={readOnly}
          onChange={handleContactChange}
          onRemove={handleRemoveContact}
          // Per-contact errors aren't structured by Formik's array path here
          // so we pass empty objects; the contactSchema runs on submit via
          // the parent contacts test in ictValidationSchema.
          errors={{}}
          touched={{}}
        />
      ))}

      {/* Top-level contacts validation error (e.g. "at least one required") */}
      {touched.contacts && errors.contacts && typeof errors.contacts === "string" && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fff3f3",
            border: "1px solid #f85032",
            borderRadius: 4,
            color: "#f85032",
            fontSize: "13px",
            marginTop: 8,
          }}
        >
          {errors.contacts}
        </div>
      )}
    </div>
  );
};

export default IctSectionB;