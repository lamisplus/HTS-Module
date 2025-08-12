import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { useHistory } from "react-router-dom";

import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { getNextForm } from "../../../../utility";

import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { Label as LabelRibbon, Message } from "semantic-ui-react";
import Cookies from "js-cookie";
import {
  calculate_age,
  generateDobFromAge,
  validateVisitDateWithDOB,
} from "../../utils";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 300,
  },
  button: {
    margin: theme.spacing(1),
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
  error: {
    color: "#f85032",
    fontSize: "12.8px",
  },
  success: {
    color: "green",
    fontSize: "12.8px",
    fontWeight: "bold",
  },
}));

const BasicInfo = (props) => {
  const classes = useStyles();

  const [enrollSetting, setEnrollSetting] = useState([]);
  const [entryPoint, setEntryPoint] = useState([]);
  const [entryPointCommunity, setEntryPointCommunity] = useState([]);
  const [entryPointSetting, setEntryPointSetting] = useState([]);

  let riskCountQuestion = [];
  const [kP, setKP] = useState([]);
  const [errors, setErrors] = useState({});
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [saving, setSaving] = useState(false);
  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [setting, setSetting] = useState([]);
  const [riskCount, setRiskCount] = useState(0);
  const [isPMTCTModality, setIsPMTCTModality] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [permissions, setPermission] = useState(
    localStorage.getItem("stringifiedPermmision")?.split(",")
  );
  const [spokeFacList, setSpokeFacList] = useState([]);
  const [showHealthFacility, setShowHealthFacility] = useState(false);

  const [nextForm, setNextForm] = useState([]);
  const [targetGroupValue, setTargetGroupValue] = useState(null);

  const [objValues, setObjValues] = useState({
    age: "",
    dob: "",
    code: "",
    visitDate: "",
    dateOfBirth: null,
    dateOfRegistration: null,
    isDateOfBirthEstimated: "",
    targetGroup: "",
    testingSetting: "",
    modality: "",
    careProvider: "",
    personId: "",
    id: "",
    riskAssessment: {},
    entryPoint: "",
    communityEntryPoint: "",
    spokeFacility: "",
    healthFacility: "",
  });

  const [riskAssessment, setRiskAssessment] = useState({
    lastHivTestForceToHaveSex: "",
    lastHivTestHadAnal: "",
    lastHivTestInjectedDrugs: "",
    whatWasTheResult: "",
    lastHivTestDone: "",
    diagnosedWithTb: "",
    lastHivTestPainfulUrination: "",
    lastHivTestBloodTransfusion: "",
    lastHivTestVaginalOral: "",
    lastHivTestBasedOnRequest: "",
  });
  useEffect(() => {
    if (objValues.age !== "") {
      props.setPatientObjAge(objValues.age);
    }
    if (props?.patientObj?.riskStratificationResponseDto !== null) {
      if (
        props?.activePage?.activeObject?.riskStratificationResponseDto
          ?.entryPoint === "HTS_ENTRY_POINT_COMMUNITY"
      ) {
        HTS_ENTRY_POINT_COMMUNITY();
      } else if (
        props?.activePage?.activeObject?.riskStratificationResponseDto
          ?.entryPoint === "HTS_ENTRY_POINT_FACILITY"
      ) {
        HTS_ENTRY_POINT_FACILITY();
      }
      setObjValues(props.patientObj.riskStratificationResponseDto);

      setRiskAssessment(
        props.patientObj.riskStratificationResponseDto.riskAssessment
      );
    }
  }, [objValues.age]);

  useEffect(() => {
    KP();
    TargetGroupSetup();
    PregnancyStatus();
    EntryPoint();
  }, []);
  //Get list of HIV STATUS ENROLLMENT
  const EnrollmentSetting = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEnrollSetting(response.data);
      })
      .catch((error) => {});
  };

  const PregnancyStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let pregnancyUsed = "";
        if (response.data.length > 0) {
          response.data.map((each, index) => {
            if (each.code === "PREGANACY_STATUS_PREGNANT") {
              pregnancyUsed = each.id;
            }
          });
        }
        localStorage.setItem("pregnancyCode", pregnancyUsed);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const EntryPoint = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HTS_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEntryPoint(response.data);
        if (
          props?.patientObj?.riskStratificationResponseDto?.entryPoint ===
          "HTS_ENTRY_POINT_COMMUNITY"
        ) {
          HTS_ENTRY_POINT_COMMUNITY();
        } else if (
          props?.patientObj?.riskStratificationResponseDto?.entryPoint ===
          "HTS_ENTRY_POINT_FACILITY"
        ) {
          HTS_ENTRY_POINT_FACILITY();
        } else {
          setEntryPointSetting([]);
        }
      })
      .catch((error) => {});
  };

  const getSpokeFaclityByHubSite = () => {
    let facility = Cookies.get("facilityName");
    axios
      .get(`${baseUrl}hts/spoke-site?hubSite=${facility}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSpokeFacList(response.data);
      })
      .catch((error) => {});
  };

  const HTS_ENTRY_POINT_FACILITY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        let facilityList = [];

        setEntryPointSetting(response.data);
      })
      .catch((error) => {});
  };

  const HTS_ENTRY_POINT_COMMUNITY = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/COMMUNITY_HTS_TEST_SETTING
 `,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setEntryPointSetting(response.data);
      })
      .catch((error) => {});
  };

  const TargetGroupSetup = () => {
    axios
      .get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTargetGroupValue(response.data);

        props.setOrganizationInfo(response.data);
      })
      .catch((error) => {});
  };
  //Get list of KP
  const KP = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TARGET_GROUP`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setKP(response.data);
      })
      .catch((error) => {});
  };

  //Set HTS menu registration
  const getMenuLogic = () => {
    props.setHideOtherMenu(false);
  };

  const checkPMTCTModality = (setting) => {
    if (
      setting === "FACILITY_HTS_TEST_SETTING_ANC" ||
      setting === "FACILITY_HTS_TEST_SETTING_L&D" ||
      setting === "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING"
    ) {
      setErrors({
        ...errors,
        lastHivTestDone: "",
        whatWasTheResult: "",
        lastHivTestVaginalOral: "",
        lastHivTestBloodTransfusion: "",
        lastHivTestPainfulUrination: "",
        diagnosedWithTb: "",
        lastHivTestInjectedDrugs: "",
        lastHivTestHadAnal: "",
        lastHivTestForceToHaveSex: "",
      });
      setIsPMTCTModality(true);
      return true;
    } else {
      setIsPMTCTModality(false);
      return false;
    }
  };

  const RESTRICTED_SETTINGS = [
    "FACILITY_HTS_TEST_SETTING_ANC",
    "FACILITY_HTS_TEST_SETTING_L&D",
    "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "targetGroup") {
      const isRestrictedSetting =
        objValues.testingSetting &&
        RESTRICTED_SETTINGS.includes(objValues.testingSetting);

      if (value === "TARGET_GROUP_MSM" && isRestrictedSetting) {
        toast.error(
          "MSM cannot be selected when ANC, L&D, or Postnatal Ward/Breastfeeding is chosen.",
          {
            position: toast.POSITION.BOTTOM_CENTER,
          }
        );
        return;
      }
    }

    setErrors({ ...temp, [name]: "" });

    if (name === "testingSetting" && value !== "") {
      setErrors({ ...temp, spokeFacility: "", healthFacility: "" });

      SettingModality(value);
      setObjValues({ ...objValues, [name]: value });
      let ans = checkPMTCTModality(value);

      if (
        value === "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
        value === "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
        value === "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
        value === "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
      ) {
        setShowHealthFacility(true);
      } else {
        setShowHealthFacility(false);
      }

      displayRiskAssessment(
        riskAssessment.lastHivTestBasedOnRequest,
        objValues.age,
        ans
      );

      // Get spoke sites
      if (
        value === "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" ||
        value === "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
        value === "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
        value === "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
        value === "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
      ) {
        getSpokeFaclityByHubSite();
      }

      // Set risk count
      if (
        value === "COMMUNITY_HTS_TEST_SETTING_STANDALONE_HTS" ||
        value === "FACILITY_HTS_TEST_SETTING_STANDALONE_HTS"
      ) {
        setRiskCount(1);
      } else if (
        value === "COMMUNITY_HTS_TEST_SETTING_CT" ||
        value === "FACILITY_HTS_TEST_SETTING_CT"
      ) {
        setRiskCount(1);
      } else if (value === "FACILITY_HTS_TEST_SETTING_TB") {
        setRiskCount(1);
      } else if (value === "FACILITY_HTS_TEST_SETTING_STI") {
        setRiskCount(1);
      } else if (value === "COMMUNITY_HTS_TEST_SETTING_OUTREACH") {
        setRiskCount(1);
      } else {
        setRiskCount(0);
      }

      return;
    }

    if (name === "entryPoint") {
      if (value === "HTS_ENTRY_POINT_COMMUNITY") {
        HTS_ENTRY_POINT_COMMUNITY();
      } else if (value === "HTS_ENTRY_POINT_FACILITY") {
        HTS_ENTRY_POINT_FACILITY();
      } else {
        setEntryPointSetting([]);
      }
    }

    setObjValues({ ...objValues, [name]: value });
  };

  // display risk assement function

  const displayRiskAssessment = (lastVisit, age, isPMTCTModalityValue) => {
    let SecAge = age !== "" ? age : 0;
    let ans;

    // for the section to show

    if (lastVisit === "false") {
      if (SecAge < 15 || isPMTCTModalityValue) {
        setShowRiskAssessment(false);
        ans = false;

        //
        if (age !== "") {
          setRiskAssessment({
            ...riskAssessment,
            lastHivTestForceToHaveSex: "",
            lastHivTestHadAnal: "",
            lastHivTestInjectedDrugs: "",
            whatWasTheResult: "",
            lastHivTestDone: "",
            diagnosedWithTb: "",
            lastHivTestPainfulUrination: "",
            lastHivTestBloodTransfusion: "",
            lastHivTestVaginalOral: "",
          });
        }
      } else if (SecAge > 15) {
        setShowRiskAssessment(true);
        ans = true;
      } else if (lastVisit === "false") {
        setShowRiskAssessment(true);
        ans = true;
      } else {
        setShowRiskAssessment(false);
        ans = false;
      }
    } else {
      setShowRiskAssessment(false);
      ans = false;
    }
  };
  //Date of Birth and Age handle

  const validateAgeRestriction = (formData) => {
    // Check if we have a restricted target group with age > 14
    if (
      formData &&
      (formData.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
        formData.targetGroup === "TARGET_GROUP_PD") &&
      formData.age > 14
    ) {
      return false;
    }
    return true;
  };

  const handleDobChange = (e) => {
    const dobValue = e.target.value;

    if (dobValue) {
      const age_now = calculate_age(dobValue);

      if (
        (objValues.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
          objValues.targetGroup === "TARGET_GROUP_PD") &&
        age_now > 14
      ) {
        setErrors({
          ...errors,
          age: "For this target group, age cannot be greater than 14 years",
        });
        return;
      }

      setErrors({
        ...errors,
        age: "",
      });

      setObjValues((prevState) => ({
        ...prevState,
        dob: dobValue,
        age: age_now,
      }));

      displayRiskAssessment(
        riskAssessment.lastHivTestBasedOnRequest,
        age_now,
        isPMTCTModality
      );
    } else {
      setObjValues((prevState) => ({
        ...prevState,
        dob: "",
        age: "",
      }));
    }
  };

  const handleDateOfBirthChange = (e) => {
    const dateType = e.target.value;
    const isEstimated = dateType === "Estimated";

    // Toggle age input disabled state - this is critical
    setAgeDisabled(!isEstimated);

    // Use setState with function to ensure we capture the latest state
    setObjValues((prevState) => {
      let updatedState = {
        ...prevState,
        isDateOfBirthEstimated: isEstimated,
      };

      // Check if current age exceeds limit for restricted groups
      if (
        (prevState.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
          prevState.targetGroup === "TARGET_GROUP_PD") &&
        prevState.age > 14
      ) {
        // Clear age and DOB instead of adjusting
        updatedState.age = "";
        updatedState.dob = "";

        // Set error in state instead of showing toast
        setErrors({
          ...errors,
          age: "The current age exceeds the limit of 14 for this target group",
        });
      } else {
        // Clear any existing age errors
        setErrors({
          ...errors,
          age: "",
        });
      }

      return updatedState;
    });
  };

  const handleAgeChange = (e) => {
    let newAge = e.target.value === "" ? "" : parseInt(e.target.value);

    if (newAge === "" || !isNaN(newAge)) {
      setObjValues((prevState) => {
        let updatedState = { ...prevState };

        if (newAge !== "" && !isNaN(newAge)) {
          if (
            (prevState.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
              prevState.targetGroup === "TARGET_GROUP_PD") &&
            newAge > 14
          ) {
            setErrors({
              ...errors,
              age: "For this target group, age cannot be greater than 14 years",
            });

            return {
              ...prevState,
              age: "",
              dob: "",
            };
          }

          setErrors({
            ...errors,
            age: "",
          });

          updatedState.age = newAge;

          // If we're not using actual DOB (i.e., age is editable), update the DOB too
          if (!ageDisabled) {
            if (newAge >= 85) {
              setTimeout(() => toggle(), 0);
            }
            updatedState.dob = generateDobFromAge(newAge);
          }

          setTimeout(() => {
            displayRiskAssessment(
              riskAssessment.lastHivTestBasedOnRequest,
              newAge,
              isPMTCTModality
            );
          }, 0);
        } else {
          updatedState.age = "";
        }

        return updatedState;
      });
    }
  };

  const handleTargetGroupChange = (e) => {
    // Clear any errors
    setErrors({ ...temp, [e.target.name]: "" });

    // Get the new target group value
    const newTargetGroup = e.target.value;

    // First, let's get the current age
    const currentAge = objValues.age;

    // Update the target group immediately
    // Important: Use a callback form of setState to ensure we're working with the latest state
    setObjValues((prevState) => {
      let updatedState = { ...prevState, targetGroup: newTargetGroup };

      // If selecting a restricted group and age is over 14, clear the age and DOB
      if (
        (newTargetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
          newTargetGroup === "TARGET_GROUP_PD") &&
        currentAge > 14
      ) {
        // Clear age and DOB instead of adjusting
        updatedState.age = "";
        updatedState.dob = "";

        // Set error in state instead of showing toast
        setErrors({
          ...errors,
          age: "The current age exceeds the limit of 14 for this target group",
        });
      } else if (newTargetGroup === "") {
        // If target group is cleared, also clear age and DOB
        updatedState.age = "";
        updatedState.dob = "";
      } else {
        // For other target groups or valid age, keep existing values

        // If age is not set but DOB is estimated, calculate a default DOB
        // (maintaining your original logic for this case)
        if (!updatedState.age && prevState.isDateOfBirthEstimated) {
          const currentDate = new Date();
          currentDate.setDate(15);
          currentDate.setMonth(5);
          const estDob = moment(currentDate.toISOString());
          // Don't set a specific age since we want the user to enter it
          updatedState.dob = moment(estDob).format("YYYY-MM-DD");
        }

        // Clear any existing age errors if group changes to non-restricted
        setErrors({
          ...errors,
          age: "",
        });
      }

      return updatedState;
    });
  };
  const isAgeValid = validateAgeRestriction(objValues);
  //Get list of DSD Model Type
  function SettingModality(settingId) {
    const setting = settingId;
    axios
      .get(`${baseUrl}application-codesets/v2/${setting}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  }
  //End of Date of Birth and Age handling
  /*****  Validation  */
  const validate = () => {
    //HTS FORM VALIDATION
    let temp = { ...errors };

    temp.visitDate = objValues.visitDate ? "" : "This field is required.";
    temp.entryPoint = objValues.entryPoint ? "" : "This field is required.";
    temp.testingSetting = objValues.testingSetting
      ? ""
      : "This field is required.";

    temp.dob = objValues.dob ? "" : "This field is required.";
    temp.age = objValues.age ? "" : "This field is required.";

    // Check age restriction only if target group and age are provided
    if (
      objValues.targetGroup &&
      objValues.age &&
      (objValues.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
        objValues.targetGroup === "TARGET_GROUP_PD") &&
      objValues.age > 14
    ) {
      temp.age = "For this target group, age cannot be greater than 14 years";
    }

    temp.lastHivTestBasedOnRequest = riskAssessment.lastHivTestBasedOnRequest
      ? ""
      : "This field is required.";

    objValues.age > 15 &&
      (temp.targetGroup = objValues.targetGroup
        ? ""
        : "This field is required.");

    // Remaining validation logic...
    objValues.testingSetting ===
      "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" &&
      (temp.spokeFacility = objValues.spokeFacility
        ? ""
        : "This field is required.");

    showHealthFacility &&
      (temp.healthFacility = objValues.healthFacility
        ? ""
        : "This field is required.");

    //Risk Assement section
    if (
      objValues.age > 15 &&
      riskAssessment.lastHivTestBasedOnRequest === "false" &&
      showRiskAssessment
    ) {
      temp.lastHivTestDone = riskAssessment.lastHivTestDone
        ? ""
        : "This field is required.";
      riskAssessment.lastHivTestDone !== "" &&
        riskAssessment.lastHivTestDone !== "Never" &&
        (temp.whatWasTheResult = riskAssessment.whatWasTheResult
          ? ""
          : "This field is required.");

      temp.lastHivTestVaginalOral = riskAssessment.lastHivTestVaginalOral
        ? ""
        : "This field is required.";

      temp.lastHivTestBloodTransfusion =
        riskAssessment.lastHivTestBloodTransfusion
          ? ""
          : "This field is required.";

      temp.lastHivTestPainfulUrination =
        riskAssessment.lastHivTestPainfulUrination
          ? ""
          : "This field is required.";

      temp.diagnosedWithTb = riskAssessment.diagnosedWithTb
        ? ""
        : "This field is required.";

      temp.lastHivTestInjectedDrugs = riskAssessment.lastHivTestInjectedDrugs
        ? ""
        : "This field is required.";

      temp.lastHivTestHadAnal = riskAssessment.lastHivTestHadAnal
        ? ""
        : "This field is required.";

      temp.lastHivTestForceToHaveSex = riskAssessment.lastHivTestForceToHaveSex
        ? ""
        : "This field is required.";
    }

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  const handleItemClick = (page, completedMenu) => {
    props.handleItemClick(page);
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu]);
    }
  };
  // Getting the number count of riskAssessment True
  const actualRiskCountTrue = Object.values(riskAssessment);
  riskCountQuestion = actualRiskCountTrue.filter((x) => x === "true");

  const handleInputChangeRiskAssessment = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });

    if (e.target.name === "lastHivTestBasedOnRequest") {
      displayRiskAssessment(e.target.value, objValues.age, isPMTCTModality);
      setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });
    }
  };

  const handleInputChangeRiskAssessment2 = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate restricted setting + target group combo
    const isRestrictedSetting =
      objValues.testingSetting &&
      RESTRICTED_SETTINGS.includes(objValues.testingSetting);

    const isMSMSelected = objValues.targetGroup === "TARGET_GROUP_MSM";

    if (isRestrictedSetting && isMSMSelected) {
      toast.error(
        "MSM cannot be selected when ANC, L&D, or Postnatal Ward/Breastfeeding is chosen.",
        {
          position: toast.POSITION.BOTTOM_CENTER,
        }
      );
      return;
    }

    // validate date
    const visitDateError = validateVisitDateWithDOB(
      objValues.dob,
      objValues.visitDate
    );

    if (visitDateError) {
      toast.error(visitDateError, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }
    if (!validate()) {
      // Check specifically if it's an age restriction error
      if (
        (objValues.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
          objValues.targetGroup === "TARGET_GROUP_PD") &&
        objValues.age > 14
      ) {
        toast.dismiss();
        toast.error(
          "Cannot save: For the selected target group, age must not exceed 14 years."
        );
      } else {
        toast.error("Please correct the errors in the form", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
      return;
    }

    // get next form
    let newModality = isPMTCTModality ? "skip" : "fill";

    let latestForm = getNextForm(
      "Risk_Stratification",
      objValues.age,
      newModality,
      "unknown"
    );

    getMenuLogic(objValues);
    props.patientObj.riskStratificationResponseDto = objValues;
    props.patientObj.personResponseDto.dob = objValues.dob;
    props.patientObj.personResponseDto.dateOfBirth = objValues.dob;
    props.patientObj.personResponseDto.isDateOfBirthEstimated =
      objValues.isDateOfBirthEstimated;
    props.patientObj.targetGroup = objValues.targetGroup;
    props.patientObj.testingSetting = objValues.testingSetting;
    props.patientObj.modality = objValues.modality;
    props.patientObj.dateVisit = objValues.visitDate;

    //props.patientObj.riskAssessment =riskAssessment
    objValues.riskAssessment = riskAssessment;

    //Check if riskStratificationResponseDto is null or empty then call the update method
    if (
      props.patientObj.riskStratificationResponseDto &&
      props.patientObj.riskStratificationResponseDto !== null &&
      props.patientObj.riskStratificationResponseDto.id !== ""
    ) {
      if (validate()) {
        setSaving(true);

        props.setHideOtherMenu(false);
        axios
          .put(
            `${baseUrl}risk-stratification/${props.patientObj.riskStratificationResponseDto.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            props.patientObj.riskStratificationResponseDto = response.data;
            objValues.code = response.data.code;
            props.setExtra(objValues);
            handleItemClick(latestForm[0], latestForm[1]);

            toast.success("Risk stratification save succesfully!");
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              toast.error(errorMessage, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            } else {
              toast.error("Something went wrong. Please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    } else {
      //if riskStratificationResponseDto is null then make a new call to save the record
      if (
        (riskCount > 0 || riskCountQuestion.length > 0) &&
        objValues.age > 15
      ) {
        if (validate()) {
          setSaving(true);

          props.setHideOtherMenu(false);
          axios
            .post(`${baseUrl}risk-stratification`, objValues, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setSaving(false);
              props.patientObj.riskStratificationResponseDto = response.data;
              objValues.code = response.data.code;
              props.setExtra(objValues);

              handleItemClick(latestForm[0], latestForm[1]);

              toast.success("Risk stratification save succesfully!");
            })
            .catch((error) => {
              setSaving(false);
              if (error.response && error.response.data) {
                let errorMessage =
                  error.response.data.apierror &&
                  error.response.data.apierror.message !== ""
                    ? error.response.data.apierror.message
                    : "Something went wrong, please try again";
                toast.error(errorMessage, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              } else {
                toast.error("Something went wrong. Please try again...", {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              }
            });
        } else {
          toast.error("All fields are required", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
      } else if (objValues.age < 15) {
        if (validate()) {
          setSaving(true);
          axios
            .post(`${baseUrl}risk-stratification`, objValues, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setSaving(false);
              props.patientObj.riskStratificationResponseDto = response.data;
              objValues.code = response.data.code;
              props.setExtra(objValues);
              handleItemClick(latestForm[0], latestForm[1]);
              //toast.success("Risk stratification save succesfully!");
            })
            .catch((error) => {
              setSaving(false);
              if (error.response && error.response.data) {
                let errorMessage =
                  error.response.data.apierror &&
                  error.response.data.apierror.message !== ""
                    ? error.response.data.apierror.message
                    : "Something went wrong, please try again";
                toast.error(errorMessage, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              } else {
                toast.error("Something went wrong. Please try again...", {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              }
            });
        } else {
          toast.error("All fields are required", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
      } else {
        props.setHideOtherMenu(false);
        props.setExtra(objValues);
        if (validate()) {
          setSaving(true);
          axios
            .post(`${baseUrl}risk-stratification`, objValues, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setSaving(false);
              props.patientObj.riskStratificationResponseDto = response.data;
              objValues.code = response.data.code;
              props.setExtra(objValues);
              toast.success("Risk stratification save succesfully!");
              handleItemClick(latestForm[0], latestForm[1]);
            })
            .catch((error) => {
              setSaving(false);
              if (error.response && error.response.data) {
                let errorMessage =
                  error.response.data.apierror &&
                  error.response.data.apierror.message !== ""
                    ? error.response.data.apierror.message
                    : "Something went wrong, please try again";
                toast.error(errorMessage, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              } else {
                toast.error("Something went wrong. Please try again...", {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              }
            });
        } else {
          toast.error("All fields are required", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
      }
    }
  };

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>RISK STRATIFICATION</h2>
          <br />
          <form>
            <div className="row">
              <div
                className="form-group  col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#992E62",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Modality
              </div>
              <div className="row">
                <div className="form-group  col-md-6">
                  <FormGroup>
                    <Label>
                      Entry Point <span style={{ color: "red" }}> *</span>
                    </Label>
                    <select
                      className="form-control"
                      name="entryPoint"
                      id="entryPoint"
                      value={objValues.entryPoint}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value={""}>Select</option>
                      {entryPoint.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                    {errors.entryPoint !== "" ? (
                      <span className={classes.error}>{errors.entryPoint}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label for="">
                      Visit Date <span style={{ color: "red" }}> *</span>{" "}
                    </Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="visitDate"
                      id="visitDate"
                      value={objValues.visitDate}
                      onChange={handleInputChange}
                      min={
                        props?.personInfo?.personResponseDto?.dateOfRegistration
                      }
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    />
                    {errors.visitDate !== "" ? (
                      <span className={classes.error}>{errors.visitDate}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group  col-md-6">
                  <FormGroup>
                    <Label>
                      Setting <span style={{ color: "red" }}> *</span>
                    </Label>
                    <select
                      className="form-control"
                      name="testingSetting"
                      id="testingSetting"
                      value={objValues.testingSetting}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value={""} key={0}>
                        {" "}
                        Select
                      </option>
                      {entryPointSetting &&
                        entryPointSetting.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                    </select>
                    {errors.testingSetting !== "" ? (
                      <span className={classes.error}>
                        {errors.testingSetting}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                {/*  */}

                {objValues.testingSetting ===
                  "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" && (
                  <div className="form-group  col-md-6">
                    <FormGroup>
                      <Label>
                        Spoke Health Facility{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>

                      {spokeFacList.length > 0 ? (
                        <>
                          {" "}
                          <select
                            className="form-control"
                            name="spokeFacility"
                            id="spokeFacility"
                            value={objValues.spokeFacility}
                            onChange={handleInputChange}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                              textTransform: "capitalize  !important",
                            }}
                          >
                            <option value={""}>Select</option>
                            {spokeFacList.map((value) => (
                              <option key={value.id} value={value.spokeSite}>
                                {value.spokeSite}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <Input
                          type="text"
                          name="spokeFacility"
                          id="spokeFacility"
                          value={objValues.spokeFacility}
                          //value={Math.floor(Math.random() * 1093328)}
                          // onBlur={checkClientCode}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                        />
                      )}
                      {errors.spokeFacility !== "" ? (
                        <span className={classes.error}>
                          {errors.spokeFacility}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}

                {showHealthFacility && (
                  <div className="form-group  col-md-6">
                    <FormGroup>
                      <Label>
                        Health Facility <span style={{ color: "red" }}> *</span>
                      </Label>
                      {spokeFacList.length > 0 ? (
                        <select
                          className="form-control"
                          name="healthFacility"
                          id="healthFacility"
                          value={objValues.healthFacility}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                            textTransform: "capitalize  !important",
                          }}
                        >
                          <option value={""}>Select</option>
                          {spokeFacList.map((value) => (
                            <option key={value.id} value={value.spokeSite}>
                              {value.spokeSite}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type="text"
                          name="healthFacility"
                          id="healthFacility"
                          value={objValues.healthFacility}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                        />
                      )}
                      {errors.healthFacility !== "" ? (
                        <span className={classes.error}>
                          {errors.healthFacility}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
              </div>
              <br />

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Target Group <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="targetGroup"
                    id="targetGroup"
                    onChange={handleInputChange}
                    value={objValues.targetGroup}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}>Select</option>
                    {kP
                      .filter((value) => {
                        if (
                          props.patientAge > 14 &&
                          (value.id === 961 || value.id === 475)
                        ) {
                          return false;
                        }
                        return true;

                        // Check if MSM should be hidden
                        const isRestrictedSetting =
                          objValues.testingSetting &&
                          RESTRICTED_SETTINGS.includes(
                            objValues.testingSetting
                          );

                        if (
                          isRestrictedSetting &&
                          value.code === "TARGET_GROUP_MSM"
                        ) {
                          return false;
                        }

                        return true;
                      })

                      .map((value) => {
                        return (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        );
                      })}
                  </select>
                  {errors.targetGroup !== "" ? (
                    <span className={classes.error}>{errors.targetGroup}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-2 col-md-2">
                <FormGroup>
                  <Label>
                    Date Of Birth <span style={{ color: "red" }}> *</span>
                  </Label>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        value="Actual"
                        name="dateOfBirth"
                        defaultChecked
                        onChange={(e) => handleDateOfBirthChange(e)}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />{" "}
                      Actual
                    </label>
                  </div>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        value="Estimated"
                        name="dateOfBirth"
                        onChange={(e) => handleDateOfBirthChange(e)}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />{" "}
                      Estimated
                    </label>
                  </div>
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <Label>
                    Date <span style={{ color: "red" }}> *</span>
                  </Label>
                  <input
                    className="form-control"
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dob"
                    id="dob"
                    min="1929-12-31"
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    value={objValues.dob}
                    onChange={handleDobChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  />
                  {errors.dob !== "" ? (
                    <span className={classes.error}>{errors.dob}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-3">
                <FormGroup>
                  <Label>
                    Age <span style={{ color: "red" }}> *</span>
                  </Label>
                  <input
                    className="form-control"
                    type="number"
                    name="age"
                    id="age"
                    value={objValues.age}
                    disabled={ageDisabled}
                    onChange={handleAgeChange}
                    // Add max attribute based on target group
                    max={
                      objValues.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP" ||
                      objValues.targetGroup === "TARGET_GROUP_PD"
                        ? 14
                        : undefined
                    }
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  />
                  {errors.age !== "" ? (
                    <span className={classes.error}>{errors.age}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-6">
                <FormGroup>
                  <Label>
                    Is this HIV test based on a Clinician/Doctor/Health Care
                    Provider's request ?{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="lastHivTestBasedOnRequest"
                    id="lastHivTestBasedOnRequest"
                    value={riskAssessment.lastHivTestBasedOnRequest}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.lastHivTestBasedOnRequest !== "" ? (
                    <span className={classes.error}>
                      {errors.lastHivTestBasedOnRequest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <br />

              {showRiskAssessment && (
                <>
                  <div
                    className="form-group  col-md-12 text-center pt-2 mb-4"
                    style={{
                      backgroundColor: "#992E62",
                      width: "125%",
                      height: "35px",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    HIV Risk Assessment (Last 3 months)
                  </div>

                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        When was your last HIV test done?{" "}
                        <span style={{ color: "red" }}> *</span>{" "}
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestDone"
                        id="lastHivTestDone"
                        value={riskAssessment.lastHivTestDone}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="<1"> {"< 1"} month</option>
                        <option value="1-3 Months">1-3 Months</option>
                        <option value="4-6 Months">4-6 Months</option>
                        <option value=">6 Months"> {">6"} Months</option>
                        <option value="Never">Never</option>
                      </select>
                      {errors.lastHivTestDone !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestDone}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  {riskAssessment.lastHivTestDone !== "" &&
                    riskAssessment.lastHivTestDone !== "Never" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            What was the result?{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="whatWasTheResult"
                            id="whatWasTheResult"
                            value={riskAssessment.whatWasTheResult}
                            onChange={handleInputChangeRiskAssessment2}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value={""}></option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                          </select>
                          {errors.whatWasTheResult !== "" ? (
                            <span className={classes.error}>
                              {errors.whatWasTheResult}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you had anal or vaginal
                        or oral sex without a condom with someone who was HIV
                        positive or unaware of their HIV status?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestVaginalOral"
                        id="lastHivTestVaginalOral"
                        value={riskAssessment.lastHivTestVaginalOral}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestVaginalOral !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestVaginalOral}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you had a blood or blood
                        product transfusion?{" "}
                        <span style={{ color: "red" }}> *</span>{" "}
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestBloodTransfusion"
                        id="lastHivTestBloodTransfusion"
                        value={riskAssessment.lastHivTestBloodTransfusion}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestBloodTransfusion !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestBloodTransfusion}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you experienced painful
                        urination, lower abdominal pain, vaginal or penile
                        discharge, pain during sexual intercourse, thick,
                        cloudy, or foul smelling discharge and/or small bumps or
                        blisters near the mouth, penis, vagina, or anal areas?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestPainfulUrination"
                        id="lastHivTestPainfulUrination"
                        value={riskAssessment.lastHivTestPainfulUrination}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestPainfulUrination !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestPainfulUrination}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you been diagnosed with TB or currently have any of
                        the following symptoms : cough, fever, weight loss,
                        night sweats? <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="diagnosedWithTb"
                        id="diagnosedWithTb"
                        value={riskAssessment.diagnosedWithTb}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.diagnosedWithTb !== "" ? (
                        <span className={classes.error}>
                          {errors.diagnosedWithTb}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you ever injected drugs,
                        shared needles or other sharp objects with someone known
                        to be HIV positive or who you didn’t know their HIV
                        status? <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestInjectedDrugs"
                        value={riskAssessment.lastHivTestInjectedDrugs}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestInjectedDrugs !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestInjectedDrugs}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you had anal, oral or
                        vaginal sex in exchange for money or other benefits?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestHadAnal"
                        id="lastHivTestHadAnal"
                        value={riskAssessment.lastHivTestHadAnal}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestHadAnal !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestHadAnal}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Since your last HIV test, have you been forced to have
                        sex? <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestForceToHaveSex"
                        value={riskAssessment.lastHivTestForceToHaveSex}
                        onChange={handleInputChangeRiskAssessment2}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.lastHivTestForceToHaveSex !== "" ? (
                        <span className={classes.error}>
                          {errors.lastHivTestForceToHaveSex}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <br />
                </>
              )}
              <br />
              <Message warning>
                <h4> Risk assessment score </h4>
                <b>
                  Score :
                  {riskCount +
                    (objValues.age > 14 ? riskCountQuestion.length : 0)}
                </b>
              </Message>
              <hr />
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-6">
                  <Button
                    content="Save"
                    type="submit"
                    icon="right arrow"
                    labelPosition="right"
                    style={{ backgroundColor: "#014d88", color: "#fff" }}
                    onClick={handleSubmit}
                    disabled={
                      saving ||
                      !isAgeValid ||
                      ((objValues.targetGroup ===
                        "TARGET_GROUP_CHILDREN_OF_KP" ||
                        objValues.targetGroup === "TARGET_GROUP_PD") &&
                        objValues.age > 14)
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Are you Sure of the Age entered?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BasicInfo;
