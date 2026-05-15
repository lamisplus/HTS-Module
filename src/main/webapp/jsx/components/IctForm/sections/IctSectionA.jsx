// IctSectionA.jsx (only modification: facilityId setting)
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import {
  FormSelect,
  FormTextField,
  ReadOnlyField,
  SectionSubheading,
  labelStyle,
  inputStyle,
} from "../../NewToolForms/sections/FormFields";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import axios from "axios";
import { url, token } from "../../../../api";
import { capitalizeFirstLetter } from "../../utils";

const today = new Date().toISOString().split("T")[0];

const errorStyle = {
  color: "#f85032",
  fontSize: "12.8px",
  marginTop: "4px",
  display: "block",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f6f8fa",
  color: "#8c959f",
  cursor: "not-allowed",
};

const IctSectionA = ({ formik, readOnly = false }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
  const [codesets, setCodesets] = useState(null);
  const [statesList, setStatesList] = useState([]);
  const [lgasList, setLgasList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: item.display.toLowerCase() === 'yes' || item.display.toLowerCase() === 'no' ? capitalizeFirstLetter(item.display) : item.display,
      value: item.code,
    }));
  };

  const fetchStates = async (countryId) => {
    setLoadingStates(true);
    try {
      const response = await axios.get(
        `${url}organisation-units/parent-organisation-units/${countryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setStatesList(sorted);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchLgas = async (stateId) => {
    setLoadingLgas(true);
    try {
      const response = await axios.get(
        `${url}organisation-units/parent-organisation-units/${stateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setLgasList(sorted);
    } catch (error) {
      console.error("Error fetching LGAs:", error);
    } finally {
      setLoadingLgas(false);
    }
  };

  useEffect(() => {
    fetchStates(1);
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`${url}account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orgId = response.data?.currentOrganisationUnitId;
        const orgName = response.data?.currentOrganisationUnitName;
        if (orgId && !values.facilityId) {
          setFieldValue("facilityId", orgId);
        }
        if (orgName) {
          setFieldValue("facilityName", orgName);
        }
      } catch (err) {
        console.error("Failed to fetch account:", err?.message);
      }
    };
    fetchAccount();
  }, []);



  useEffect(() => {
    if (statesList?.length > 0 && values?.state) {
      const looksLikeId = /^\d+$/.test(String(values.state).trim());
      if (looksLikeId) {
        const matched = statesList.find((s) => String(s.id) === String(values.state));
        // DO NOT overwrite values.state — keep the numeric id, just fetch LGAs
        if (matched) fetchLgas(matched.id);
      } else {
        // It's a display name (legacy data) — resolve to id and store id
        const matched = statesList.find(
          (s) => s.name.toLowerCase() === String(values.state).toLowerCase()
        );
        if (matched) {
          setFieldValue("state", String(matched.id), false); // store numeric id
          fetchLgas(matched.id);
        }
      }
    }
  }, [statesList, values?.state]);


  useEffect(() => {
    if (lgasList?.length > 0 && values?.lga) {
      const looksLikeId = /^\d+$/.test(String(values.lga).trim());
      if (looksLikeId) {
        // Already an id — no overwrite needed
      } else {
        // It's a display name (legacy data) — resolve to id
        const matched = lgasList.find(
          (l) => l.name.toLowerCase() === String(values.lga).toLowerCase()
        );
        if (matched) {
          setFieldValue("lga", String(matched.id), false); // store numeric id
        }
      }
    }
  }, [lgasList, values?.lga]);


  useGetCodesets({
    codesetsKeys: [
      "HTS_ENTRY_POINT",
      "FACILITY_HTS_TEST_SETTING",
      "COMMUNITY_HTS_TEST_SETTING",
      "YES_NO",
      "INDEX_CLIENT_CATEGORY",
      "SEX"
    ],
    patientId: "ictSectionA",
    onSuccess: (data) => setCodesets(data),
  });

  const fp = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name],
    disabled: readOnly,
  });

  const sp = (name, options, extraDisabled = false) => ({
    ...fp(name),
    options,
    disabled: readOnly || extraDisabled,
  });

  const handleSettingChange = (e) => {
    setFieldValue("setting", e.target.value);
    setFieldValue("facilitySetting", "");
    setFieldValue("communityEntryPoint", "");
  };

  const handleCategoryChange = (e) => {
    setFieldValue("clientCategory", e.target.value);
    if (e.target.value !== "Other") setFieldValue("clientCategoryOther", "");
  };

  const handleOfferedPnsChange = (e) => {
    setFieldValue("offeredPns", e.target.value);
    if (e.target.value !== "YES_NO_YES") setFieldValue("acceptedPns", "");
  };

  // Derive a display label from a codeset code
  const getCodeLabel = (codesetKey, code) => {
    if (!code || !codesets?.[codesetKey]) return code ?? "";
    const match = codesets[codesetKey].find((item) => item.code === code);
    return match ? capitalizeFirstLetter(match.display) : code;
  };

  const showFacilitySetting = values.setting === "HTS_ENTRY_POINT_FACILITY";
  const showCommunityEntry = values.setting === "HTS_ENTRY_POINT_COMMUNITY";
  const showArtClinic = !!values.isOnArt;
  const showCategoryOther = values.clientCategory === "Other";
  const showAcceptedPns = values.offeredPns === "YES_NO_YES";


  const stateDisplayName =
    statesList.find((s) => String(s.id) === String(values.state))?.name ??
    (loadingStates ? "Loading…" : values.state ?? "");

  const lgaDisplayName =
    lgasList.find((l) => String(l.id) === String(values.lga))?.name ??
    (loadingLgas ? "Loading…" : values.lga ?? "");

  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>Facility Context</SectionSubheading>
      <div className="row">
        <div className="col-md-4"><ReadOnlyField label="State" value={stateDisplayName} /></div>
        <div className="col-md-4"><ReadOnlyField label="LGA" value={lgaDisplayName} /></div>
        <div className="col-md-4"><ReadOnlyField label="Facility Name" value={values.facilityName} /></div>
      </div>

      <SectionSubheading>Visit Details</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <FormTextField label="Visit Date" type="date" {...fp("dateOfService")} required />
        </div>
        <div className="col-md-4">
          <FormSelect
            label="Setting"
            {...sp("setting", transformOptions(codesets?.["HTS_ENTRY_POINT"]))}
            onChange={readOnly ? undefined : handleSettingChange}
            required
          />
        </div>
        {showFacilitySetting && (
          <div className="col-md-4">
            <FormSelect
              label="Facility Setting"
              {...sp("facilitySetting", transformOptions(codesets?.["FACILITY_HTS_TEST_SETTING"]))}
              required
            />
          </div>
        )}
        {showCommunityEntry && (
          <div className="col-md-4">
            <FormSelect
              label="Community Entry Point"
              {...sp("communityEntryPoint", transformOptions(codesets?.["COMMUNITY_HTS_TEST_SETTING"]))}
              required
            />
          </div>
        )}
        {showArtClinic && (
          <div className="col-md-4">
            <FormSelect
              label="ART Clinic"
              {...sp("artClinic", transformOptions(codesets?.["YES_NO"]))}
            />
          </div>
        )}
      </div>

      <SectionSubheading>Index Client Details</SectionSubheading>
      <div className="row">
        <div className="col-md-4"><ReadOnlyField label="Index Client ID (HTS Code)" value={values.indexClientId} /></div>
        {values.artUniqueId && <div className="col-md-4"><ReadOnlyField label="ART Unique ID" value={values.artUniqueId} /></div>}
        <div className="col-md-4"><ReadOnlyField label="First Name" value={values.indexFirstName} /></div>
        <div className="col-md-4"><ReadOnlyField label="Middle Name" value={values.indexMiddleName} /></div>
        <div className="col-md-4"><ReadOnlyField label="Surname" value={values.indexSurname} /></div>
        <div className="col-md-4">
          <ReadOnlyField label="Sex" value={getCodeLabel("SEX", values.indexSex)} />
        </div>

        <div className="col-md-4"><ReadOnlyField label="Date of Birth" value={values.indexDob} /></div>
        <div className="col-md-4"><ReadOnlyField label="Age" value={values.indexAge} /></div>
        <div className="col-md-4">
          <FormSelect
            label="Client Category"
            {...sp("clientCategory", transformOptions(codesets?.["INDEX_CLIENT_CATEGORY"]))}
            onChange={readOnly ? undefined : handleCategoryChange}
            required
          />
        </div>
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Phone Number <span style={{ color: "red" }}>*</span></Label>
            <Input
              type="text" name="indexPhone" value={values.indexPhone || ""}
              onChange={readOnly ? undefined : handleChange} onBlur={handleBlur}
              maxLength={11} disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle} placeholder="10-11 digits"
            />
            {touched.indexPhone && errors.indexPhone && <span style={errorStyle}>{errors.indexPhone}</span>}
          </FormGroup>
        </div>
      </div>

      <div className="row" style={{ marginTop: 4 }}>
        <div className="col-md-12">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Alternative Phone Number</Label>
            <Input
              type="text" name="indexAltPhone" value={values.indexAltPhone || ""}
              onChange={readOnly ? undefined : handleChange} onBlur={handleBlur}
              maxLength={11} disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle} placeholder="10-11 digits"
            />
            {touched.indexAltPhone && errors.indexAltPhone && <span style={errorStyle}>{errors.indexAltPhone}</span>}
          </FormGroup>
        </div>
        <div className="col-md-12">
          <FormTextField
            label="Descriptive Residential Address"
            type="textarea"
            {...fp("indexAddress")}
            required
          />
        </div>
      </div>

      <SectionSubheading>Index Services</SectionSubheading>
      <div className="row">
        {showCategoryOther && (
          <div className="col-md-4">
            <FormTextField label="Specify Other Category" {...fp("clientCategoryOther")} required />
          </div>
        )}
        <div className="col-md-4">
          <FormSelect
            label="Offered Index Testing Services ?"
            {...sp("offeredPns", transformOptions(codesets?.["YES_NO"]))}
            onChange={readOnly ? undefined : handleOfferedPnsChange}
            required
          />
        </div>
        {showAcceptedPns && (
          <div className="col-md-4">
            <FormSelect
              label="Accepted Index Testing Services?"
              {...sp("acceptedPns", transformOptions(codesets?.["YES_NO"]))}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IctSectionA;