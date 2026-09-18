// NewIctForExistingPatient.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import axios from "axios";
import { url, token } from "../../../api";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";
import { checkActiveHivTransferIn } from "../../services/checkHivTransferIn.service";
import IctForm from "../IctForm/IctForm";
import { COLORS } from "../NewToolForms/constants";

/**
 * Calculates the age in years as of today.
 * @param {string} birthDateStr - Date of birth in "YYYY-MM-DD" format.
 * @returns {number|null} Age in years, or null if input is invalid or birthdate is in the future.
 */
export const getAge = (birthDateStr) => {
    if (typeof birthDateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) {
        console.error('Invalid input: expected string in "YYYY-MM-DD" format');
        return null;
    }

    const [yearStr, monthStr, dayStr] = birthDateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
    if (day > daysInMonth(year, month)) {
        console.error(`Invalid day ${day} for month ${month} in year ${year}`);
        return null;
    }
    const birthDate = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (birthDate > todayUTC) {
        console.error('Birthdate cannot be in the future');
        return null;
    }

    let age = todayUTC.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = todayUTC.getUTCMonth() - birthDate.getUTCMonth();
    const dayDiff = todayUTC.getUTCDate() - birthDate.getUTCDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

const sexMap = {
    female: "SEX_FEMALE",
    male: "SEX_MALE"
};

const mapHtsRecordToIctValues = (htsRecord) => {
    if (!htsRecord) return {};

    const d = htsRecord.observation ?? {};
    const p = htsRecord.person ?? {};

    const personPhone = p.contactPoint?.contactPoint?.[0]?.value ?? "";
    const personAddressObj = p.address?.address?.[0];
    const personAddress = personAddressObj
        ? personAddressObj.city
        : "";

    let sexCode = "";
    if (p.gender?.display) {
        sexCode = sexMap[p.gender.display.toLowerCase()] || "";
    } else if (d.sex) {
        sexCode = d.sex;
    }

    // Keys for IctSectionA (original)
    const ictSectionAKeys = {
        indexClientId: htsRecord.clientCode ?? "",
        indexFirstName: p.firstName ?? d.firstName ?? "",
        indexMiddleName: p.otherName ?? d.middleName ?? "",
        indexSurname: p.surname ?? d.surname ?? "",
        indexSex: sexCode,
        indexDob: p.dateOfBirth ?? "",
        indexAge: p.dateOfBirth != null ? String(getAge(p.dateOfBirth)) : (d.age ? String(d.age) : ""),
        indexPhone: personPhone,
        indexAltPhone: "",
        indexAddress: personAddress,
        artUniqueId: d.artUniqueId ?? "",
        isOnArt: d.isOnArt ?? false,
        patientId: htsRecord.patientId != null ? String(htsRecord.patientId) : "",
        facilityId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        currentOrganisationUnitId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
        htsEncounterId: htsRecord.id != null ? String(htsRecord.id) : "",
        setting: htsRecord.setting ?? "",
        facilitySetting: d.facilitySetting ?? "",
        communityEntryPoint: d.communityEntryPoint ?? "",
        indexDateOfRegistration: p.dateOfRegistration,
        htsDateOfVisit: d.dateOfVisit ?? htsRecord.dateOfVisit ?? "",
        facilityName: d.facilityName ?? "",
        state: personAddressObj?.stateId != null ? String(personAddressObj.stateId) : "",
        lga: personAddressObj?.district != null ? String(personAddressObj.district) : "",
    };

    // Keys for useIctFormik.buildInitialValues (additional)
    const buildInitialValuesKeys = {
        clientCode: htsRecord.clientCode ?? "",
        firstName: p.firstName ?? d.firstName ?? "",
        middleName: p.otherName ?? d.middleName ?? "",
        surname: p.surname ?? d.surname ?? "",
        sex: sexCode,
        dateOfBirth: p.dateOfBirth ?? "",
        age: p.dateOfBirth != null ? String(getAge(p.dateOfBirth)) : (d.age ? String(d.age) : ""),
        phoneNumber: personPhone,
        address: personAddress,
        clientState: personAddressObj?.stateId != null ? String(personAddressObj.stateId) : "",
        clientLga: personAddressObj?.district != null ? String(personAddressObj.district) : "",
    };

    // Merge both
    return { ...ictSectionAKeys, ...buildInitialValuesKeys };
};

// Transfer-In patient path: there is no HTS encounter to read from at all (HTS creation is
// deliberately blocked for them - that's the entire premise of this feature), so demographics
// come straight from GET /api/v1/patient/{patientId} instead. setting/facilitySetting/
// communityEntryPoint/htsEncounterId/htsDateOfVisit intentionally stay blank - there is no
// HTS visit context to prefill from. indexClientId also stays blank (no HTS client code
// exists) - IctSectionA.jsx makes this field editable specifically when htsEncounterId is
// empty, so the user can enter one manually.
const mapPatientDetailsToIctValues = (patientDetails) => {
    if (!patientDetails) return {};

    const p = patientDetails;
    const personPhone = p.contactPoint?.contactPoint?.[0]?.value ?? "";
    const personAddressObj = p.address?.address?.[0];
    const personAddress = personAddressObj
        ? personAddressObj.city
        : "";

    let sexCode = "";
    if (p.gender?.display) {
        sexCode = sexMap[p.gender.display.toLowerCase()] || "";
    }

    const ictSectionAKeys = {
        indexClientId: "",
        indexFirstName: p.firstName ?? "",
        indexMiddleName: p.otherName ?? "",
        indexSurname: p.surname ?? "",
        indexSex: sexCode,
        indexDob: p.dateOfBirth ?? "",
        indexAge: p.dateOfBirth != null ? String(getAge(p.dateOfBirth)) : "",
        indexPhone: personPhone,
        indexAltPhone: "",
        indexAddress: personAddress,
        artUniqueId: "",
        isOnArt: false,
        patientId: p.id != null ? String(p.id) : "",
        facilityId: p.facilityId != null ? String(p.facilityId) : "",
        currentOrganisationUnitId: p.facilityId != null ? String(p.facilityId) : "",
        htsEncounterId: "",
        setting: "",
        facilitySetting: "",
        communityEntryPoint: "",
        indexDateOfRegistration: p.dateOfRegistration,
        htsDateOfVisit: "",
        facilityName: "",
        state: personAddressObj?.stateId != null ? String(personAddressObj.stateId) : "",
        lga: personAddressObj?.district != null ? String(personAddressObj.district) : "",
    };

    const buildInitialValuesKeys = {
        clientCode: "",
        firstName: p.firstName ?? "",
        middleName: p.otherName ?? "",
        surname: p.surname ?? "",
        sex: sexCode,
        dateOfBirth: p.dateOfBirth ?? "",
        age: p.dateOfBirth != null ? String(getAge(p.dateOfBirth)) : "",
        phoneNumber: personPhone,
        address: personAddress,
        clientState: personAddressObj?.stateId != null ? String(personAddressObj.stateId) : "",
        clientLga: personAddressObj?.district != null ? String(personAddressObj.district) : "",
    };

    return { ...ictSectionAKeys, ...buildInitialValuesKeys };
};

// const mapHtsRecordToIctValues = (htsRecord) => {
//     if (!htsRecord) return {};

//     const d = htsRecord.observation ?? {};
//     const p = htsRecord.person ?? {};

//     const personPhone = p.contactPoint?.contactPoint?.[0]?.value ?? "";
//     const personAddressObj = p.address?.address?.[0];
//     const personAddress = personAddressObj
//         ? [personAddressObj.city, ...(personAddressObj.line ?? [])].filter(Boolean).join(", ")
//         : "";

//     let sexCode = "";
//     if (p.gender?.display) {
//         sexCode = sexMap[p.gender.display.toLowerCase()] || "";
//     } else if (d.sex) {
//         sexCode = d.sex;
//     }

//     return {
//         facilityName: d.facilityName ?? "",
//         state: personAddressObj?.stateId != null ? String(personAddressObj.stateId) : "",
//         lga: personAddressObj?.district != null ? String(personAddressObj.district) : "",
//         indexClientId: htsRecord.clientCode ?? "",
//         indexFirstName: p.firstName ?? d.firstName ?? "",
//         indexMiddleName: p.otherName ?? d.middleName ?? "",
//         indexSurname: p.surname ?? d.surname ?? "",
//         indexSex: sexCode,
//         indexDob: p.dateOfBirth ?? "",
//         indexAge: p.dateOfBirth != null ? String(getAge(p.dateOfBirth)) : (d.age ? String(d.age) : ""),
//         indexPhone: personPhone,
//         indexAltPhone: "",
//         indexAddress: personAddress,
//         artUniqueId: d.artUniqueId ?? "",
//         isOnArt: d.isOnArt ?? false,
//         patientId: htsRecord.patientId != null ? String(htsRecord.patientId) : "",
//         facilityId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
//         currentOrganisationUnitId: htsRecord.facilityId != null ? String(htsRecord.facilityId) : "",
//         htsEncounterId: htsRecord.id != null ? String(htsRecord.id) : "",
//         setting: htsRecord.setting ?? "",
//         facilitySetting: d.facilitySetting ?? "",
//         communityEntryPoint: d.communityEntryPoint ?? "",
//         indexDateOfRegistration: p.dateOfRegistration,
//         htsDateOfVisit: d.dateOfVisit ?? htsRecord.dateOfVisit ?? "",
//     };
// };

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

const NewIctForExistingPatient = ({ patientId, onDone, isOnArt = false }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [positiveHtsRecord, setPositiveHtsRecord] = useState(null);
    const [ictInitialValues, setIctInitialValues] = useState(null);

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
                    (enc) => enc?.observation?.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive" || enc?.observation?.finalHivTestResult?.toLowerCase() === "positive"
                );

                if (positiveRecord) {
                    setPositiveHtsRecord(positiveRecord);
                    const mapped = mapHtsRecordToIctValues(positiveRecord);
                    setIctInitialValues(mapped);
                    return;
                }

                // No positive HTS record - check the other valid path to ICT eligibility:
                // a documented, active HIV Transfer-In record. Such a patient is already
                // confirmed positive at their originating facility, but HTS creation is
                // blocked for them by design, so there's no HTS record to prefill from -
                // fetch the patient record directly instead.
                const hasActiveTransferIn = await checkActiveHivTransferIn(patientId, undefined);

                if (!hasActiveTransferIn) {
                    setError("No positive HIV test result found for this patient. ICT form cannot be created.");
                    return;
                }

                const response = await axios.get(`${url}patient/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPositiveHtsRecord(null);
                setIctInitialValues(mapPatientDetailsToIctValues(response.data));
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
        // toast.success("ICT record created successfully");
        onDone();
    };

    const handleBack = () => {
        onDone();
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

    // Wait for mapped values to be ready
    if (!ictInitialValues) return null;

    return (
        <IctForm
            htsValues={ictInitialValues}          // Clean mapped demographics only
            htsRecord={positiveHtsRecord}         // Raw record (IctForm reads .id from this)
            isOnArt={isOnArt}
            onSubmitSuccess={handleIctSuccess}
            onBack={handleBack}
            readOnly={false}
        />
    );
};

export default NewIctForExistingPatient;