import React, { useState, useEffect, useMemo } from "react";
import { FormSelect, inputStyle, labelStyle, } from "../../NewToolForms/sections/FormFields";
import { getAllUsers } from "../../../services/getAllUsers.service";
import { Input, Label } from "reactstrap";
import { capitalizeFirstLetter } from "../../utils";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";



const disabledInputStyle = {
    ...inputStyle,
    background: "#f6f8fa",
    color: "#8c959f",
    cursor: "not-allowed",
};

const errorStyle = {
    color: "#f85032",
    fontSize: "12.8px",
    marginTop: "4px",
    display: "block",
};

const HIVSTPostTestCounsellingSection = ({ formik, readOnly }) => {
    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
    const [codesets, setCodesets] = useState(null);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchAllUsers = async () => {
            try {
                const data = await getAllUsers();
                if (isMounted) setAllUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchAllUsers();
        return () => { isMounted = false; };
    }, []);

    const completedByOptions = useMemo(() => {
        if (!Array.isArray(allUsers)) return [];
        return allUsers
            .filter(user => user?.firstName && user?.lastName)
            .map(user => ({ label: `${user.firstName} ${user.lastName}`, value: `${user.firstName} ${user.lastName}` }));
    }, [allUsers]);

    const designationOptions = useMemo(() => {
        if (!Array.isArray(allUsers)) return [];
        const set = new Set();
        allUsers.forEach(user => {
            if (user?.designation) {
                const trimmed = user.designation.trim();
                if (trimmed) set.add(trimmed);
            }
        });
        return Array.from(set).sort().map(d => ({ label: d, value: d }));
    }, [allUsers]);

    const fp = (name) => ({
        name,
        value: values[name],
        onChange: handleChange,
        onBlur: handleBlur,
        error: touched[name] && !!errors[name],
        helperText: touched[name] && errors[name],
        disabled: readOnly,
    });

    const sp = (name, options) => ({ ...fp(name), options });

    const transformOptions = (items) => {
        if (!Array.isArray(items)) return [];
        return items.map(item => ({
            id: item.id,
            label: item.display.toLowerCase() === 'yes' || item.display.toLowerCase() === 'no' ? capitalizeFirstLetter(item.display) : item.display,
            value: item?.code
        }));
    };

    const loadCodesets = (data) => setCodesets(data);
    useGetCodesets({
        codesetsKeys: ["YES_NO", "HIVST_KIT_USER"],
        patientId: "HIVSTPostTest",
        onSuccess: loadCodesets,
    });

    const handleNoOfKits = (e) => {
        if (e.target.value === "." || e.target.value === ",") e.preventDefault();
        setFieldValue("numberOfHivstKitDistributed", e.target.value);
    };

    const showCategory = values.hivTestKitsProvided === "YES_NO_YES";

    return (
        <div style={{ width: "100%" }}>
            <div className="row">
                <div className="col-md-4">
                    <FormSelect
                        label="HIV self Test Kits Provided to Client"
                        {...sp("hivTestKitsProvided", transformOptions(codesets?.["YES_NO"]))}
                        required
                    />
                </div>

                {showCategory && (
                    <>
                        <div className="col-md-4">
                            <FormSelect
                                label="Category of clients receiving HIV self test kit"
                                {...sp(
                                    "categoryOfClients",
                                    transformOptions(codesets?.["HIVST_KIT_USER"]).filter((option) =>
                                        [
                                            "HIVST_KIT_USER_SELF",
                                            "HIVST_KIT_USER_PARTNER",
                                            "HIVST_KIT_USER_CAREGIVER_ASSISTED",
                                            "HIVST_KIT_USER_SOCIAL_NETWORK",
                                        ].includes(option.value)
                                    )
                                )}
                            />
                        </div>
                        <div className="col-md-4">
                            <Label style={labelStyle}>No. of Kits Distributed</Label>
                            <Input
                                type="number"
                                name="numberOfHivstKitDistributed"
                                value={values.numberOfHivstKitDistributed || ""}
                                onChange={readOnly ? undefined : handleNoOfKits}
                                onBlur={handleBlur}
                                min="0"
                                step="1"
                                disabled={readOnly}
                                style={readOnly ? disabledInputStyle : inputStyle}
                                onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }}
                            />
                            {touched.numberOfHivstKitDistributed && errors.numberOfHivstKitDistributed && (
                                <span style={errorStyle}>{errors.numberOfHivstKitDistributed}</span>
                            )}
                        </div>
                    </>
                )}

                <div className="row">
                    <div className="col-md-6">
                        <FormSelect
                            label="Completed By"
                            {...sp("completedBy", completedByOptions)}
                            disabled={readOnly}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="Designation"
                            {...sp("designation", designationOptions)}
                            disabled={readOnly}
                            required
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HIVSTPostTestCounsellingSection;