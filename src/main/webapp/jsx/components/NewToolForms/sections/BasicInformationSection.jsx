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
import {
  MODALITY_OPTIONS,
  BREASTFEEDING_DURATION_OPTIONS,
  INDEX_RELATIONSHIP_OPTIONS,

} from "../constants";
import axios from "axios";
import { url, token } from "../../../../api";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";

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

  // State and LGA data from API
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
      label: item.display,
      value: item.display
    }));
  };

  // ─── API calls ─────────────────────────────────────────────────────────

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

  // If an existing patient already has a state, fetch its LGAs once statesList is loaded
  useEffect(() => {
    if (!readOnly && statesList.length > 0 && values.clientState) {
      const selectedState = statesList.find(s => s.name === values.clientState);
      if (selectedState) {
        fetchLgas(selectedState.id);
      }
    }
  }, [statesList, values.clientState, readOnly]);

  // Fetch account details (existing code)
  const handleFetchFacilityName = async () => {
    try {
      const response = await axios.get(`${url}account`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAccountDetail(response.data);
      setFieldValue("facilityName", response.data?.currentOrganisationUnitName);
      return response.data;
    } catch (error) {
      console.error("Error fetching account:", error.response?.data || error.message);
      throw error;
    }
  };

  useEffect(() => {
    handleFetchFacilityName();
  }, []);

  // Load codesets (existing code)
  const loadCodesets = (data) => {
    console.log(data);
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
      "GENDER",
      "SEX",
      "YES_NO"
    ],
    patientId: accountDetail?.currentOrganisationUnitName,
    onSuccess: loadCodesets,
  });

  // ─── Event handlers (modified to work with dynamic data) ───────────────

  const handleSettingChange = (e) => {
    setFieldValue("setting", e.target.value);
    setFieldValue("facilitySetting", "");
    setFieldValue("communityEntryPoint", "");
  };

  const handleSexChange = (e) => {
    const sex = e.target.value;
    setFieldValue("sex", sex);
    if (sex === "Male") {
      setFieldValue("pregnancyStatus", "");
      setFieldValue("breastfeedingDuration", "");
      setFieldValue("numberOfCoWives", "");
    }
    if (sex === "Female") {
      setFieldValue("numberOfWives", "");
    }
  };

  const handleMaritalStatusChange = (e) => {
    const status = e.target.value;
    setFieldValue("maritalStatus", status);
    if (status !== "Married") {
      setFieldValue("numberOfWives", "");
      setFieldValue("numberOfCoWives", "");
    }
  };

  const handlePregnancyStatusChange = (e) => {
    const status = e.target.value;
    setFieldValue("pregnancyStatus", status);
    if (status !== "Breastfeeding") {
      setFieldValue("breastfeedingDuration", "");
    }
  };

  const handleCoWives = (e) => {
    const cowives = e.target.value;
    if (e.target.value === "." || e.target.value === ",") {
      e.preventDefault();
    }
    setFieldValue("numberOfCoWives", cowives);
  };

  const handleNoOfWives = (e) => {
    const wives = e.target.value;
    if (e.target.value === "." || e.target.value === ",") {
      e.preventDefault();
    }
    setFieldValue("numberOfWives", wives);
  };

  const handleNoOfBiologicalChildren = (e) => {
    const children = e.target.value;
    if (e.target.value === "." || e.target.value === ",") {
      e.preventDefault();
    }
    setFieldValue("numberOfBiologicalChildren", children);
  };

  // Updated state change handler – uses state name, but fetches LGAs using ID
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFieldValue("clientState", stateName);
    setFieldValue("clientLga", ""); // Clear LGA when state changes
    setLgasList([]); // Clear current LGAs

    if (stateName) {
      const selectedState = statesList.find(s => s.name === stateName);
      if (selectedState) {
        fetchLgas(selectedState.id);
      }
    }
  };

  const handleTypeOfSessionChange = (e) => {
    const val = e.target.value;
    setFieldValue("typeOfSession", val);
    if (val !== "Index Testing") {
      setFieldValue("indexTesting", "");
      setFieldValue("indexRelationship", "");
      setFieldValue("indexClientCode", "");
    }
  };

  const handleIndexTestingChange = (e) => {
    const val = e.target.value;
    setFieldValue("indexTesting", val);
    if (val.toLowerCase() !== "yes") {
      setFieldValue("indexRelationship", "");
      setFieldValue("indexClientCode", "");
    }
  };

  const handleDobTypeChange = (e) => {
    const type = e.target.value;
    setFieldValue("dobType", type);
    if (type === "Actual") {
      setFieldValue("age", "");
    } else {
      setFieldValue("dateOfBirth", "");
    }
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
    const wholeOnly = raw.includes(".")
      ? raw.slice(0, raw.indexOf("."))
      : raw;
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

  // ─── Visibility flags ───────────────────────────────────────────────────

  const showFacilitySetting = values.setting === "Facility";
  const showCommunityEntry = values.setting === "Community";

  const showIndexFields = values.typeOfSession === "Index Testing";
  const showIndexDetails = showIndexFields && values.indexTesting.toLowerCase() === "yes";

  const showPregnancy = values.sex === "Female";
  const showBreastfeedingDuration = values.pregnancyStatus === "Breastfeeding";
  const showNumberOfWives = values.sex === "Male" && values.maritalStatus === "Married";
  const showNumberOfCoWives = values.sex === "Female" && values.maritalStatus === "Married";

  const dobIsActual = values.dobType === "Actual" || !values.dobType;

  // Prepare options for LGA select using fetched data
  const lgaOptions = lgasList.map(lga => ({ label: lga.name, value: lga.name }));

  return (
    <div style={{ width: "100%" }}>
      {/* ── Visit / Setting row ── */}
      <div className="row">
        <div className="col-md-6">
          <FormGroup style={{ marginBottom: "16px" }}>
            <FormTextField
              label="Facility/Site Name"
              type="text"
              {...fp("facilityName")}
              disabled
              readOnly
              required
              style={{ ...inputStyle, background: "#f6f8fa", color: "#57606a" }}
            />
          </FormGroup>
        </div>

        <div className="col-md-6">
          <FormTextField
            label="Date of Visit"
            type="date"
            {...fp("dateOfVisit")}
            required
          />
        </div>

        <div className="col-md-6">
          <FormTextField
            label="Client Code"
            {...fp("clientCode")}
            disabled={isExistingPatient || readOnly}
            required
          />
        </div>

        <div className="col-md-6">
          <FormSelect
            label="Setting"
            {...sp("setting", transformOptions(codesets?.["HTS_ENTRY_POINT"]))}
            onChange={readOnly ? undefined : handleSettingChange}
            required
          />
        </div>

        {showFacilitySetting && (
          <div className="col-md-6">
            <FormSelect
              label="Facility Setting"
              {...sp("facilitySetting", transformOptions(codesets?.["FACILITY_HTS_TEST_SETTING"]))}
              required
            />
          </div>
        )}

        {showCommunityEntry && (
          <div className="col-md-6">
            <FormSelect
              label="Community Entry Point"
              {...sp("communityEntryPoint", transformOptions(codesets?.["COMMUNITY_HTS_TEST_SETTING"]))}
              required
            />
          </div>
        )}

        <div className="col-md-6">
          <FormSelect
            label="Modality"
            {...sp("modality", MODALITY_OPTIONS)}
            required
          />
        </div>

        <div className="col-md-6">
          <FormSelect
            label="Type of Session"
            {...sp("typeOfSession", transformOptions(codesets?.["COUNSELING_TYPE"]))}
            onChange={readOnly ? undefined : handleTypeOfSessionChange}
            required
          />
        </div>

        {showIndexFields && (
          <div className="col-md-6">
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
            <div className="col-md-6">
              <FormSelect
                label="Relationship of Index Client"
                {...sp("indexRelationship", transformOptions(codesets?.["INDEX_TESTING"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormTextField
                label="Index Client Code/ID"
                {...fp("indexClientCode")}
                required
              />
            </div>
          </>
         )} 
      </div>

      <SectionSubheading>Client Demographics</SectionSubheading>

      {/* ── Demographics ── */}
      <div className="row">
        {isExistingPatient ? (
          <>
            <div className="col-md-4">
              <ReadOnlyField label="Surname" value={values.surname} />
            </div>
            <div className="col-md-4">
              <ReadOnlyField label="First Name" value={values.firstName} />
            </div>
            <div className="col-md-4">
              <ReadOnlyField label="Middle Name" value={values.middleName} />
            </div>
            <div className="col-md-6">
              <ReadOnlyField label="Date of Birth" value={values.dateOfBirth} />
            </div>
            <div className="col-md-6">
              <ReadOnlyField label="Age" value={values.age} />
            </div>
            <div className="col-md-6">
              <ReadOnlyField label="Sex" value={values.sex} />
            </div>
            <div className="col-md-6">
              <ReadOnlyField label="Phone Number" value={values.phoneNumber} />
            </div>
            <div className="col-md-6">
              <ReadOnlyField label="Marital Status" value={values.maritalStatus} />
            </div>
          </>
        ) : (
          <>
            {/* Name */}
            <div className="col-md-4">
              <FormTextField label="Surname" {...fp("surname")} required />
            </div>
            <div className="col-md-4">
              <FormTextField label="First Name" {...fp("firstName")} required />
            </div>
            <div className="col-md-4">
              <FormTextField label="Middle Name" {...fp("middleName")} />
            </div>

            {/* DOB radio + conditional date / age */}
            <div className="col-md-12">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date of Birth <span style={{ color: "red" }}> *</span>
                </Label>
                <div style={radioGroupStyle}>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="dobType"
                      value="Actual"
                      checked={values.dobType === "Actual"}
                      onChange={readOnly ? undefined : handleDobTypeChange}
                      disabled={readOnly}
                    />
                    Actual
                  </label>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="dobType"
                      value="Estimated"
                      checked={values.dobType === "Estimated"}
                      onChange={readOnly ? undefined : handleDobTypeChange}
                      disabled={readOnly}
                    />
                    Estimated
                  </label>
                </div>
                {touched.dobType && errors.dobType && (
                  <span style={errorStyle}>{errors.dobType}</span>
                )}
              </FormGroup>
            </div>

            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date {dobIsActual && <span style={{ color: "red" }}> *</span>}
                </Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={values.dateOfBirth || ""}
                  onChange={readOnly || !dobIsActual ? undefined : handleDateOfBirthChange}
                  onBlur={handleBlur}
                  max={today}
                  onKeyPress={(e) => e.preventDefault()}
                  disabled={readOnly || !dobIsActual}
                  style={readOnly || !dobIsActual ? disabledInputStyle : inputStyle}
                />
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <span style={errorStyle}>{errors.dateOfBirth}</span>
                )}
              </FormGroup>
            </div>

            <div className="col-md-4">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Age {!dobIsActual && <span style={{ color: "red" }}> *</span>}
                </Label>
                <Input
                  type="number"
                  name="age"
                  value={values.age || ""}
                  onChange={readOnly || dobIsActual ? undefined : handleAgeChange}
                  onBlur={handleBlur}
                  min="0"
                  max="130"
                  step="1"
                  disabled={readOnly || dobIsActual}
                  style={readOnly || dobIsActual ? disabledInputStyle : inputStyle}
                  placeholder={dobIsActual ? "Auto-calculated" : "Enter age"}
                  onKeyDown={(e) => {
                    if (e.key === "." || e.key === ",") e.preventDefault();
                  }}
                />
                {touched.age && errors.age && (
                  <span style={errorStyle}>{errors.age}</span>
                )}
              </FormGroup>
            </div>

            <div className="col-md-4">
              <FormSelect
                label="Sex"
                {...sp("sex", transformOptions(codesets?.["GENDER"]))}
                onChange={readOnly ? undefined : handleSexChange}
                required
              />
            </div>

            <div className="col-md-6">
              <FormTextField
                label="Phone Number"
                {...fp("phoneNumber")}
                required
              />
            </div>

            <div className="col-md-6">
              <FormSelect
                label="Marital Status"
                {...sp("maritalStatus", transformOptions(codesets?.["MARITAL_STATUS"]))}
                onChange={readOnly ? undefined : handleMaritalStatusChange}
                required
              />
            </div>
          </>
        )}

        {/* Marital sub-fields */}
        {showNumberOfWives && (
          <div className="col-md-6">
            <Label style={labelStyle}>No. of Wives</Label>
            <Input
              type="number"
              name="numberOfWives"
              value={values.numberOfWives || ""}
              onChange={readOnly ? undefined : handleNoOfWives}
              onBlur={handleBlur}
              min="0"
              step="1"
              disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
            />
            {touched.numberOfWives && errors.numberOfWives && (
              <span style={errorStyle}>{errors.numberOfWives}</span>
            )}
          </div>
        )}

        {showNumberOfCoWives && (
          <div className="col-md-6">
            <Label style={labelStyle}>No. of Co-wives</Label>
            <Input
              type="number"
              name="numberOfCoWives"
              value={values.numberOfCoWives || ""}
              onChange={readOnly ? undefined : handleCoWives}
              onBlur={handleBlur}
              min="0"
              step="1"
              disabled={readOnly}
              style={readOnly ? disabledInputStyle : inputStyle}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
            />
            {touched.numberOfCoWives && errors.numberOfCoWives && (
              <span style={errorStyle}>{errors.numberOfCoWives}</span>
            )}
          </div>
        )}

        <div className="col-md-6">
          <Label style={labelStyle}>{"No. of Biological Children < 15 years"}</Label>
          <Input
            type="number"
            name="numberOfBiologicalChildren"
            value={values.numberOfBiologicalChildren || ""}
            onChange={readOnly ? undefined : handleNoOfBiologicalChildren}
            onBlur={handleBlur}
            min="0"
            step="1"
            disabled={readOnly}
            style={readOnly ? disabledInputStyle : inputStyle}
            onKeyDown={(e) => {
              if (e.key === "." || e.key === ",") e.preventDefault();
            }}
          />
          {touched.numberOfBiologicalChildren && errors.numberOfBiologicalChildren && (
            <span style={errorStyle}>{errors.numberOfBiologicalChildren}</span>
          )}
        </div>

        {/* Pregnancy */}
        {showPregnancy && (
          <div className={`col-md-6 ${formik.values.maritalStatus === "Married" ? "mt-4" : ""}`}>
            <FormSelect
              label="Pregnancy Status"
              {...sp("pregnancyStatus", transformOptions(codesets?.["PREGNANCY_STATUS"]))}
              onChange={readOnly ? undefined : handlePregnancyStatusChange}
              required
            />
          </div>
        )}

        {showBreastfeedingDuration && (
          <div className={`col-md-6 ${formik.values.pregnancyStatus === "Breastfeeding" ? "mt-4" : ""}`}>
            <FormSelect
              label="Duration of Breastfeeding"
              {...sp("breastfeedingDuration", BREASTFEEDING_DURATION_OPTIONS)}
              required
            />
          </div>
        )}
      </div>

      <SectionSubheading>Address Information</SectionSubheading>

      <div className="row">
        <div className="col-md-6">
          <FormGroup style={{ marginBottom: "16px" }}>
            <Label style={labelStyle}>
              State of Residence <span style={{ color: "red" }}> *</span>
            </Label>
            <select
              className="form-control"
              name="clientState"
              value={values.clientState || ""}
              onChange={readOnly ? undefined : handleStateChange}
              onBlur={handleBlur}
              disabled={readOnly || loadingStates}
              style={selectStyle}
            >
              <option value="">
                {loadingStates ? "Loading states..." : "Select option"}
              </option>
              {statesList.map((state) => (
                <option key={state.id} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            {touched.clientState && errors.clientState && (
              <span style={errorStyle}>{errors.clientState}</span>
            )}
          </FormGroup>
        </div>

        <div className="col-md-6">
          <FormSelect
            label="LGA of Residence"
            {...sp("clientLga", lgaOptions, !values.clientState || loadingLgas)}
            required
          />
          {loadingLgas && (
            <small style={{ color: "#57606a", marginTop: 4, display: "block" }}>
              Loading LGAs...
            </small>
          )}
        </div>

        <div className="col-md-12">
          <FormTextField
            label="Address"
            type="textarea"
            {...fp("address")}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;