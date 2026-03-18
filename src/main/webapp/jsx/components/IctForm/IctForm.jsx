/**
 * IctForm.jsx
 *
 * Main ICT form component. Handles both CREATE and UPDATE flows.
 *
 * Props
 * ─────
 * htsValues       {Object}   Formik values snapshot from the completed HTS form.
 *                            Used to pre-populate Section A index client fields.
 * htsRecord       {Object}   Full HTS API response after HTS submission.
 *                            Provides htsRecord.id for the backend FK link.
 * isOnArt         {boolean}  Shows ART Clinic field in Section A when true.
 * onSubmitSuccess {Function} Called with (ictResponse) after a successful save.
 * onBack          {Function} Called when the Back button is pressed.
 * readOnly        {boolean}  View-only mode — all fields disabled, no submit button.
 * initialValues   {Object}   Pre-populates the full form from an existing ICT record
 *                            (used for view and edit modes).
 * existingId      {number}   When provided, the form PUTs to update this record
 *                            instead of POSTing a new one.
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
import { createIctEncounter } from "./services/createIctEncounter.service";
import { updateIctEncounter } from "./services/updateIctEncounter.service";
import { COLORS } from "../NewToolForms/constants";
import { getHtsEcounter } from "../../services/getHtsEncounter";

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

const modeBadgeStyle = (mode) => {
  const config = {
    view:   { background: "#e8f0f7", color: COLORS.primary,  label: "View"   },
    edit:   { background: "#fff3e0", color: "#e65100",        label: "Edit"   },
    new:    { background: "#e8f5e9", color: "#2e7d32",        label: "New"    },
  };
  const c = config[mode] || config.new;
  return {
    style: {
      display: "inline-block",
      padding: "2px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      background: c.background,
      color: c.color,
    },
    label: c.label,
  };
};

// ─── API response → Formik mapper ────────────────────────────────────────────
//
// The ICT API response stores index client fields and facility snapshot inside
// the `data` JSONB column. This function flattens them to the top-level formik
// field names so the form populates correctly in view/edit mode.
//
// Top-level fields on the response (already named correctly):
//   id, uuid, personId, htsEncounterId, facilityId, dateOfService,
//   setting, clientCategory, offeredPns, acceptedPns, contacts
//
// Fields nested inside response.data (need flattening):
//   facilityName, state, lga, facilitySetting, communityEntryPoint,
//   artClinic, clientCategoryOther,
//   indexClientId, artUniqueId, indexFirstName, indexMiddleName, indexSurname,
//   indexSex, indexDob, indexAge, indexPhone, indexAltPhone, indexAddress
//
const mapIctResponseToFormValues = (response) => {
  if (!response) return {};

  // data is a JsonNode serialised as a plain object by Jackson
  const d = response.data ?? {};

  return {
    // ── Top-level scalars ────────────────────────────────────────────────
    personId:        response.personId        ?? "",
    htsEncounterId:  response.htsEncounterId  ?? "",
    facilityId:      response.facilityId      ?? "",
    dateOfService:   response.dateOfService   ?? "",
    setting:         response.setting         ?? "",
    clientCategory:  response.clientCategory  ?? "",
    offeredPns:      response.offeredPns      ?? "",
    acceptedPns:     response.acceptedPns     ?? "",

    // ── From data JSONB — facility context ───────────────────────────────
    facilityName:        d.facilityName        ?? "",
    state:               d.state               ?? "",
    lga:                 d.lga                 ?? "",
    facilitySetting:     d.facilitySetting     ?? "",
    communityEntryPoint: d.communityEntryPoint ?? "",
    artClinic:           d.artClinic           ?? "",
    clientCategoryOther: d.clientCategoryOther ?? "",

    // ── From data JSONB — index client snapshot ──────────────────────────
    indexClientId:   d.indexClientId   ?? "",
    artUniqueId:     d.artUniqueId     ?? "",
    indexFirstName:  d.indexFirstName  ?? "",
    indexMiddleName: d.indexMiddleName ?? "",
    indexSurname:    d.indexSurname    ?? "",
    indexSex:        d.indexSex        ?? "",
    indexDob:        d.indexDob        ?? "",
    indexAge:        d.indexAge        != null ? String(d.indexAge) : "",
    indexPhone:      d.indexPhone      ?? "",
    indexAltPhone:   d.indexAltPhone   ?? "",
    indexAddress:    d.indexAddress    ?? "",

    // ── Contacts — already a properly shaped array from the API ─────────
    // Each contact object field names match formik exactly (contactSex,
    // contactAgeGroup, knownHivPositive, etc.) so no per-field mapping needed.
    contacts: Array.isArray(response.contacts) ? response.contacts : [],
  };
};

const IctForm = ({
  htsValues,
  htsRecord,
  isOnArt = false,
  onSubmitSuccess,
  onBack,
  readOnly = false,
  initialValues,
  existingId,       // Present when editing an existing ICT record
}) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!existingId && !readOnly;
  const mode = readOnly ? "view" : isEditMode ? "edit" : "new";

  // Merge isOnArt flag into htsValues so the hook can access it
  const mergedHtsValues = htsValues ? { ...htsValues, isOnArt } : null;

  const onSubmit = async (values) => {
    const payload = buildIctEncounterPayload(values);

    // Attach the HTS encounter id so the backend can link the two records.
    // htsRecord comes from the HTS API response; existingId's hts link is
    // already stored server-side but we still send it for idempotency.
    if (htsRecord?.id) {
      payload.htsEncounterId = htsRecord.id;
    }

    // personId must be on the payload — sourced from htsValues or initialValues
    if (!payload.personId) {
      const pid = values.personId
        || htsRecord?.personId
        || initialValues?.personId;
      if (pid) payload.personId = pid;
    }

    try {
      setIsLoading(true);

      let response;
      if (isEditMode) {
        response = await updateIctEncounter(existingId, payload);
        toast.success("ICT record updated successfully");
      } else {
        response = await createIctEncounter(payload);
        toast.success("ICT record saved successfully");
      }

      onSubmitSuccess?.(response);
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.defaultMessage ||
        err?.message ||
        "Unknown error";
      console.error("ICT submission failed:", serverMessage);
      toast.error(`Failed to save ICT record: ${serverMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hydrate formik:
  //   - New record  → seed from HTS values (index client demographics pre-fill)
  //   - View/Edit   → initialValues override everything
  const { formik } = useIctFormik(
    onSubmit,
    initialValues ? undefined : mergedHtsValues
  );

  // If viewing or editing an existing record:
  // 1. Flatten the ICT API response through mapIctResponseToFormValues and seed formik.
  // 2. Then use htsEncounterId to fetch the linked HTS encounter and extract
  //    clientState, clientLga, facilityName from its data JSONB — these are
  //    not stored on the ICT record itself.
  React.useEffect(() => {
    if (!initialValues) return;

    // Step 1: seed all ICT fields immediately
    const mapped = mapIctResponseToFormValues(initialValues);
    Object.entries(mapped).forEach(([k, v]) =>
      formik.setFieldValue(k, v, false)
    );

    // Step 2: fetch the linked HTS encounter for state, LGA, facilityName
    const htsId = initialValues.htsEncounterId;
    if (!htsId) return;

    getHtsEcounter(htsId)
      .then((res) => {
        // getHtsEcounter returns response.data (already unwrapped by axios)
        const htsData = res?.data ?? res;
        const d = htsData?.data ?? {};

        // clientState and clientLga are numeric IDs stored in the HTS JSONB.
        // IctSectionA will resolve them to display names via the org-units API.
        if (d.clientState != null) formik.setFieldValue("state",        String(d.clientState), false);
        if (d.clientLga   != null) formik.setFieldValue("lga",          String(d.clientLga),   false);
        if (d.facilityName)        formik.setFieldValue("facilityName",  d.facilityName,        false);
      })
      .catch((err) => {
        console.error("IctForm: failed to fetch linked HTS record for state/LGA", err?.message);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { values, errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;

  const sectionHasError = (fields) =>
    hasSubmitted && fields.some((f) => !!errors[f]);

  const sectionAFields = [
    "dateOfService", "setting", "facilitySetting", "communityEntryPoint",
    "clientCategory", "clientCategoryOther", "offeredPns", "acceptedPns",
  ];

  // ── Section B gate logic ─────────────────────────────────────────────────
  const offeredLower = values.offeredPns?.toLowerCase() ?? "";
  const acceptedLower = values.acceptedPns?.toLowerCase() ?? "";

  const pnsNotOffered   = offeredLower === "no";
  const pnsDeclined     = offeredLower === "yes" && acceptedLower === "no";
  const offeredPnsUnset = !values.offeredPns;

  const sectionBLocked = pnsNotOffered || pnsDeclined || offeredPnsUnset;

  const lockReason = pnsNotOffered
    ? "PNS was not offered to the index client. Section B is not applicable."
    : pnsDeclined
    ? "The index client declined PNS. Section B is not applicable."
    : "Please complete the 'Offered PNS' and 'Accepted PNS' fields in Section A first.";

  const badge = modeBadgeStyle(mode);

  return (
    <div className={classes.root}>
      {/* ── Top bar ── */}
      <div className={classes.topBar}>
        <div>
          <h2 className={classes.title}>
            Index Contact Testing (ICT) Form
            <span style={badge.style}>{badge.label}</span>
          </h2>
          <p className={classes.subtitle}>
            {readOnly
              ? "Viewing ICT record — no changes can be made"
              : isEditMode
              ? "Editing existing ICT record — all fields are editable"
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
                content={
                  isLoading
                    ? isEditMode ? "Updating..." : "Saving..."
                    : isEditMode ? "Update ICT Record" : "Save ICT Record"
                }
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