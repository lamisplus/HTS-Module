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
    view: { background: "#e8f0f7", color: COLORS.primary, label: "View" },
    edit: { background: "#fff3e0", color: "#e65100", label: "Edit" },
    new: { background: "#e8f5e9", color: "#2e7d32", label: "New" },
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


const mapIctResponseToFormValues = (response) => {
  if (!response) return {};
  const d = response.data ?? {};


  return {
    patientId: response.patientId ?? "",
    htsEncounterId: response.htsEncounterId ?? "",
    facilityId: response.facilityId ?? "",
    dateOfService: response.dateOfService ?? "",
    setting: response.setting ?? "",
    clientCategory: response.clientCategory ?? "",
    clientCategoryOther: response?.clientCategoryOther || d?.clientCategoryOther | "",
    offeredPns: response.offeredPns ?? "",
    acceptedPns: response.acceptedPns ?? "",


    // These are stored in the encounter's data JSONB
    facilityName: d.facilityName ?? "",
    state: d.state ?? "",   // numeric id string
    lga: d.lga ?? "",   // numeric id string
    facilitySetting: d.facilitySetting ?? "",
    communityEntryPoint: d.communityEntryPoint ?? "",
    artClinic: d.artClinic ?? "",
    // clientCategoryOther: d.clientCategoryOther ?? "",

    indexClientId: d.indexClientId ?? "",
    artUniqueId: d.artUniqueId ?? "",
    indexFirstName: d.indexFirstName ?? "",
    indexMiddleName: d.indexMiddleName ?? "",
    indexSurname: d.indexSurname ?? "",
    indexSex: d.indexSex ?? "",   // codeset code - display resolved in Section A
    indexDob: d.indexDob ?? "",
    indexAge: d.indexAge != null ? String(d.indexAge) : "",
    indexPhone: d.indexPhone ?? "",
    indexAltPhone: d.indexAltPhone ?? "",
    indexAddress: d.indexAddress ?? "",

    contacts: Array.isArray(response.contacts)
      ? response.contacts.map((c) => ({
        contactCode: c.contactCode ?? "",
        firstName: c.firstName ?? "",
        middleName: c.middleName ?? "",
        surname: c.surname ?? "",
        relationshipToIndex: c.relationshipToIndex ?? "",
        sex: c.sex ?? "",
        phone: c.phone ?? "",
        address: c.address ?? "",
        sameAddressAsIndex: !!c.sameAddressAsIndex,
        notificationMethod: c.notificationMethod ?? "",
        followUpLocation: c.followUpLocation ?? "",
        attempts: c.attempts != null ? String(c.attempts) : "",
        knownHivPositive: c.knownHivPositive ?? "",
        hivTestResult: c.hivTestResult ?? "",
        dateTestedHiv: c.dateTestedHiv ?? "",
        dateEnrolledArt: c.dateEnrolledArt ?? "",
        onArt: c.onArt ?? "",
        age: c.age != null ? String(c.age) : "",
        artClinic: c.artClinic ?? "",
        enrolledInOvc: !!c.enrolledInOvc,
        dateEnrolledOvc: c.dateEnrolledOvc ?? "",
        ovcId: c.ovcId ?? "",
      }))
      : [],
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
  existingId,
}) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!existingId && !readOnly;
  const mode = readOnly ? "view" : isEditMode ? "edit" : "new";

  const mergedHtsValues = htsValues ? { ...htsValues, isOnArt, } : null;



  const onSubmit = async (values) => {
    setIsLoading(true);

    if (htsRecord?.id || values.htsEncounterId) {
      const htsId = htsRecord?.id || values.htsEncounterId;
      try {
        const res = await getHtsEcounter(htsId);
        const obs = res?.data?.observation ?? res?.observation ?? {};
        const confirmatoryPositive = obs.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive";
        const finalPositive = ["positive", "acute hiv infection"].includes(
          obs.finalHivTestResult?.toLowerCase()
        );
        if (!confirmatoryPositive && !finalPositive) {
          toast.error(
            "ICT can only be created for a client with a confirmed positive HIV test result."
          );
          return;
        }
      } catch {
        toast.error("Unable to verify HTS result. Please try again.");
        return;
      }
    }

    const payload = buildIctEncounterPayload(values);


    if (htsRecord?.id) {
      payload.htsEncounterId = htsRecord.id;
    }

    if (!payload.patientId) {
      const pid = values.patientId
        || htsRecord?.patientId
        || initialValues?.patientId;
      if (pid) payload.patientId = Number(pid);
    }



    try {
      setIsLoading(true);

      let response;
      if (isEditMode) {
        response = await updateIctEncounter(existingId, payload);
        toast.success("ICT record updated successfully");
        setIsLoading(false);
        formik.resetForm();
        onSubmitSuccess?.();
        return;
      } else {
        response = await createIctEncounter(payload);
        toast.success("ICT record saved successfully");
        setIsLoading(false);
        formik.resetForm();
        onSubmitSuccess?.();
        return;
      }

    } catch (err) {
      setIsLoading(false);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.defaultMessage ||
        err?.message ||
        "Unknown error";
      console.error("ICT submission failed:", serverMessage);
      toast.error(`Failed to save ICT record: ${serverMessage}`);
      return
    }
  };

  const { formik } = useIctFormik(
    onSubmit,
    initialValues ? undefined : mergedHtsValues
  );


  React.useEffect(() => {
    if (!initialValues) return;
    const mapped = mapIctResponseToFormValues(initialValues);
    Object.entries(mapped).forEach(([k, v]) =>
      formik.setFieldValue(k, v, false)
    );


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

  const pnsNotOffered = values.offeredPns === "YES_NO_NO";
  const pnsDeclined = values.offeredPns === "YES_NO_YES" && values.acceptedPns === "YES_NO_NO";
  const offeredPnsUnset = !values.offeredPns;

  const sectionBLocked = pnsNotOffered || pnsDeclined || offeredPnsUnset;

  const lockReason = pnsNotOffered
    ? "Index Testing Services was not offered to the index client. Section B is not applicable."
    : pnsDeclined
      ? "The index client declined Index Testing Services. Section B is not applicable."
      : "Please complete the 'Offered Index Testing Services' and 'Accepted Index Testing Services' fields in Section A first.";

  const badge = modeBadgeStyle(mode);

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div>
          <h2 className={classes.title}>
            Index Contact Testing (ICT) Form
            <span style={badge.style}>{badge.label}</span>
          </h2>
          <p className={classes.subtitle}>
            {readOnly
              ? "Viewing ICT record - no changes can be made"
              : isEditMode
                ? "Editing existing ICT record - all fields are editable"
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

          <FormAccordion
            step={1}
            title="Section A - Index Client Details"
            subtitle="Facility context, visit details and index client identity"
            defaultExpanded
            hasError={sectionHasError(sectionAFields)}
          >
            <IctSectionA formik={formik} readOnly={readOnly} />
          </FormAccordion>

          <FormAccordion
            step={2}
            title="Section B - Contact Enumeration & Testing Tracker"
            subtitle={
              sectionBLocked
                ? "Locked - complete Index Testing Services fields in Section A to enable"
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