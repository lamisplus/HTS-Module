import React, { useEffect, useState } from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Modal } from "react-bootstrap";
import { getCheckModality } from "../../../../utility";
import { getNextForm } from "../../../../utility";
import { error } from "highcharts";
import Cookies from "js-cookie";
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
// THIS IS THE CREATE FORM
const BasicInfo = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  //const [hideNumChild, setHideNumChild] = useState(false);
  const [kP, setKP] = useState([]);
  const [enrollSetting, setEnrollSetting] = useState([]);
  const [sourceReferral, setSourceReferral] = useState([]);
  const [gender, setGender] = useState([]);
  const [counselingType, setCounselingType] = useState([]);
  const [pregnancyStatus, setPregnancyStatus] = useState([]);
  const [indexTesting, setIndexTesting] = useState([]);
  let temp = { ...errors };
  const [disableVitals, setDisableVitals] = useState(false);

  const [clientCodeetail, setclientCodeetail] = useState("");
  const [clientCodeetail2, setclientCodeetail2] = useState("");
  const [clientCodeCheck, setClientCodeCheck] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  const [facilityCode, setFacilityCode] = useState("");
  const [serialNumber, setSerialNumber] = useState(null);
  // const [disableModality, setDisableModality] = useState(props.extra.testingSetting === "FACILITY_HTS_TEST_SETTING_ANC" ? true: false);
  const [codesets, setCodsets] = useState({})
  const [modalityCheck, setModality] = useState("");
  const [showPregancy, setShowPregnancy] = useState(false);

  const [objValues, setObjValues] = useState({
    active: true,
    personId: props.patientObj.personId,
    clientCode:
      props.patientObj && props.patientObj.clientCode
        ? props.patientObj.clientCode
        : "",
    breastFeeding:
      props.patientObj && props.patientObj.breastFeeding
        ? props.patientObj.breastFeeding
        : "",
    dateVisit:
      props.patientObj && props.patientObj.dateVisit
        ? props.patientObj.dateVisit
        : "",
    firstTimeVisit: props?.patientObj?.firstTimeVisit,
    indexClient: props?.patientObj?.indexClient,
    numChildren:
      props.patientObj && props.patientObj.numChildren
        ? props.patientObj.numChildren
        : "",
    numWives:
      props.patientObj && props.patientObj.numWives
        ? props.patientObj.numWives
        : "",
    pregnant:
      props.patientObj && props.patientObj.pregnant
        ? props.patientObj.pregnant
        : "",
    previouslyTested: props?.patientObj?.previouslyTested,
    referredFrom: props.patientObj ? props.patientObj.referredFrom : "",
    riskAssessment:
      props.patientObj && props.patientObj.riskAssessment
        ? props.patientObj.riskAssessment
        : {},
    riskStratificationCode:
      props.extra && props.extra.code !== "" ? props.extra.code : "",
    targetGroup:
      props.patientObj && props.patientObj.targetGroup
        ? props.patientObj.targetGroup
        : "",
    testingSetting: props.patientObj ? props.patientObj.testingSetting : "",
    typeCounseling: props.patientObj ? props.patientObj.typeCounseling : "",
    relationWithIndexClient: props.patientObj
      ? props.patientObj.relationWithIndexClient
      : "",
    indexClientCode: "",
    comment: props?.patientObj?.comment,
    partnerNotificationService: "",
    familyIndex: "",
  });


  const CreateClientCode = () => {
    let facilityShortCode = "";
    axios
      .get(`${baseUrl}hts/get-facility-code`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFacilityCode(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    let visitDate = new Date(props.patientObj.dateVisit);

    let setting = props.patientObj.testingSetting;
    let settingCode = "";
    if (setting?.includes("SETTING_STI")) {
      settingCode = "STI";
    } else if (setting?.includes("EMERGENCY")) {
      settingCode = "EME";
    } else if (setting?.includes("SETTING_INDEX")) {
      settingCode = "IND";
    } else if (setting?.includes("INPATIENT")) {
      settingCode = "INP";
    } else if (setting?.includes("PMTCT")) {
      settingCode = "PMTCT";
    } else if (setting?.includes("TB")) {
      settingCode = "TB";
    } else if (setting?.includes("VCT")) {
      settingCode = "VCT";
    } else if (setting?.includes("MOBILE")) {
      settingCode = "MOB";
    } else if (setting?.includes("SETTING_SNS")) {
      settingCode = "SNS";
    } else if (setting?.includes("OTHER")) {
      settingCode = "OTH";
    } else if (setting?.includes("SETTING_ANC")) {
      settingCode = "ANC";
    } else if (setting?.includes("RETESTING")) {
      settingCode = "RET";
    } else if (setting?.includes("SETTING_L&D")) {
      settingCode = "L&D";
    } else if (setting?.includes("POST_NATAL_WARD_BREASTFEEDING")) {
      settingCode = "PNWB";
    } else if (setting?.includes("NPATIENT")) {
      settingCode = "INP";
    } else if (setting?.includes("SETTING_CT")) {
      settingCode = "CT";
    } else if (setting?.includes("SETTING_FP")) {
      settingCode = "FP";
    } else if (setting?.includes("BLOOD_BANK")) {
      settingCode = "BB";
    } else if (setting?.includes("PEDIATRIC")) {
      settingCode = "PED";
    } else if (setting?.includes("MALNUTRITION")) {
      settingCode = "Mal";
    } else if (setting?.includes("PREP_TESTING")) {
      settingCode = "PrEPT";
    } else if (setting?.includes("SPOKE_HEALTH_FACILITY")) {
      settingCode = "SPHF";
    } else if (setting?.includes("STANDALONE")) {
      settingCode = "STAN";
    } else if (setting?.includes("CONGREGATIONAL")) {
      settingCode = "CON";
    } else if (setting?.includes("DELIVERY_HOMES")) {
      settingCode = "DEL";
    } else if (setting?.includes("TBA_ORTHODOX")) {
      settingCode = "TBAO";
    } else if (setting?.includes("TBA_RT-HCW")) {
      settingCode = "TBAH";
    } else if (setting?.includes("SETTING_OVC")) {
      settingCode = "OVC";
    } else if (setting?.includes("OUTREACH")) {
      settingCode = "OUT";
    }

    let month = visitDate.getMonth();
    let year = visitDate.getFullYear();
    let generatedCode =
      "C" + facilityCode + "/" + settingCode + "/" + month + "/" + year + "/";
    setCreatedCode(generatedCode);
    if (!props.patientObj.id) {
      setObjValues({ ...objValues, clientCode: generatedCode });
    } else {
      setSerialNumber(Cookies.get("serial-number"));
      setDisableVitals(true);
    }
  };

  const getSettingList=()=>{

    if(props.patientObj.riskStratificationResponseDto.entryPoint.toLowerCase() === "community" || "hts_entry_point_community"){
      setEnrollSetting(codesets["COMMUNITY_HTS_TEST_SETTING"])
    }else if(props.patientObj.riskStratificationResponseDto.entryPoint.toLowerCase()  === "facility"|| "hts_entry_point_facility"){

      
      setEnrollSetting(codesets["FACILITY_HTS_TEST_SETTING"])
    }else{
      setEnrollSetting([]);

    }

    setModality(
      getCheckModality(
        props?.patientObj?.riskStratificationResponseDto?.testingSetting
      )
    );
  }

  useEffect(() => {
    CreateClientCode();
    getSettingList();
  }, [props.patientObj, facilityCode]);

  const handleSubmitCheckOut = () => {
    if (
      props.patientObject.visitId !== null &&
      props.patientObject.status === "PENDING"
    ) {
      axios
        .put(
          `${baseUrl}patient/visit/checkout/${props.patientObject.visitId}`,
          props.patientObject.visitId,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };



  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "indexClientCode" && e.target.value !== "") {
      async function getIndexClientCode() {
        const indexClientCode = e.target.value;
        const response = await axios.get(
          `${baseUrl}hts/client/${indexClientCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data !== "Record Not Found") {
          setclientCodeetail2("");
          setclientCodeetail(response.data);
        } else {
          setclientCodeetail("");
          setclientCodeetail2(response.data);
        }
      }
      getIndexClientCode();
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name === "serialNumber") {
      setSerialNumber(e.target.value);
      checkClientCode(e);
    } else if (e.target.name === "indexClient") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        relationWithIndexClient: "",
        indexClientCode: "",
      });

      setErrors({
        ...errors,
        relationWithIndexClient: "",
        indexClientCode: "",
      });
    } else if (e.target.name === "numChildren") {
      if (e.target.value >= 0) {
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      } else {
        setObjValues({
          ...objValues,
          [e.target.name]: 0,
        });
      }
    } else if (e.target.name === "numWives") {
      if (e.target.value >= 0) {
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      } else {
        setObjValues({
          ...objValues,
          [e.target.name]: 0,
        });
      }
    } else {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
  };

  /*****  Validation  */
  const validate = () => {
    
    temp.clientCode = objValues.clientCode ? "" : "This field is required.";
    temp.typeCounseling = objValues.typeCounseling
      ? ""
      : "This field is required.";
    temp.testingSetting = objValues.testingSetting
      ? ""
      : "This field is required.";
    temp.targetGroup = objValues.targetGroup ? "" : "This field is required.";
    temp.referredFrom = objValues.referredFrom ? "" : "This field is required.";
    temp.previouslyTested =
      objValues.previouslyTested !== "" ? "" : "This field is required.";
    temp.indexClient =
      objValues.indexClient !== "" ? "" : "This field is required.";
    temp.firstTimeVisit =
      objValues.firstTimeVisit !== "" ? "" : "This field is required.";
    temp.dateVisit = objValues.dateVisit ? "" : "This field is required.";

    props?.patientObject?.gender &&
      props?.patientObject?.gender.toLowerCase() === "female" &&
      (temp.pregnant =
        objValues.pregnant !== "" ? "" : "This field is required.");

    objValues.indexClient === "true" &&
      (temp.relationWithIndexClient =
        objValues.relationWithIndexClient !== ""
          ? ""
          : "This field is required.");

    objValues.indexClient === "true" &&
      (temp.indexClientCode =
        objValues.indexClientCode !== "" ? "" : "This field is required.");

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
  
  const checkClientCode = (e) => {
    let code = "";

    if (e.target.name === "serialNumber") {
      //
      code = createdCode + e.target.value;

      setObjValues({ ...objValues, clientCode: code });
    }

    async function getIndexClientCode() {
      const response = await axios.get(
        `${baseUrl}hts/get-client-code?code=${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
        }
      );
      if (response.data === "Client code already exist") {
        // setErrors({...errors,clientCode: "Client code already exist" })
        setClientCodeCheck("Client code already exist");
      } else {
        setClientCodeCheck("");
      }
    }

    getIndexClientCode();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // check next form
    let latestForm = getNextForm(
      "Client_intake_form",
      props.patientAge,
      modalityCheck,
      "unknown"
    );

    const patientForm = {
      clientCode: objValues.clientCode,
      dateVisit: objValues.dateVisit,
      extra: {},
      firstTimeVisit: objValues.firstTimeVisit,
      indexClient: objValues.indexClient,
      numChildren: objValues.numChildren,
      numWives: objValues.numWives,
      personId: props?.patientObject?.personId
        ? props?.patientObject?.personId
        : props?.patientObject?.id,
      hospitalNumber: objValues.clientCode,
      previouslyTested: objValues.previouslyTested,
      referredFrom: objValues.referredFrom,
      targetGroup: objValues.targetGroup,
      testingSetting: objValues.testingSetting,
      typeCounseling: objValues.typeCounseling,
      breastFeeding: objValues.breastFeeding,
      pregnant: objValues.pregnant,
      indexClientCode: objValues.indexClientCode,
      relationWithIndexClient: objValues.relationWithIndexClient,
      riskStratificationCode:
        props.extra && props.extra.code !== "" ? props.extra.code : "",
      comment: objValues.comment,
      partnerNotificationService: objValues.partnerNotificationService,
      familyIndex: objValues.familyIndex,
    };

    props.setPatientObj({ ...props.patientObj, ...objValues });
    Cookies.set("serial-number", serialNumber);

    if (validate() && clientCodeCheck === "") {
      setSaving(true);

      if (props.patientObj.id && props.completed.includes("basic")) {
        patientForm.id = props?.patientObj?.id;
        patientForm.personId = props?.patientObj?.personId;

        axios
          .put(`${baseUrl}hts/${props.patientObj.id}`, patientForm, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            let obj = {
              uuid: "",
              type: "",
              clientCode: "",
            };
            localStorage.setItem("index", JSON.stringify(obj));

            props.setPatientObj(response.data);
            props.setBasicInfo(response.data);
            toast.success("Form submitted successfully");

            handleItemClick(latestForm[0], latestForm[1]);
          })
          .catch((error) => {
            setSaving(false);
            console.log(error);
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
        axios
          .post(`${baseUrl}hts`, patientForm, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (props.checkedInPatient) {
              handleSubmitCheckOut();
            }

            setSaving(false);
            props.setPatientObj(response.data);
            if (response.data && response.data.htsClientUUid) {
              localStorage.setItem(
                "htsClientUUid",
                JSON.stringify(response.data.htsClientUUid)
              );
            }
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
      }
    } else {
      toast.error("All fields are required", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  const testingSetting = objValues.testingSetting;

  useEffect(() => {
    const shouldAutoFill =
      testingSetting === "FACILITY_HTS_TEST_SETTING_ANC" ||
      testingSetting === "FACILITY_HTS_TEST_SETTING_L&D";

    if (shouldAutoFill && objValues.pregnant !== "73") {
      setObjValues((prev) => ({
        ...prev,
        pregnant: "73",
      }));
    }
  }, [testingSetting]);

  const loadCodesets = (data) => {
    setCodsets(data)
    setKP(data["TARGET_GROUP"])
    setIndexTesting(data["INDEX_TESTING"])
    setPregnancyStatus(data["PREGNANCY_STATUS"])
    setCounselingType(data["COUNSELING_TYPE"])
    setSourceReferral(data["SOURCE_REFERRAL"])
    setGender(data["GENDER"])
    setEnrollSetting(["TEST_SETTING"])

    if (props.patientObj.riskStratificationResponseDto.entryPoint.toLowerCase() === "community" || "hts_entry_point_community") {
      setEnrollSetting(data["COMMUNITY_HTS_TEST_SETTING"])
    } else if (props.patientObj.riskStratificationResponseDto.entryPoint.toLowerCase() === "facility" || "hts_entry_point_facility") {
    
      setEnrollSetting(data["FACILITY_HTS_TEST_SETTING"])
    } else {
      setEnrollSetting([]);

    }

  }

  useGetCodesets({
    codesetsKeys: [
      "TARGET_GROUP",
      "INDEX_TESTING",
      "PREGNANCY_STATUS",
      "COMMUNITY_HTS_TEST_SETTING",
      "FACILITY_HTS_TEST_SETTING",
      "COUNSELING_TYPE",
      "SOURCE_REFERRAL",
      "GENDER",
      "TEST_SETTING", 

    ],
    patientId: props.patientObj?.id,
    onSuccess: loadCodesets
  })

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>CLIENT INTAKE FORM </h2>
          <br />
          <form>
            <div className="row">
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
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">
                    Serial Number <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="serialNumber"
                    id="serialNumber"
                    value={serialNumber}
                    //value={Math.floor(Math.random() * 1093328)}
                    // onBlur={checkClientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disableVitals}
                  />
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">
                    Client Code <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="clientCode"
                    id="clientCode"
                    // value={createdCode + (serialNumber ? serialNumber : "")}
                    value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    readOnly
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                  {clientCodeCheck !== "" ? (
                    <span className={classes.error}> {clientCodeCheck}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Referred From <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="referredFrom"
                    id="referredFrom"
                    onChange={handleInputChange}
                    value={objValues.referredFrom}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    {sourceReferral.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.referredFrom !== "" ? (
                    <span className={classes.error}>{errors.referredFrom}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
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
                    <option value={""}></option>
                    {enrollSetting.map((value) => (
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
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">
                    Visit Date <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateVisit"
                    id="dateVisit"
                    value={objValues.dateVisit}
                    onChange={handleInputChange}
                    min={objValues.dateOfRegistration}
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

              {/* {(objValues.targetGroup!=='457' && objValues.targetGroup!=="") && (
                            <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Gender</Label>
                                <select
                                    className="form-control"
                                    name="genderId"
                                    id="genderId"
                                    value={objValues.genderId}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                >
                                    <option value={""}></option>
                                    {gender.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                                </select>
                               
                            </FormGroup>
                            </div>
                            )} */}

              {props.patientAge > 9 && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>Number of Children {"<5"} years</Label>
                    <Input
                      type="number"
                      name="numChildren"
                      id="numChildren"
                      min={0}
                      value={objValues.numChildren}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    />
                  </FormGroup>
                </div>
              )}
              {props?.patientAge > 9 &&
                props?.patientObject?.gender &&
                props?.patientObject?.gender.toLowerCase() === "male" && (
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>Number of wives/co-wives</Label>
                      <Input
                        type="number"
                        name="numWives"
                        id="numWives"
                        min={0}
                        value={objValues.numWives}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                )}
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Index Testing <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="indexClient"
                    id="indexClient"
                    value={objValues.indexClient}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">YES</option>
                    <option value="false">NO</option>
                  </select>
                  {errors.indexClient !== "" ? (
                    <span className={classes.error}>{errors.indexClient}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.indexClient === "true" && (
                <>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Relationship of the index client{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="relationWithIndexClient"
                        id="relationWithIndexClient"
                        value={objValues.relationWithIndexClient}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {indexTesting.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                      {errors.relationWithIndexClient !== "" ? (
                        <span className={classes.error}>
                          {errors.relationWithIndexClient}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Index Client Code/ID{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="indexClientCode"
                        id="indexClientCode"
                        value={objValues.indexClientCode}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                      {/* {clientCodeCheck !== "" ? (
                        <span className={classes.error}>{clientCodeCheck}</span>
                      ) : (
                        ""
                      )} */}
                      {errors.indexClientCode !== "" ? (
                        <span className={classes.error}>
                          {errors.indexClientCode}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
              {props?.patientObject?.gender &&
                props?.patientObject?.gender.toLowerCase() === "female" && (
                  <>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Pregnant Status{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="pregnant"
                          id="pregnant"
                          value={objValues.pregnant}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={
                            testingSetting ===
                              "FACILITY_HTS_TEST_SETTING_ANC" ||
                            testingSetting === "FACILITY_HTS_TEST_SETTING_L&D"
                          }
                        >
                          <option value={""}></option>
                          {pregnancyStatus.map((value) => {
                            return (
                              <option key={value.id} value={value.id}>
                                {value.display}
                              </option>
                            );
                          })}
                        </select>
                        {errors.pregnant !== "" ? (
                          <span className={classes.error}>
                            {errors.pregnant}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* objValues.pregnant === "" && (objValues.pregnant!== 73 || objValues.pregnant!== '73') && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Breast Feeding</Label>
                                    <select
                                        className="form-control"
                                        name="breastFeeding"
                                        id="breastFeeding"
                                        value={objValues.breastFeeding}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">YES</option>
                                        <option value="false">NO</option>
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )*/}
                  </>
                )}

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    First time visit <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="firstTimeVisit"
                    id="firstTimeVisit"
                    value={objValues.firstTimeVisit}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">YES</option>
                    <option value="false">NO</option>
                  </select>
                  {errors.firstTimeVisit !== "" ? (
                    <span className={classes.error}>
                      {errors.firstTimeVisit}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Previously tested within the last 3 months{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="previouslyTested"
                    id="previouslyTested"
                    value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">YES</option>
                    <option value="false">NO</option>
                  </select>
                  {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Type of Counseling <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="typeCounseling"
                    id="typeCounseling"
                    value={objValues.typeCounseling}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    {counselingType.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.typeCounseling !== "" ? (
                    <span className={classes.error}>
                      {errors.typeCounseling}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-12">
                <FormGroup>
                  <Label for="firstName">
                    Comments
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </Label>
                  <Input
                    className="form-control"
                    type="textarea"
                    rows="4"
                    cols="7"
                    name="comment"
                    id="comment"
                    value={objValues.comment}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      height: "100px",
                    }}
                  />
                </FormGroup>
              </div>

              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12">
                  {/* <Button
                    content="Back"
                    icon="left arrow"
                    labelPosition="left"
                    style={{ backgroundColor: "#992E62", color: "#fff" }}
                    onClick={() => handleItemClick("risk", "risk")}
                  /> */}
                  <Button
                    content="Save & Continue"
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
    </>
  );
};

export default BasicInfo;
