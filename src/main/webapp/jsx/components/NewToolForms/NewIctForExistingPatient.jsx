// NewIctForExistingPatient.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";
import IctForm from "../IctForm/IctForm";
import { COLORS } from "../NewToolForms/constants";

/**
 * Maps an HTS encounter record (as returned by the backend) to the flat
 * `htsValues` object that IctForm expects for pre‑populating Section A.
 *
 * The HTS record has top‑level fields (clientCode, setting, personId, facilityId)
 * and a `data` JSONB column containing most clinical and demographic values.
 *
 * Payload shape (relevant parts):
 * {
 *   id, uuid, personId, clientCode, dateOfVisit, setting, facilityId,
 *   person: { firstName, surname, otherName, sex, dateOfBirth,
 *             contactPoint: { contactPoint: [{ type, value }] },
 *             address: { address: [{ city, line, stateId, district, ... }] } },
 *   data: { facilityName, clientState, clientLga, firstName, middleName,
 *           surname, sex, dateOfBirth, age, phoneNumber, address,
 *           facilitySetting, communityEntryPoint, artUniqueId, isOnArt, ... }
 * }
 */
const mapHtsRecordToIctValues = (htsRecord) => {
    if (!htsRecord) return {};

    const d = htsRecord.data ?? {};
    const p = htsRecord.person ?? {};

    // ── Safely extract person-level phone (nested in contactPoint.contactPoint[]) ──
    const personPhone = p.contactPoint?.contactPoint?.[0]?.value ?? "";

    // ── Safely extract person-level address as a flat string ──────────────────
    // p.address is { address: [{ city, line: [], ... }] }; use city as the
    // human-readable string, matching how the HTS form stores it in d.address.
    const personAddressObj = p.address?.address?.[0];
    const personAddress = personAddressObj
        ? [personAddressObj.city, ...(personAddressObj.line ?? [])].filter(Boolean).join(", ")
        : "";

    return {
        // ── Facility context ───────────────────────────────────────────────────
        facilityName: d.facilityName ?? "",
        // clientState / clientLga are stored as string IDs in the data JSONB
        state: d.clientState != null ? String(d.clientState) : "",
        lga: d.clientLga != null ? String(d.clientLga) : "",

        // ── Index client identity ──────────────────────────────────────────────
        // Prefer data snapshot (taken at time of HTS visit); fall back to person object
        indexClientId: htsRecord.clientCode ?? "",
        indexFirstName: d.firstName ?? p.firstName ?? "",
        indexMiddleName: d.middleName ?? p.otherName ?? "",
        indexSurname: d.surname ?? p.surname ?? "",
        indexSex: d.sex ?? p.sex ?? "",
        // person.dateOfBirth is null when estimated; d.dateOfBirth has the resolved value
        indexDob: d.dateOfBirth ?? "",
        indexAge: d.age != null ? String(d.age) : "",
        // d.phoneNumber is the primary source; fall back to person contactPoint array
        indexPhone: d.phoneNumber ?? personPhone,
        // indexAltPhone is not stored on the HTS data JSONB — leave blank
        indexAltPhone: "",
        // d.address is already a flat string; fall back to reconstructed person address
        indexAddress: d.address ?? personAddress,

        // ── ART information ────────────────────────────────────────────────────
        artUniqueId: d.artUniqueId ?? "",
        isOnArt: d.isOnArt ?? false,

        // ── System linkage ─────────────────────────────────────────────────────
        personId: htsRecord.personId != null ? String(htsRecord.personId) : "",
        facilityId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        // Keep legacy field name in case any downstream consumer still reads it
        currentOrganisationUnitId:
            htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        // Carry the HTS encounter id so IctForm / buildIctEncounterPayload can link records
        htsEncounterId: htsRecord.id != null ? String(htsRecord.id) : "",

        // ── Visit / setting context ────────────────────────────────────────────
        setting: htsRecord.setting ?? "",
        facilitySetting: d.facilitySetting ?? "",
        communityEntryPoint: d.communityEntryPoint ?? "",
    };
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    backgroundColor: "#f6f8fa",
    padding: "40px",
    textAlign: "center",
};

const errorContainerStyle = {
    ...loadingContainerStyle,
    color: "#d32f2f",
};

// ─── Component ───────────────────────────────────────────────────────────────
const NewIctForExistingPatient = ({
    patientId,    // ID of the patient (personId)
    onDone,
    isOnArt = false,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [positiveHtsRecord, setPositiveHtsRecord] = useState(null);

    useEffect(() => {
        const fetchAndValidate = async () => {
            if (!patientId) {
                setError("Patient ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const encounters = await getHtsEcounterForAPatient(patientId);

                const sortedEncounters = Array.isArray(encounters)
                    ? [...encounters].sort(
                        (a, b) => new Date(b.dateOfVisit || b.createdAt) - new Date(a.dateOfVisit || a.createdAt)
                    )
                    : [];

                // Find the most recent encounter with confirmatoryHivTest === "positive"
                const positiveRecord = sortedEncounters.find(
                    (enc) => enc?.data?.confirmatoryHivTest?.toLowerCase() === "positive"
                );

                console.log(sortedEncounters)
                if (!positiveRecord) {
                    setError("No positive HIV test result found for this patient. ICT form cannot be created.");
                } else {
                    setPositiveHtsRecord(positiveRecord);
                }
            } catch (err) {
                console.error("Failed to fetch HTS encounters:", err);
                setError("Unable to load patient HIV testing history. Please try again.");
                toast.error("Failed to load HTS records");
            } finally {
                setLoading(false);
            }
        };

        fetchAndValidate();
    }, [patientId]);

    const handleIctSuccess = (ictResponse) => {
        toast.success("ICT record created successfully");
        onDone?.(ictResponse);
    };

    const handleBack = () => {
        onDone?.();
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={{ fontSize: "18px", marginBottom: "16px", color: "#57606a" }}>
                    Loading patient HIV testing history...
                </div>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={errorContainerStyle}>
                <div style={{ fontSize: "18px", marginBottom: "16px" }}>⚠️ {error}</div>
                <Button
                    content="Go Back"
                    icon="left arrow"
                    labelPosition="left"
                    style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                    onClick={handleBack}
                />
            </div>
        );
    }

    // Valid positive HTS record – render IctForm
    const htsValues = mapHtsRecordToIctValues(positiveHtsRecord);

    return (
        <IctForm
            htsValues={{ ...positiveHtsRecord?.data, ...positiveHtsRecord }}
            htsRecord={htsValues}
            isOnArt={isOnArt}
            onSubmitSuccess={handleIctSuccess}
            onBack={handleBack}
            readOnly={false}
        />
    );
};

export default NewIctForExistingPatient;