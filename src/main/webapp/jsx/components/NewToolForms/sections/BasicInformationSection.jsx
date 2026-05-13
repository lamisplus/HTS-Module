// src/NewToolForms/sections/BasicInformationSection.jsx
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import {
  FormSelect,
  FormTextField,
  ReadOnlyField,
  SectionSubheading,
  labelStyle,
  inputStyle,
  selectStyle,
} from "./FormFields";
import axios from "axios";
import { url, token } from "../../../../api";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { arrayToObject, generateClientCode } from "../utils/htsEncounterPayload";
// import { getAllHtsEncounter } from "../../../services/getAllHtsEncounter";
import { capitalizeFirstLetter } from "../../utils";

const today = new Date().toISOString().split("T")[0];

const errorStyle = {
  color: "#f85032",
  fontSize: "12.8px",
  marginTop: "4px",
  display: "block",
};

const radioGroupStyle = {
  display: "flex",
  gap: "24px",
  alignItems: "center",
  marginTop: "6px",
  height: "41px",
};

const radioLabelStyle = {
  fontSize: "14px",
  color: "#24292f",
  fontWeight: "normal",
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f6f8fa",
  color: "#8c959f",
  cursor: "not-allowed",
};

const BasicInformationSection = ({ formik, isExistingPatient, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  const [accountDetail, setAccountDetail] = useState(null);
  const [codesets, setCodesets] = useState(null);

  const [statesList, setStatesList] = useState([]);
  const [lgasList, setLgasList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

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


  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: item.display.toLowerCase() === 'yes' || item.display.toLowerCase() === 'no' ? capitalizeFirstLetter(item.display) : item.display,
      value: item.code,
    }));
  };

  // ---------- API calls ----------
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
    // getAllHtsEncounter();
  }, []);

  useEffect(() => {
    if (statesList.length > 0 && values.clientState) {
      const selectedState = statesList.find(s => String(s.id) === String(values.clientState));
      if (selectedState) {
        fetchLgas(selectedState.id);
      }
    }
  }, [statesList, values.clientState, readOnly]);

  useEffect(() => {
    const { setting, facilitySetting, communityEntryPoint, dateOfVisit, clientCode } = values;
    // Never overwrite an existing client code (guards against enableReinitialize
    // briefly resetting to "" before external values arrive)
    // if (clientCode) return;
    const settingSubField =
      setting === "HTS_ENTRY_POINT_FACILITY" ? facilitySetting :
        setting === "HTS_ENTRY_POINT_COMMUNITY" ? communityEntryPoint :
          setting;
    if (setting && settingSubField && dateOfVisit) {
      setFieldValue("clientCode", generateClientCode(setting, dateOfVisit));
    }
  }, [values.setting, values.facilitySetting, values.communityEntryPoint, values.dateOfVisit]);


  const handleFetchFacilityName = async () => {
    try {
      const response = await axios.get(`${url}account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccountDetail(response.data);
      setFieldValue("facilityName", response.data?.currentOrganisationUnitName);
      setFieldValue("currentOrganisationUnitId", response.data?.currentOrganisationUnitId);
      return response.data;
    } catch (error) {
      console.error("Error fetching account:", error);
      throw error;
    }
  };

  useEffect(() => {
    handleFetchFacilityName();
  }, []);

  const loadCodesets = (data) => {
    setCodesets(data);
  };
  useGetCodesets({
    codesetsKeys: [
      "TARGET_GROUP",
      "INDEX_TESTING",
      "PREGNANCY_STATUS",
      "COUNSELING_TYPE",
      "COMMUNITY_HTS_TEST_SETTING",
      "FACILITY_HTS_TEST_SETTING",
      "HTS_ENTRY_POINT",
      "TEST_SETTING",
      "MARITAL_STATUS",
      "SOURCE_REFERRAL",
      "SEX",
      "YES_NO",
      "ENROLLMENT_SETTING",
      "DURATION_OF_BREASTFEEDING"
    ],
    patientId: accountDetail?.currentOrganisationUnitName,
    onSuccess: loadCodesets,
  });

  // ---------- Event handlers ----------
  const handleSettingChange = (e) => {
    setFieldValue("setting", e.target.value);
    setFieldValue("facilitySetting", "");
    setFieldValue("communityEntryPoint", "");
    if (!isExistingPatient) {
      setFieldValue("clientCode", "");
    }
  };

  const handleSexChange = (e) => {
    const sex = e.target.value;
    setFieldValue("sex", sex);
    const map = arrayToObject(codesets?.["SEX"]);
    setFieldValue("sexCode", String(map[sex])); // still store numeric id separately
    if (sex === "SEX_MALE") {
      setFieldValue("pregnancyStatus", "");
      setFieldValue("breastfeedingDuration", "");
      setFieldValue("numberOfCoWives", "");
    }
    if (sex === "SEX_FEMALE") {
      setFieldValue("numberOfWives", "");
    }
  };

  const handleMaritalStatusChange = (e) => {
    const status = e.target.value;
    setFieldValue("maritalStatus", status);
    const map = arrayToObject(codesets?.["MARITAL_STATUS"]);
    setFieldValue("maritalStatusCode", String(map[status]));
    if (status !== "MARITAL_STATUS_MARRIED") {
      setFieldValue("numberOfWives", "");
      setFieldValue("numberOfCoWives", "");
    }
  };

  const handlePregnancyStatusChange = (e) => {
    const status = e.target.value;
    setFieldValue("pregnancyStatus", status);
    if (status !== "PREGANACY_STATUS_BREASTFEEDING") {
      setFieldValue("breastfeedingDuration", "");
    }
  };

  const handleCoWives = (e) => {
    if (e.target.value === "." || e.target.value === ",") e.preventDefault();
    setFieldValue("numberOfCoWives", e.target.value);
  };

  const handleNoOfWives = (e) => {
    if (e.target.value === "." || e.target.value === ",") e.preventDefault();
    setFieldValue("numberOfWives", e.target.value);
  };

  const handleNoOfBiologicalChildren = (e) => {
    if (e.target.value === "." || e.target.value === ",") e.preventDefault();
    setFieldValue("numberOfBiologicalChildren", e.target.value);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFieldValue("clientState", stateName);
    setFieldValue("clientLga", "");
    setLgasList([]);
    if (stateName) {
      const selectedState = statesList.find(s => s.name === stateName);
      if (selectedState) fetchLgas(selectedState.id);
    }
  };

  const handleTypeOfSessionChange = (e) => {
    const val = e.target.value;
    setFieldValue("typeOfSession", val);
    if (val !== "COUNSELING_TYPE_INDEX_CONTACT_TESTING") {
      setFieldValue("indexTesting", "");
      setFieldValue("indexRelationship", "");
      setFieldValue("indexClientCode", "");
    }
  };

  const handleIndexTestingChange = (e) => {
    const val = e.target.value;
    setFieldValue("indexTesting", val);
    if (val !== "YES_NO_YES") {
      setFieldValue("indexRelationship", "");
      setFieldValue("indexClientCode", "");
    }
  };

  const handleDobTypeChange = (e) => {
    const type = e.target.value;
    setFieldValue("dobType", type);
    setFieldValue("adolescentHivPositive", "");
    setFieldValue("age", "");
    setFieldValue("dateOfBirth", "");
  };

  const handleDateOfBirthChange = (e) => {
    const val = e.target.value;
    setFieldValue("dateOfBirth", val);
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
      setFieldValue("age", years >= 0 ? String(years) : "");
    } else {
      setFieldValue("age", "");
    }
  };

  const handleAgeChange = (e) => {
    const raw = e.target.value;
    const wholeOnly = raw.includes(".") ? raw.slice(0, raw.indexOf(".")) : raw;
    setFieldValue("age", wholeOnly);
    const n = parseInt(wholeOnly, 10);
    if (!isNaN(n) && n >= 0 && n <= 130) {
      const estimated = new Date();
      estimated.setMonth(5);
      estimated.setDate(15);
      estimated.setFullYear(estimated.getFullYear() - n);
      const yyyy = estimated.getFullYear();
      const mm = String(estimated.getMonth() + 1).padStart(2, "0");
      const dd = String(estimated.getDate()).padStart(2, "0");
      setFieldValue("dateOfBirth", `${yyyy}-${mm}-${dd}`);
    } else {
      setFieldValue("dateOfBirth", "");
    }
  };

  // ---------- LGA options ----------
  const lgaOptions = lgasList.map(lga => ({ label: lga.name, value: lga.id }));

  // ---------- Visibility flags ----------
  const showFacilitySetting = values.setting === "HTS_ENTRY_POINT_FACILITY";
  const showCommunityEntry = values.setting === "HTS_ENTRY_POINT_COMMUNITY";

  const showIndexFields = values.typeOfSession === "COUNSELING_TYPE_INDEX_CONTACT_TESTING";
  const showIndexDetails = showIndexFields && values.indexTesting === "YES_NO_YES";

  const showPregnancy = values.sex === "SEX_FEMALE";
  const showBreastfeedingDuration = values.pregnancyStatus === "PREGANACY_STATUS_BREASTFEEDING";
  const showNumberOfWives = values.sex === "SEX_MALE" && values.maritalStatus === "MARITAL_STATUS_MARRIED";
  const showNumberOfCoWives = values.sex === "SEX_FEMALE" && values.maritalStatus === "MARITAL_STATUS_MARRIED";

  const dobIsActual = values?.dobType?.toLowerCase() === "actual" || !values?.dobType;

  return (
    <div style={{ width: "100%" }}>
      {/* Visit / Setting row */}
      <div className="row">
        <div className="col-md-4">
          <FormTextField label="Date of Visit" type="date" {...fp("dateOfVisit")} required
            min={values.dateOfBirth || today}
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
              label="Community Setting"
              {...sp("communityEntryPoint", transformOptions(codesets?.["COMMUNITY_HTS_TEST_SETTING"]))}
              required
            />
          </div>
        )}



        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>Client Code <span style={{ color: "red" }}>*</span></Label>
            <div style={{ position: "relative" }}>
              <Input
                type="text"
                name="clientCode"
                value={values.clientCode || ""}
                readOnly disabled
                style={{ ...disabledInputStyle, fontFamily: "monospace", letterSpacing: "0.04em", paddingRight: "90px" }}
              />
              <span
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  color: values.clientCode ? "#2e7d32" : "#8c959f",
                  background: values.clientCode ? "#e8f5e9" : "#f0f0f0",
                  padding: "2px 7px", borderRadius: "8px", pointerEvents: "none",
                }}
              >
                {values.clientCode ? "Auto-generated" : "Pending…"}
              </span>
            </div>
            {touched.clientCode && errors.clientCode && (
              <span style={errorStyle}>{errors.clientCode}</span>
            )}
            {!values.clientCode && (
              <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
                Fill in Setting, Setting sub-type, and Date of Visit to generate
              </small>
            )}
          </FormGroup>
        </div>



        <div className="col-md-4">
          <FormSelect
            label="Type of Session"
            {...sp("typeOfSession", transformOptions(codesets?.["COUNSELING_TYPE"]))}
            onChange={readOnly ? undefined : handleTypeOfSessionChange}
            required
          />
        </div>

        {showIndexFields && (
          <div className="col-md-4">
            <FormSelect
              label="Index Testing"
              {...sp("indexTesting", transformOptions(codesets?.["YES_NO"]))}
              onChange={readOnly ? undefined : handleIndexTestingChange}
              required
            />
          </div>
        )}

        {showIndexDetails && (
          <>
            <div className="col-md-4">
              <FormSelect
                label="Relationship of Index Client"
                {...sp("indexRelationship", transformOptions(codesets?.["INDEX_TESTING"]))}
                required
              />
            </div>
            <div className="col-md-4">
              <FormTextField label="Index Client Code/ID" {...fp("indexClientCode")} required />
            </div>
          </>
        )}

        <div className="col-md-4">
          <FormSelect
            label="Marital Status"
            {...sp("maritalStatus", transformOptions(codesets?.["MARITAL_STATUS"]))}
            readonly
            disabled
          />
        </div>


        {/* Marital sub fields */}
        {showNumberOfWives && (
          <div className="col-md-4">
            <Label style={labelStyle}>No. of Wives</Label>
            <Input type="number" name="numberOfWives" value={values.numberOfWives || ""}
              onChange={readOnly ? undefined : handleNoOfWives} onBlur={handleBlur}
              min="0" step="1" disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }}
            />
            {touched.numberOfWives && errors.numberOfWives && (
              <span style={errorStyle}>{errors.numberOfWives}</span>
            )}
          </div>
        )}

        {showNumberOfCoWives && (
          <div className="col-md-4">
            <Label style={labelStyle}>No. of Co-wives</Label>
            <Input type="number" name="numberOfCoWives" value={values.numberOfCoWives || ""}
              onChange={readOnly ? undefined : handleCoWives} onBlur={handleBlur}
              min="0" step="1" disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }}
            />
            {touched.numberOfCoWives && errors.numberOfCoWives && (
              <span style={errorStyle}>{errors.numberOfCoWives}</span>
            )}
          </div>
        )}

        <div className="col-md-4">
          <Label style={labelStyle}>No. of Biological Children &lt; 15 years</Label>
          <Input type="number" name="numberOfBiologicalChildren" value={values.numberOfBiologicalChildren || ""}
            onChange={readOnly ? undefined : handleNoOfBiologicalChildren} onBlur={handleBlur}
            min="0" step="1" disabled={readOnly}
            style={readOnly ? disabledInputStyle : inputStyle}
            onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }}
          />
          {touched.numberOfBiologicalChildren && errors.numberOfBiologicalChildren && (
            <span style={errorStyle}>{errors.numberOfBiologicalChildren}</span>
          )}
        </div>

        {showPregnancy && (
          <div className={`col-md-4`}>
            <FormSelect
              label="Pregnancy Status"
              {...sp("pregnancyStatus", transformOptions(codesets?.["PREGNANCY_STATUS"]))}
              onChange={readOnly ? undefined : handlePregnancyStatusChange}
              required
            />
          </div>
        )}

        {showBreastfeedingDuration && (
          <div className={`col-md-4 ${formik.values.pregnancyStatus === "PREGANACY_STATUS_BREASTFEEDING" ? "mt-4" : ""}`}>
            <FormSelect
              label="Duration of Breastfeeding"
              {...sp("breastfeedingDuration", transformOptions(codesets?.["DURATION_OF_BREASTFEEDING"]))}
              required
            />
          </div>
        )}
      </div>


      {/* Demographics (new patient only) */}
      {!isExistingPatient && (
        <div className="row mt-4">
          <div className="col-md-4"><FormTextField label="Surname" {...fp("surname")} /></div>
          <div className="col-md-4"><FormTextField label="First Name" {...fp("firstName")} /></div>
          <div className="col-md-4"><FormTextField label="Middle Name" {...fp("middleName")} /></div>
          {/* DOB radio + date/age */}
          <div className="col-md-12">
            <FormGroup style={{ marginBottom: "16px" }}>
              <Label style={labelStyle}>Date of Birth <span style={{ color: "red" }}>*</span></Label>
              <div style={radioGroupStyle}>
                <label style={radioLabelStyle}>
                  <input type="radio" name="dobType" value="Actual" checked={values.dobType.toLowerCase() === "actual"}
                    onChange={readOnly ? undefined : handleDobTypeChange} disabled={readOnly} /> Actual
                </label>
                <label style={radioLabelStyle}>
                  <input type="radio" name="dobType" value="Estimated" checked={values.dobType.toLowerCase() === "estimated"}
                    onChange={readOnly ? undefined : handleDobTypeChange} disabled={readOnly} /> Estimated
                </label>
              </div>
              {touched.dobType && errors.dobType && <span style={errorStyle}>{errors.dobType}</span>}
            </FormGroup>
          </div>
          <div className="col-md-4">
            <FormGroup style={{ marginBottom: "16px" }}>
              <Label style={labelStyle}>Date {dobIsActual && <span style={{ color: "red" }}>*</span>}</Label>
              <Input type="date" name="dateOfBirth" value={values.dateOfBirth || ""}
                onChange={readOnly || !dobIsActual ? undefined : handleDateOfBirthChange} onBlur={handleBlur}
                max={today} onKeyPress={(e) => e.preventDefault()}
                disabled={readOnly || !dobIsActual} style={readOnly || !dobIsActual ? disabledInputStyle : inputStyle} />
              {touched.dateOfBirth && errors.dateOfBirth && <span style={errorStyle}>{errors.dateOfBirth}</span>}
            </FormGroup>
          </div>
          <div className="col-md-4">
            <FormGroup style={{ marginBottom: "16px" }}>
              <Label style={labelStyle}>Age {!dobIsActual && <span style={{ color: "red" }}>*</span>}</Label>
              <Input type="number" name="age" value={values.age || ""}
                onChange={readOnly || dobIsActual ? undefined : handleAgeChange} onBlur={handleBlur}
                min="0" max="130" step="1"
                disabled={readOnly || dobIsActual} style={readOnly || dobIsActual ? disabledInputStyle : inputStyle}
                placeholder={dobIsActual ? "Auto-calculated" : "Enter age"}
                onKeyDown={(e) => { if (e.key === "." || e.key === ",") e.preventDefault(); }} />
              {touched.age && errors.age && <span style={errorStyle}>{errors.age}</span>}
            </FormGroup>
          </div>
          <div className="col-md-4">
            <FormSelect
              label="Sex"
              {...sp("sex", transformOptions(codesets?.["SEX"]))}
              onChange={readOnly ? undefined : handleSexChange}
              required
            />
          </div>
          <div className="col-md-4"><FormTextField label="Phone Number" {...fp("phoneNumber")} /></div>
          <div className="col-md-4">
            <FormSelect
              label="Marital Status"
              {...sp("maritalStatus", transformOptions(codesets?.["MARITAL_STATUS"]))}
              onChange={readOnly ? undefined : handleMaritalStatusChange}
            />
          </div>
        </div>
      )}

      <SectionSubheading>Address Information</SectionSubheading>

      <div className="row">
        <div className="col-md-4">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>State of Residence <span style={{ color: "red" }}>*</span></Label>
            <select className="form-control" name="clientState" value={values.clientState || ""}
              onChange={readOnly ? undefined : handleStateChange} onBlur={handleBlur}
              disabled={readOnly || loadingStates} style={selectStyle}>
              <option value="">{loadingStates ? "Loading states..." : "Select option"}</option>
              {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {touched.clientState && errors.clientState && <span style={errorStyle}>{errors.clientState}</span>}
          </FormGroup>
        </div>
        <div className="col-md-4">
          <FormSelect
            label="LGA of Residence"
            {...sp("clientLga", lgaOptions, !values.clientState || loadingLgas)}
            required
          />
        </div>
        <div className="col-md-4">
          <FormTextField label="Landmark" type="text" {...fp("landmark")} />
        </div>
        <div className="col-md-12">
          <FormTextField label="Address" type="textarea" {...fp("address")} />
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;