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
  FACILITY_SETTING_OPTIONS,
  COMMUNITY_ENTRY_POINT_OPTIONS,
  SEX_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PREGNANCY_STATUS_OPTIONS,
  BREASTFEEDING_DURATION_OPTIONS,
  TYPE_OF_SESSION_OPTIONS,
  INDEX_RELATIONSHIP_OPTIONS,
  YES_NO_OPTIONS,
  DUMMY_STATES,
  DUMMY_LGAS,
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

  const [accountDetail, setAccountDetail] = useState(null)
  const [codesets, setCodesets] = useState(null)

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



  const handleFetchFacilityName = async () => {
    try {
      const response = await axios.get(`${url}account`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAccountDetail(response.data)
      setFieldValue("facilityName", response.data?.currentOrganisationUnitName)
      return response.data;
    } catch (error) {
      console.error("Error fetching account:", error.response?.data || error.message);
      throw error;
    }
  };


  useEffect(() => {
    handleFetchFacilityName()


  }, [])




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
      e.preventDefault()
    }
    setFieldValue("numberOfCoWives", cowives);

  };

  const handleNoOfWives = (e) => {
    const wives = e.target.value;
    if (e.target.value === "." || e.target.value === ",") {
      e.preventDefault()
    }
    setFieldValue("numberOfWives", wives);

  };

  const handleNoOfBiologicalChildren = (e) => {
    const children = e.target.value;
    if (e.target.value === "." || e.target.value === ",") {
      e.preventDefault()
    }
    setFieldValue("numberOfBiologicalChildren", children);

  };

  const handleStateChange = (e) => {
    setFieldValue("clientState", e.target.value);
    setFieldValue("clientLga", "");
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
    if (val !== "Yes") {
      setFieldValue("indexRelationship", "");
      setFieldValue("indexClientCode", "");
    }
  };

  /**
   * Switching dobType clears the field that becomes disabled so stale
   * values don't sit in formik state and confuse validation.
   */
  const handleDobTypeChange = (e) => {
    const type = e.target.value;
    setFieldValue("dobType", type);
    if (type === "Actual") {
      setFieldValue("age", "");
    } else {
      setFieldValue("dateOfBirth", "");
    }
  };

  /**
   * When the user picks a real date (Actual mode), auto-calculate and
   * populate age read-only next to the date field for convenience.
   */
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

  /**
   * When the user types an age in Estimated mode:
   *  - Enforce whole numbers only (strip decimals on input)
   *  - Back-calculate a DOB by subtracting years from today
   *    (mid-year: 15 June of the birth year, matching the BasicInfo.jsx pattern)
   *  - Populate dateOfBirth so the disabled date field shows a value
   */
  const handleAgeChange = (e) => {
    const raw = e.target.value;
    // Strip any decimal portion — only whole numbers allowed
    const wholeOnly = raw.includes(".")
      ? raw.slice(0, raw.indexOf("."))
      : raw;
    setFieldValue("age", wholeOnly);

    const n = parseInt(wholeOnly, 10);
    if (!isNaN(n) && n >= 0 && n <= 130) {
      // Use 15 June as a neutral mid-year estimate (same convention as BasicInfo.jsx)
      const estimated = new Date();
      estimated.setMonth(5);   // June (0-indexed)
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

  // ── derived visibility flags — mirror validationSchema.js exactly ──────────

  const showFacilitySetting = values.setting === "Facility";
  const showCommunityEntry = values.setting === "Community";

  const showIndexFields = values.typeOfSession === "Index Testing";
  const showIndexDetails = showIndexFields && values.indexTesting === "Yes";

  // Pregnancy visible only for Female
  const showPregnancy = values.sex === "Female";
  // Breastfeeding duration visible only when pregnancyStatus=Breastfeeding
  const showBreastfeedingDuration = values.pregnancyStatus === "Breastfeeding";
  // numberOfWives visible only for Male + Married
  const showNumberOfWives = values.sex === "Male" && values.maritalStatus === "Married";
  // numberOfCoWives visible only for Female + Married
  const showNumberOfCoWives = values.sex === "Female" && values.maritalStatus === "Married";

  // dobType drives which DOB field is active
  const dobIsActual = values.dobType === "Actual" || !values.dobType;

  const lgaOptions = values.clientState ? (DUMMY_LGAS[values.clientState] || []) : [];

  const loadCodesets = (data) => {
    console.log(data)
    setCodesets(data)
  }
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
    ],
    patientId: accountDetail?.currentOrganisationUnitName,
    onSuccess: loadCodesets,
  });

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
            {...sp("typeOfSession", TYPE_OF_SESSION_OPTIONS)}
            onChange={readOnly ? undefined : handleTypeOfSessionChange}
            required
          />
        </div>

        {showIndexFields && (
          <div className="col-md-6">
            <FormSelect
              label="Index Testing"
              {...sp("indexTesting", YES_NO_OPTIONS)}
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
                {...sp("indexRelationship", INDEX_RELATIONSHIP_OPTIONS)}
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

            {/* ── DOB radio + conditional date / age ── */}
            <div className="col-md-12">
              <FormGroup style={{ marginBottom: "16px" }}>
                <Label style={labelStyle}>
                  Date of Birth <span style={{ color: "red" }}> *</span>
                </Label>

                {/* Radio row */}
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

            {/* Date field — enabled when Actual */}
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

            {/* Age field — enabled when Estimated; auto-populated (read-only display) when Actual */}
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
                    // Block the decimal point key so users cannot type floats
                    if (e.key === "." || e.key === ",") e.preventDefault();
                  }}
                />
                {touched.age && errors.age && (
                  <span style={errorStyle}>{errors.age}</span>
                )}
              </FormGroup>
            </div>

            {/* Sex */}
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

        {/* ── Marital sub-fields — conditional on sex + marital status ── */}
        {showNumberOfWives && (
          <div className="col-md-6">
            <Label style={labelStyle}>
              No. of Wives
            </Label>
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
                // Block the decimal point key so users cannot type floats
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
            <Label style={labelStyle}>
              No. of Co-wives
            </Label>
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
                // Block the decimal point key so users cannot type floats
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
            />
            {touched.numberOfCoWives && errors.numberOfCoWives && (
              <span style={errorStyle}>{errors.numberOfCoWives}</span>
            )}

          </div>
        )}

        <div className="col-md-6">
          <Label style={labelStyle}>
            {"No. of Biological Children < 15 years"}
          </Label>
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
              // Block the decimal point key so users cannot type floats
              if (e.key === "." || e.key === ",") e.preventDefault();
            }}
          />
          {touched.numberOfBiologicalChildren && errors.numberOfBiologicalChildren && (
            <span style={errorStyle}>{errors.numberOfBiologicalChildren}</span>
          )}

        </div>


        {/* ── Pregnancy — Female only ── */}
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

        {/* ── Breastfeeding duration — only when pregnancyStatus=Breastfeeding ── */}
        {showBreastfeedingDuration && (
          <div className="col-md-6">
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
              disabled={readOnly}
              style={selectStyle}
            >
              <option value="">Select option</option>
              {DUMMY_STATES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
            {...sp("clientLga", lgaOptions, !values.clientState)}
            required
          />
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