import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
//import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { useHistory } from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
//import PhoneInput from 'react-phone-input-2'
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { Label as LabelRibbon, Message } from "semantic-ui-react";
import { getNextForm } from "../../../../utility";
import Cookies from "js-cookie";
import { validateVisitDateWithDOB } from "../../utils";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";

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

const RiskStratification = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [enrollSetting, setEnrollSetting] = useState([]);
  const [entryPoint, setEntryPoint] = useState([]);
  const [entryPointCommunity, setEntryPointCommunity] = useState([]);
  let riskCountQuestion = [];
  const [kP, setKP] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [entryPointSetting, setEntryPointSetting] = useState([]);
  const [spokeFacList, setSpokeFacList] = useState([]);

  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [setting, setSetting] = useState([]);
  const [riskCount, setRiskCount] = useState(0);
  const [showHealthFacility, setShowHealthFacility] = useState(false);
  const [disableInput, setDisableInput] = useState(false);

  const [objValues, setObjValues] = useState({
    age: props.patientAge,
    dob: props.patientObj.dateOfBirth
      ? props.patientObj.dateOfBirth
      : props?.personInfo?.personResponseDto?.dateOfBirth,
    visitDate: "",
    dateOfBirth: props.patientObj.dateOfBirth
      ? props.patientObj.dateOfBirth
      : props?.personInfo?.personResponseDto?.dateOfBirth,
    dateOfRegistration: "", //props.patientObj.dateOfRegistration,
    isDateOfBirthEstimated: "", //props.patientObj.personResponseDto.isDateOfBirthEstimated
    targetGroup: "",
    testingSetting: "", //
    modality: "", //
    code: "",
    id: "",
    personId: props.patientObj.id,
    riskAssessment: {},
    entryPoint: "",
    careProvider: "",
    communityEntryPoint: "",
    spokeFacility: "",
    healthFacility: "",
  });

  const [codesets, setCodsets] = useState({})

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
  const [isPMTCTModality, setIsPMTCTModality] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  const retestingInfo = () => {
    if (props.newHTSType === "RETESTING") {
      setObjValues({
        ...objValues,
        entryPoint: "HTS_ENTRY_POINT_FACILITY",
        testingSetting: "FACILITY_HTS_TEST_SETTING_RETESTING",
      });
      setDisableInput(true);
    }
  };

  useEffect(() => {
    KP();
    setEnrollSetting(codesets?.["FACILITY_HTS_TEST_SETTING"])

    if (props?.patientObj?.riskStratificationResponseDto !== null) {
      if (props?.activePage?.activeObject?.riskStratificationResponseDto?.entryPoint === "HTS_ENTRY_POINT_COMMUNITY") {
        setEnrollSetting(codesets["COMMUNITY_HTS_TEST_SETTING"])
      } else if (props?.activePage?.activeObject?.riskStratificationResponseDto?.entryPoint === "HTS_ENTRY_POINT_FACILITY") {
        setEnrollSetting(codesets["FACILITY_HTS_TEST_SETTING"])
      }
      setObjValues(props?.patientObj?.riskStratificationResponseDto);
      

      setRiskAssessment(
        props.patientObj.riskStratificationResponseDto &&
        props.patientObj.riskStratificationResponseDto.riskAssessment
      );
    }
  }, [props.patientObj, codesets]);


  useEffect(() => {
    retestingInfo();
  }, [entryPointSetting, entryPoint, props.newHTSType]);


  

  const getSpokeFaclityByHubSite = () => {
    let facility = Cookies.get("facilityName");
    axios
      .get(`${baseUrl}hts/spoke-site?hubSite=${facility}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSpokeFacList(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };




  //Get list of KP
  const KP = () => {

    if (props.patientObject.gender) {
      let kpList = []
      let gender = props.patientObject.gender.toLowerCase()
      if (gender === "female") {
        codesets?.["TARGET_GROUP"]?.map?.((each, index) => {
          if (each.code !== "TARGET_GROUP_MSM") {
            kpList.push(each)
          }
        })

      } else if (gender === "male") {
        codesets?.["TARGET_GROUP"]?.map?.((each, index) => {
          if (each.code !== "TARGET_GROUP_FSW") {
            kpList.push(each)
          }

        })
      }
      setKP(kpList)
    } else {
      setKP(codesets["TARGET_GROUP"]);

    }
  };

  const getMenuLogic = () => {
    //secound logic
    props.setHideOtherMenu(false);
  };

  const checkPMTCTModality = (modality) => {
    if (
      modality === "FACILITY_HTS_TEST_SETTING_ANC" ||
      modality === "FACILITY_HTS_TEST_SETTING_L&D" ||
      modality === "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING"
    ) {
      setIsPMTCTModality(true);

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
    setErrors({ ...temp, [e.target.name]: "" });

    if (e.target.name === "targetGroup") {
      const isRestrictedSetting =
        objValues.testingSetting &&
        RESTRICTED_SETTINGS.includes(objValues.testingSetting);

      if (e.target.value === "TARGET_GROUP_MSM" && isRestrictedSetting) {
        toast.error(
          "MSM cannot be selected when ANC, L&D, or Postnatal Ward/Breastfeeding is chosen.",
          {
            position: toast.POSITION.BOTTOM_CENTER,
          }
        );
        return;
      }
    }

    setErrors({ ...temp, [e.target.name]: "" });

    if (e.target.name === "testingSetting" && e.target.value !== "") {
      setErrors({ ...temp, spokeFacility: "", healthFacility: "" });

      setObjValues({ ...objValues, [e.target.name]: e.target.value });
      let ans = checkPMTCTModality(e.target.value);
      displayRiskAssessment(
        riskAssessment.lastHivTestBasedOnRequest,
        objValues.age,
        ans
      );
      if (
        e.target.value ===
        "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
      ) {
        setShowHealthFacility(true);
      } else {
        setShowHealthFacility(false);
      }

      //get spoke sites
      if (
        e.target.value === "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" ||
        e.target.value ===
        "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
      ) {
        getSpokeFaclityByHubSite();
      }

      //set risk count
      if (
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_STANDALONE_HTS" ||
        e.target.value === "FACILITY_HTS_TEST_SETTING_STANDALONE_HTS"
      ) {
        setRiskCount(1);
      } else if (
        e.target.value === "COMMUNITY_HTS_TEST_SETTING_CT" ||
        e.target.value === "FACILITY_HTS_TEST_SETTING_CT"
      ) {
        setRiskCount(1);
      } else if (e.target.value === "FACILITY_HTS_TEST_SETTING_TB") {
        setRiskCount(1);
      } else if (e.target.value === "FACILITY_HTS_TEST_SETTING_STI") {
        setRiskCount(1);
      } else if (e.target.value === "COMMUNITY_HTS_TEST_SETTING_OUTREACH") {
        setRiskCount(1);
      } else {
        setRiskCount(0);
      }
    }

    if (e.target.name === "entryPoint") {
      if (e.target.value === "HTS_ENTRY_POINT_COMMUNITY") {
        setEnrollSetting(codesets["COMMUNITY_HTS_TEST_SETTING"])
      } else if (e.target.value === "HTS_ENTRY_POINT_FACILITY") {
        setEnrollSetting(codesets["FACILITY_HTS_TEST_SETTING"])
      } else {
        setEntryPointSetting([]);
      }
    }

    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const displayRiskAssessment = (lastVisit, age, isPMTCTModalityValue) => {
    let SecAge = age !== "" ? age : 0;
    let ans;


    if (lastVisit === "false") {
      if (SecAge < 15 || isPMTCTModalityValue) {
        setShowRiskAssessment(false);
        ans = false;

        //
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

        //
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

  

  //End of Date of Birth and Age handling
  /*****  Validation  */
  const validate = () => {
    //HTS FORM VALIDATION
    temp.dateVisit = objValues.visitDate ? "" : "This field is required.";

    const minVisitDate = getMinVisitDateForRetesting(
      props.personInfo,
      props.newHTSType
    );

    if (minVisitDate && objValues.visitDate) {
      const selectedDate = new Date(objValues.visitDate);
      const requiredMinDate = new Date(minVisitDate);

      if (selectedDate < requiredMinDate) {
        temp.dateVisit = `For retesting after ANC, visit date must be at least 28 days after the last visit (${minVisitDate})`;
      }
    }

    temp.entryPoint = objValues.entryPoint ? "" : "This field is required.";
    temp.testingSetting = objValues.testingSetting
      ? ""
      : "This field is required.";

    temp.lastHivTestBasedOnRequest = riskAssessment.lastHivTestBasedOnRequest
      ? ""
      : "This field is required.";

    props.patientAge > 15 &&
      (temp.targetGroup = objValues.targetGroup
        ? ""
        : "This field is required.");

    objValues.testingSetting ===
      "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" &&
      (temp.spokeFacility = objValues.spokeFacility
        ? ""
        : "This field is required.");

    showHealthFacility &&
      (temp.healthFacility = objValues.healthFacility
        ? ""
        : "This field is required.");
    //

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
    //targetGroup
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

  // Function to get the minimum allowable visit date (28 days after last ANC visit)
  const getMinVisitDateForRetesting = (personInfo, newHTSType) => {
    // Check if this is a retesting case
    if (newHTSType !== "RETESTING") {
      return null;
    }

    // Find if any previous visit was an ANC testing setting
    const hasANCVisit = personInfo?.htsClientDtoList?.some(
      (client) =>
        client?.riskStratificationResponseDto?.testingSetting ===
        "FACILITY_HTS_TEST_SETTING_ANC"
    );

    if (!hasANCVisit) {
      return null; // No ANC visit found, so no special validation
    }

    // Find the most recent visit date across all records
    let mostRecentVisitDate = null;

    personInfo?.htsClientDtoList?.forEach((client) => {
      const visitDate = client?.riskStratificationResponseDto?.visitDate;

      if (visitDate) {
        const currentDate = new Date(visitDate);

        if (
          !mostRecentVisitDate ||
          currentDate > new Date(mostRecentVisitDate)
        ) {
          mostRecentVisitDate = visitDate;
        }
      }
    });

    if (!mostRecentVisitDate) {
      return null;
    }

    // Calculate the date 28 days after the most recent visit
    const nextEligibleDate = new Date(mostRecentVisitDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 28);

    return moment(nextEligibleDate).format("YYYY-MM-DD");
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if testingSetting is restricted
    const isRestrictedSetting =
      objValues.testingSetting &&
      RESTRICTED_SETTINGS.includes(objValues.testingSetting);

    // Check if targetGroup is MSM
    const isMSMSelected = objValues.targetGroup === "TARGET_GROUP_MSM";
    // Block submission if restricted setting + MSM
    if (isRestrictedSetting && isMSMSelected) {
      toast.error(
        "MSM cannot be selected when ANC, L&D, or Postnatal Ward/Breastfeeding is chosen.",
        {
          position: toast.POSITION.BOTTOM_CENTER,
        }
      );
      return;
    }
    const visitDateError = validateVisitDateWithDOB(
      props.personInfo?.personResponseDto?.dateOfBirth,
      objValues.visitDate
    );

    if (visitDateError) {
      toast.error(visitDateError, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }

    const isValid = validate();

    if (!isValid) {
      toast.error("Please correct the errors before submitting", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }

    getMenuLogic();
    let newModality = isPMTCTModality ? "skip" : "fill";

    let latestForm = getNextForm(
      "Risk_Stratification",
      objValues.age,
      newModality,
      "unknown"
    );

    props.patientObj.targetGroup = objValues.targetGroup;
    props.patientObj.testingSetting = objValues.testingSetting;
    props.patientObj.dateVisit = objValues.visitDate;
    props.patientObj.modality = objValues.modality;
    props.patientObj.riskStratificationResponseDto = objValues;
    objValues.riskAssessment = riskAssessment;

    setSaving(true);

    try {
      let response;

      if (
        (props.patientObj.riskStratificationResponseDto &&
          props.patientObj.riskStratificationResponseDto !== null &&
          props.patientObj.personId !== "") ||
        props.patientObj.riskStratificationResponseDto.code !== ""
      ) {
        response = await axios.put(
          `${baseUrl}risk-stratification/${props.patientObj.riskStratificationResponseDto.id}`,
          objValues,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${baseUrl}risk-stratification`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setSaving(false);
      props.patientObj.riskStratificationResponseDto = response.data;
      objValues.code = response.data.code;
      props.setExtra(objValues);
      props.setHideOtherMenu(false);
      handleItemClick(latestForm[0], latestForm[1]);
      toast.success("Risk stratification saved successfully!");
    } catch (error) {
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
    }
  };


  const loadCodesets = (data) => {
    setCodsets(data)
    setEnrollSetting(data["TEST_SETTING"])
    setEntryPoint(data["HTS_ENTRY_POINT"])
    setEntryPointSetting(data["FACILITY_HTS_TEST_SETTING"])

  }

  useGetCodesets({
    codesetsKeys: ["COMMUNITY_HTS_TEST_SETTING",
      "TARGET_GROUP",
      "HTS_ENTRY_POINT",
      "FACILITY_HTS_TEST_SETTING",
      "TEST_SETTING",
    ],
    patientId: props.personInfo?.personId,
    onSuccess: loadCodesets
  })


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
                      disabled={disableInput}
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
                {/* {objValues.entryPoint === "HTS_ENTRY_POINT_COMMUNITY" && (
                  <div className="form-group  col-md-6">
                    <FormGroup>
                      <Label>
                        Community Entry Point{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="communityEntryPoint"
                        id="communityEntryPoint"
                        value={objValues.communityEntryPoint}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}>Select</option>
                        {entryPointCommunity.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                      {errors.communityEntryPoint !== "" ? (
                        <span className={classes.error}>
                          {errors.communityEntryPoint}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )} */}
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
                        getMinVisitDateForRetesting(
                          props.personInfo,
                          props.newHTSType
                        ) ||
                        props?.personInfo?.personResponseDto?.dateOfRegistration
                      }
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    />
                    {errors.dateVisit !== "" ? (
                      <span className={classes.error}>{errors.dateVisit}</span>
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
                      disabled={disableInput}
                    >
                      {/* <option value={""}>Select</option>
                      {entryPointSetting &&
                        entryPointSetting.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
             */}

                      <option value="">Select</option>
                      {entryPointSetting &&
                        entryPointSetting
                          .filter((setting) => {
                            // Only filter if gender is Male
                            if (
                              props.personInfo?.personResponseDto?.sex ===
                              "Male"
                            ) {
                              return !RESTRICTED_SETTINGS.includes(
                                setting.code
                              );
                            }
                            return true; // Show all if Female or unknown
                          })
                          .map((value) => (
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
                          //value={Math.floor(Math.random() * 1093328)}
                          // onBlur={checkClientCode}
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
                <div className="form-group col-md-6">
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
                      <span className={classes.error}>
                        {errors.targetGroup}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              </div>
              <br />
              <div className="row">
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
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestDone"
                        id="lastHivTestDone"
                        value={riskAssessment.lastHivTestDone}
                        onChange={handleInputChangeRiskAssessment}
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
                        <option value="Never"> Never</option>
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
                            onChange={handleInputChangeRiskAssessment}
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
                        onChange={handleInputChangeRiskAssessment}
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
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestBloodTransfusion"
                        id="lastHivTestBloodTransfusion"
                        value={riskAssessment.lastHivTestBloodTransfusion}
                        onChange={handleInputChangeRiskAssessment}
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
                        onChange={handleInputChangeRiskAssessment}
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
                        onChange={handleInputChangeRiskAssessment}
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
                        id="sexUnderInfluence"
                        value={riskAssessment.lastHivTestInjectedDrugs}
                        onChange={handleInputChangeRiskAssessment}
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
                        vaginal sex in exchange for money or other benefits?
                        <span style={{ color: "red" }}> *</span>{" "}
                      </Label>
                      <select
                        className="form-control"
                        name="lastHivTestHadAnal"
                        id="lastHivTestHadAnal"
                        value={riskAssessment.lastHivTestHadAnal}
                        onChange={handleInputChangeRiskAssessment}
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
                        id="moreThanOneSexPartnerLastThreeMonths"
                        value={riskAssessment.lastHivTestForceToHaveSex}
                        onChange={handleInputChangeRiskAssessment}
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
                <h4> Risk assessment score 1</h4>
                <b>
                  Score :
                  {riskCount +
                    (props.patientAge > 14 ? riskCountQuestion.length : 0)}
                </b>
              </Message>
              <hr />
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-6">
                  <Button
                    content="Save "
                    type="submit"
                    icon="right arrow"
                    labelPosition="right"
                    style={{ backgroundColor: "#014d88", color: "#fff" }}
                    onClick={handleSubmit}
                    disabled={saving}
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

export default RiskStratification;
