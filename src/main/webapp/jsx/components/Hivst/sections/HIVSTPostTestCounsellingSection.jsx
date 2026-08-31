import React, { useState, useEffect, useMemo } from "react";
import { FormSelect, inputStyle, labelStyle } from "../../NewToolForms/sections/FormFields";
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
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAllUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await getAllUsers();
        if (isMounted) {
          setAllUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        if (isMounted) {
          setUsersError("Unable to load users. Please try again.");
        }
      } finally {
        if (isMounted) setUsersLoading(false);
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

  // Sanitise number input: only digits, clamp >= 0
  const sanitiseNumber = (value) => {
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly === '') return '';
    const num = parseInt(digitsOnly, 10);
    if (isNaN(num) || num < 0) return '0';
    return String(num);
  };

  const handleNoOfKits = (e) => {
    const raw = e.target.value;
    const sanitised = sanitiseNumber(raw);
    setFieldValue("numberOfHivstKitDistributed", sanitised === '' ? '' : Number(sanitised));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const sanitised = sanitiseNumber(pasted);
    if (sanitised !== '') {
      setFieldValue("numberOfHivstKitDistributed", Number(sanitised));
    } else {
      setFieldValue("numberOfHivstKitDistributed", '');
    }
  };

  const showCategory = values.hivTestKitsProvided === "YES_NO_YES";

  return (
    <div style={{ width: "100%" }}>
      {/* First row: HIV Test Kits, Category, No. of Kits */}
      <div className="row">
        <div className="col-md-4">
          {/* <FormSelect
            label="HIV self Test Kits Provided to Client"
            {...sp("hivTestKitsProvided", transformOptions(codesets?.["YES_NO"]))}
            required
          /> */}

          <FormSelect
            label="HIV self Test Kits Provided to Client"
            {...sp("hivTestKitsProvided", transformOptions(codesets?.["YES_NO"]))}
            onChange={(e) => {
              handleChange(e);
              setFieldValue("categoryOfClients", "");
              setFieldValue("numberOfHivstKitDistributed", "");
            }}
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
                value={values.numberOfHivstKitDistributed ?? ''}
                onChange={readOnly ? undefined : handleNoOfKits}
                onPaste={readOnly ? undefined : handlePaste}
                onBlur={handleBlur}
                min="0"
                step="1"
                disabled={readOnly}
                style={readOnly ? disabledInputStyle : inputStyle}
                onKeyDown={(e) => {
                  if (['-', 'e', '+', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {touched.numberOfHivstKitDistributed && errors.numberOfHivstKitDistributed && (
                <span style={errorStyle}>{errors.numberOfHivstKitDistributed}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Second row: Completed By and Designation */}
      <div className="row" style={{ marginTop: '1rem' }}>
        <div className="col-md-6">
          <FormSelect
            label="Completed By"
            {...sp("completedBy", completedByOptions)}
            disabled={readOnly || usersLoading}
            required
          />
          {usersLoading && (
            <small style={{ color: '#6c757d' }}>Loading users…</small>
          )}
          {usersError && (
            <small style={{ color: '#f85032' }}>{usersError}</small>
          )}
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Designation"
            {...sp("designation", designationOptions)}
            disabled={readOnly || usersLoading}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default HIVSTPostTestCounsellingSection;