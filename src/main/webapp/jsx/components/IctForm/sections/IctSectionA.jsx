/**
 * IctSectionA.jsx — Index Client Details
 *
 * Facility context, visit details, and index client identity.
 * Most demographic fields are READ-ONLY (auto-populated from HTS).
 * Editable: dateOfService, setting, facilitySetting/communityEntryPoint,
 *           artClinic (conditional), clientCategory, offeredPns, acceptedPns.
 */

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
import {
  CLIENT_CATEGORY_OPTIONS,
} from "../ictConstants";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import axios from "axios";
import { url, token } from "../../../../api";

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



  const fetchStates = async (countryId) => {
    setLoadingStates(true);
    try {
      const response = await axios.get(
        `${url}organisation-units/parent-organisation-units/${countryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sort alphabetically by name for better UX
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setStatesList(sorted);
    } catch (error) {
      console.error("Error fetching states:", error);
      // Optionally show a user-friendly message
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

  // Fetch facilityId from /account if not already seeded from HTS values.
  // This covers the ART-triggered ICT path where HTS was not filled in this session.
  useEffect(() => {
    if (values.currentOrganisationUnitId) return; // already populated from HTS
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`${url}account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orgId = response.data?.currentOrganisationUnitId;
        if (orgId) {
          setFieldValue("currentOrganisationUnitId", orgId);
        }
      } catch (err) {
        console.error("Failed to fetch account for facilityId:", err?.message);
      }
    };
    fetchAccount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When statesList is ready AND values.state has an ID, fetch the LGAs for that state.
  // values.state is the numeric state ID coming from the HTS / person record.
  useEffect(() => {
    if (statesList?.length > 0 && values?.state) {
      const matched = statesList.find((s) => String(s.id) === String(values.state));
      if (matched) {
        fetchLgas(matched.id);
      }
    }
  }, [statesList, values?.state]);





  // ── Codeset loader ────────────────────────────────────────────────────────
  useGetCodesets({
    codesetsKeys: [
      "HTS_ENTRY_POINT",
      "FACILITY_HTS_TEST_SETTING",
      "COMMUNITY_HTS_TEST_SETTING",
      "YES_NO",
    ],
    patientId: "ictSectionA",
    onSuccess: (data) => setCodesets(data),
  });

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      id: item.id,
      label: item.display?.toLowerCase() === "yes" || item.display?.toLowerCase() === "no" ? item.display.toLowerCase(): item.display,
      value: item.display,
    }));
  };

  // ── Field prop helpers ────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────
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
    if (e.target.value?.toLowerCase() !== "yes") setFieldValue("acceptedPns", "");
  };

  // ── Visibility flags ──────────────────────────────────────────────────────
  const showFacilitySetting = values.setting?.toLowerCase() === "facility";
  const showCommunityEntry = values.setting?.toLowerCase() === "community";
  const showArtClinic = !!values.isOnArt;
  const showCategoryOther = values.clientCategory?.toLowerCase() === "other";
  const showAcceptedPns = values.offeredPns?.toLowerCase() === "yes";

  // ── Resolve display names from fetched lists ──────────────────────────────
  // values.state and values.lga hold numeric IDs (from HTS / person record).
  // We look them up in the fetched lists to get human-readable names for display.
  // The raw IDs stay in formik values unchanged so the payload is unaffected.
  const stateDisplayName =
    statesList.find((s) => String(s.id) === String(values.state))?.name ??
    (loadingStates ? "Loading…" : values.state ?? "");

  const lgaDisplayName =
    lgasList.find((l) => String(l.id) === String(values.lga))?.name ??
    (loadingLgas ? "Loading…" : values.lga ?? "");

  return (
    <div style={{ width: "100%" }}>

      {/* ── Facility context (all read-only from system) ── */}
      <SectionSubheading>Facility Context</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <ReadOnlyField label="State" value={stateDisplayName} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="LGA" value={lgaDisplayName} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Facility Name" value={values.facilityName} />
        </div>
      </div>

      {/* ── Visit / Setting ── */}
      <SectionSubheading>Visit Details</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <FormTextField
            label="Date of Service"
            type="date"
            {...fp("dateOfService")}
            required
          />
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

      {/* ── Index Client Identity (auto-populated, read-only) ── */}
      <SectionSubheading>Index Client Details</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <ReadOnlyField label="Index Client ID (HTS Code)" value={values.indexClientId} />
        </div>
        {values.artUniqueId && (
          <div className="col-md-4">
            <ReadOnlyField label="ART Unique ID" value={values.artUniqueId} />
          </div>
        )}
        <div className="col-md-4">
          <ReadOnlyField label="First Name" value={values.indexFirstName} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Middle Name" value={values.indexMiddleName} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Surname" value={values.indexSurname} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Sex" value={values.indexSex} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Date of Birth" value={values.indexDob} />
        </div>
        <div className="col-md-4">
          <ReadOnlyField label="Age" value={values.indexAge} />
        </div>
      </div>

      {/* ── Contact info (phone editable, address editable if needed) ── */}
      <div className="row" style={{ marginTop: 4 }}>
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>
              Phone Number <span style={{ color: "red" }}> *</span>
            </Label>
            <Input
              type="text"
              name="indexPhone"
              value={values.indexPhone || ""}
              onChange={readOnly ? undefined : handleChange}
              onBlur={handleBlur}
              maxLength={10}
              disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              placeholder="10 digits"
            />
            {touched.indexPhone && errors.indexPhone && (
              <span style={errorStyle}>{errors.indexPhone}</span>
            )}
          </FormGroup>
        </div>

        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Alternative Phone Number</Label>
            <Input
              type="text"
              name="indexAltPhone"
              value={values.indexAltPhone || ""}
              onChange={readOnly ? undefined : handleChange}
              onBlur={handleBlur}
              maxLength={11}
              disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              placeholder="10-11 digits"
            />
            {touched.indexAltPhone && errors.indexAltPhone && (
              <span style={errorStyle}>{errors.indexAltPhone}</span>
            )}
          </FormGroup>
        </div>

        <div className="col-md-4">
          <FormTextField
            label="Descriptive Residential Address"
            type="textarea"
            {...fp("indexAddress")}
            required
          />
        </div>
      </div>

      {/* ── Client Category ── */}
      <SectionSubheading>Client Category & PNS</SectionSubheading>
      <div className="row">
        <div className="col-md-4">
          <FormSelect
            label="Client Category"
            {...sp("clientCategory", CLIENT_CATEGORY_OPTIONS)}
            onChange={readOnly ? undefined : handleCategoryChange}
            required
          />
        </div>

        {showCategoryOther && (
          <div className="col-md-4">
            <FormTextField
              label="Specify Other Category"
              {...fp("clientCategoryOther")}
              required
            />
          </div>
        )}

        <div className="col-md-4">
          <FormSelect
            label="Offered PNS?"
            {...sp("offeredPns", transformOptions(codesets?.["YES_NO"]))}
            onChange={readOnly ? undefined : handleOfferedPnsChange}
            required
          />
        </div>

        {showAcceptedPns && (
          <div className="col-md-4">
            <FormSelect
              label="Accepted PNS?"
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