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
 * Updated to use observation, patientId.
 */
const mapHtsRecordToIctValues = (htsRecord) => {
    if (!htsRecord) return {};

    const d = htsRecord.observation ?? {};
    const p = htsRecord.person ?? {};

    const personPhone = p.contactPoint?.contactPoint?.[0]?.value ?? "";
    const personAddressObj = p.address?.address?.[0];
    const personAddress = personAddressObj
        ? [personAddressObj.city, ...(personAddressObj.line ?? [])].filter(Boolean).join(", ")
        : "";

    return {
        facilityName: d.facilityName ?? "",
        state: d.clientState != null ? String(d.clientState) : "",
        lga: d.clientLga != null ? String(d.clientLga) : "",
        indexClientId: htsRecord.clientCode ?? "",
        indexFirstName: d.firstName ?? p.firstName ?? "",
        indexMiddleName: d.middleName ?? p.otherName ?? "",
        indexSurname: d.surname ?? p.surname ?? "",
        indexSex: d.sex ?? p.sex ?? "",
        indexDob: d.dateOfBirth ?? "",
        indexAge: d.age != null ? String(d.age) : "",
        indexPhone: d.phoneNumber ?? personPhone,
        indexAltPhone: "",
        indexAddress: d.address ?? personAddress,
        artUniqueId: d.artUniqueId ?? "",
        isOnArt: d.isOnArt ?? false,
        patientId: htsRecord.patientId != null ? String(htsRecord.patientId) : "",
        facilityId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        currentOrganisationUnitId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        htsEncounterId: htsRecord.id != null ? String(htsRecord.id) : "",
        setting: htsRecord.setting ?? "",
        facilitySetting: d.facilitySetting ?? "",
        communityEntryPoint: d.communityEntryPoint ?? "",
    };
};

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

const NewIctForExistingPatient = ({
    patientId,
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


                const positiveRecord = sortedEncounters.find(
                    (enc) => enc?.observation?.confirmatoryHivTest?.toLowerCase() === "sti_hiv_result_positive"
                );

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

    const htsValuesForIct = mapHtsRecordToIctValues(positiveHtsRecord);

    return (
        <IctForm
            htsValues={{...htsValuesForIct, ...positiveHtsRecord, ...positiveHtsRecord?.observation}}
            htsRecord={positiveHtsRecord}   // raw record — IctForm reads .id from this
            isOnArt={isOnArt}
            onSubmitSuccess={handleIctSuccess}
            onBack={handleBack}
            readOnly={false}
        />
    );
};

export default NewIctForExistingPatient;