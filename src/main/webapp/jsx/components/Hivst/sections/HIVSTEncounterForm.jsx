import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { url, token } from "../../../../api";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "semantic-ui-react";
import { useHIVSTFormik } from "../hooks/useHIVSTFormik";
import FormAccordion from "../../NewToolForms/sections/FormAccordion";
import HIVSTBasicInformationSection from "./HIVSTBasicInformationSection";
import HIVSTPostTestCounsellingSection from "./HIVSTPostTestCounsellingSection";
import { COLORS } from "../../NewToolForms/constants";
import {
  createHivstEncounter,
  updateHivstEncounter,
  getHivstEncounter,
} from "../../../services/hivst.service";
import { toast } from "react-toastify";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: "#f6f8fa",
    minHeight: "100vh",
    padding: "0",
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
  titleBlock: {},
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: COLORS.primary,
    margin: 0,
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#57606a",
    marginTop: 4,
    marginBottom: 0,
  },
  body: {
    padding: "28px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "8px",
    paddingBottom: "24px",
  },
  centerNote: {
    padding: "80px 0",
    textAlign: "center",
    color: "#57606a",
    fontSize: "14px",
  },
}));

/**
 * Maps a fetched HIVST encounter record (GET /hivst-encounter/:id) back onto
 * formik fields. Assumes the response is flat and mirrors the create/update
 * payload shape below. If your API wraps the record (e.g. { data: {...} }),
 * adjust the unwrap on the getHivstEncounter().then(...) call.
 */
/**
 * generateClientCode() (see htsEncounterPayload.js) always appends serialNumber
 * as the LAST "/"-separated segment of clientCode, regardless of whether the
 * code has 5 segments (setting = OTHERS) or 6 (facility/community with a
 * subtype) - so extraction is just "take the last segment".
 */
const extractSerialNumberFromClientCode = (clientCode) => {
  if (!clientCode || typeof clientCode !== "string") return "";
  const segments = clientCode.split("/");
  if (segments.length < 2) return "";
  return segments[segments.length - 1] || "";
};

const mapEncounterToInitialValues = (encounter) => {
  // The backend (HivstEncounterResponseDTO) only returns id/patientId/clientCode/
  // dateOfVisit/setting/facilityId at the top level - every other HIVST-specific
  // field lives inside `observation` (a JSONB blob), exactly like HTS's
  // HtsEncounterResponse. serialNumber is never persisted server-side on either
  // HTS or HIVST (it's only ever used client-side to help build clientCode), so
  // it can't be recovered on edit - same limitation as HTS.
  const obs = encounter.observation || {};
  return {
    dateOfVisit: encounter.dateOfVisit ?? "",
    serialNumber: extractSerialNumberFromClientCode(encounter.clientCode),
    clientCode: encounter.clientCode ?? "",
    setting: encounter.setting ?? "",
    facilitySetting: obs.facilitySetting ?? "",
    communityEntryPoint: obs.communityEntryPoint ?? "",
    typeOfSession: obs.typeOfSession ?? "",
    htsPopulationType: obs.htsPopulationType ?? "",
    indexTesting: obs.indexTesting ?? "",
    indexRelationship: obs.indexRelationship ?? "",
    indexClientCode: obs.indexClientCode ?? "",
    numberOfWives: obs.numberOfWives ?? "",
    numberOfCoWives: obs.numberOfCoWives ?? "",
    numberOfBiologicalChildren: obs.numberOfBiologicalChildren ?? "",
    pregnancyStatus: obs.pregnancyStatus ?? "",
    breastfeedingDuration: obs.breastfeedingDuration ?? "",
    hivTestKitsProvided: obs.hivTestKitsProvided ?? "",
    categoryOfClients: obs.categoryOfClients ?? "",
    numberOfHivstKitDistributed: obs.numberOfHivstKitDistributed ?? "",
    completedBy: obs.completedBy ?? "",
    designation: obs.designation ?? "",
    currentOrganisationUnitId: encounter.facilityId ?? "",
  };
};

/**
 * @param {Object}   patientObj            Patient/person object (same shape used elsewhere in PatientHistory).
 * @param {string}   [patientId]           Optional override; otherwise derived from patientObj.
 * @param {string}   [existingEncounterId] When present, form loads + edits/views that encounter instead of creating a new one.
 * @param {boolean}  [readOnly]            View mode - renders read-only with an "Edit" escape hatch.
 * @param {Function} [onBack]              Called when the Back button is clicked.
 * @param {Function} [onSuccess]           Called with the API response after a successful create/update.
 */
const HIVSTEncounterForm = ({
  patientObj,
  patientId: patientIdProp,
  existingEncounterId,
  readOnly = false,
  onBack,
  onSuccess,
}) => {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingEncounter, setIsFetchingEncounter] = useState(!!existingEncounterId);
  const [fetchedEncounter, setFetchedEncounter] = useState(null);
  const [forceEdit, setForceEdit] = useState(false);
  const [patientDetail, setPatientDetail] = useState(null);
  const [isFetchingPatient, setIsFetchingPatient] = useState(true);

  const patientId = patientIdProp ?? patientObj?.personId ?? patientObj?.id ?? "";
  const effectiveReadOnly = readOnly && !forceEdit;

  // Always fetch the FULL patient detail fresh (marital status, address,
  // state/LGA, etc. all live here - the lightweight patientObj passed down
  // from PatientHistory only carries name/id/age).
  useEffect(() => {
    let isMounted = true;
    if (!patientId) {
      setIsFetchingPatient(false);
      return undefined;
    }
    setIsFetchingPatient(true);
    axios
      .get(`${url}patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (isMounted) setPatientDetail(response.data);
      })
      .catch((error) => {
        console.error("Failed to load patient detail:", error);
        toast.error("Failed to load patient details.");
      })
      .finally(() => {
        if (isMounted) setIsFetchingPatient(false);
      });
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  useEffect(() => {
    let isMounted = true;
    if (!existingEncounterId) {
      setIsFetchingEncounter(false);
      setFetchedEncounter(null);
      return undefined;
    }
    setIsFetchingEncounter(true);
    getHivstEncounter(existingEncounterId)
      .then((data) => {
        if (isMounted) setFetchedEncounter(data?.data ?? data);
      })
      .catch((error) => {
        console.error("Failed to load HIVST encounter:", error);
        toast.error("Failed to load HIVST encounter details.");
      })
      .finally(() => {
        if (isMounted) setIsFetchingEncounter(false);
      });
    return () => {
      isMounted = false;
    };
  }, [existingEncounterId]);

  // The patient-detail endpoint doesn't return `age` - fall back to the
  // lightweight patientObj's age (already computed server-side) for display
  // purposes only; it isn't part of the encounter payload.
  const mergedPatientData = useMemo(() => {
    if (!patientDetail) return null;
    return { ...patientDetail, age: patientDetail.age ?? patientObj?.age ?? "" };
  }, [patientDetail, patientObj]);

  const initialValues = useMemo(() => {
    if (!fetchedEncounter) {
      return { patientId };
    }
    return {
      patientId,
      ...mapEncounterToInitialValues(fetchedEncounter),
    };
  }, [patientId, fetchedEncounter]);

  const onSubmit = async (values) => {
    const payload = {
      patientId,
      dateOfVisit: values.dateOfVisit,
      clientCode: values.clientCode,
      serialNumber: values.serialNumber,
      facilityId: values.currentOrganisationUnitId,
      setting: values.setting,
      facilitySetting: values.facilitySetting,
      communityEntryPoint: values.communityEntryPoint,
      typeOfSession: values.typeOfSession,
      htsPopulationType: values.htsPopulationType,
      indexTesting: values.indexTesting,
      indexRelationship: values.indexRelationship,
      indexClientCode: values.indexClientCode,
      numberOfWives: values.numberOfWives ? Number(values.numberOfWives) : null,
      numberOfCoWives: values.numberOfCoWives ? Number(values.numberOfCoWives) : null,
      numberOfBiologicalChildren: values.numberOfBiologicalChildren
        ? Number(values.numberOfBiologicalChildren)
        : null,
      pregnancyStatus: values.pregnancyStatus,
      breastfeedingDuration: values.breastfeedingDuration,
      hivTestKitsProvided: values.hivTestKitsProvided,
      categoryOfClients: values.categoryOfClients,
      numberOfHivstKitDistributed: values.numberOfHivstKitDistributed
        ? Number(values.numberOfHivstKitDistributed)
        : null,
      completedBy: values.completedBy,
      designation: values.designation,
    };

    try {
      setIsSubmitting(true);
      let response;
      if (existingEncounterId) {
        response = await updateHivstEncounter(existingEncounterId, payload);
        toast.success("HIVST encounter updated successfully");
      } else {
        response = await createHivstEncounter(payload);
        toast.success("HIVST encounter created successfully");
      }
      onSuccess?.(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save encounter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { formik } = useHIVSTFormik(onSubmit, initialValues);
  const { errors, submitCount } = formik;
  const hasSubmitted = submitCount > 0;
  const sectionHasError = (fields) => hasSubmitted && fields.some((f) => !!errors[f]);

  const basicFields = [
    "dateOfVisit", "clientCode", "setting", "facilitySetting", "communityEntryPoint",
    "typeOfSession", "htsPopulationType", "indexRelationship", "indexClientCode", "serialNumber",
  ];
  const hivstFields = [
    "hivTestKitsProvided", "categoryOfClients", "numberOfHivstKitDistributed", "completedBy", "designation",
  ];

  const mode = existingEncounterId ? (effectiveReadOnly ? "View" : "Edit") : "New";
  const badgeStyle = {
    New: { background: "#e8f5e9", color: "#2e7d32" },
    Edit: { background: "#fff3e0", color: "#e65100" },
    View: { background: "#e3f2fd", color: "#1565c0" },
  }[mode];

  if (isFetchingEncounter || isFetchingPatient) {
    return (
      <div className={classes.root}>
        <div className={classes.centerNote}>Loading HIVST encounter…</div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.titleBlock}>
          <h2 className={classes.title}>
            HIV Self-Testing Form
            <span
              style={{
                display: "inline-block", padding: "2px 12px", borderRadius: "12px",
                fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em",
                textTransform: "uppercase", ...badgeStyle,
              }}
            >
              {mode}
            </span>
          </h2>
          <p className={classes.subtitle}>
            {mode === "New" && "New HIVST encounter for existing patient"}
            {mode === "Edit" && "Editing existing HIVST record"}
            {mode === "View" && "Viewing HIVST record (read-only)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {readOnly && !forceEdit && (
            <Button
              content="Edit"
              icon="edit"
              labelPosition="left"
              style={{ backgroundColor: "#fff", color: COLORS.primary, border: `1px solid ${COLORS.primary}` }}
              onClick={() => setForceEdit(true)}
            />
          )}
          <Button
            content="Back"
            icon="left arrow"
            labelPosition="left"
            style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            onClick={onBack}
          />
        </div>
      </div>

      <div className={classes.body}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <FormAccordion
            step={1}
            title="Basic Information"
            subtitle="Enter basic information details below"
            defaultExpanded
            hasError={sectionHasError(basicFields)}
          >
            <HIVSTBasicInformationSection
              formik={formik}
              readOnly={effectiveReadOnly}
              isExistingPatient
              patientData={mergedPatientData}
            />
          </FormAccordion>

          <FormAccordion
            step={2}
            title="HIVST Details"
            subtitle="Enter HIV self-testing details"
            hasError={sectionHasError(hivstFields)}
          >
            <HIVSTPostTestCounsellingSection formik={formik} readOnly={effectiveReadOnly} />
          </FormAccordion>

          {!effectiveReadOnly && (
            <div className={classes.footer}>
              <Button
                content={isSubmitting ? "Submitting..." : existingEncounterId ? "Update Record" : "Save Record"}
                icon="save"
                labelPosition="right"
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: COLORS.primary, color: "#fff" }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HIVSTEncounterForm;