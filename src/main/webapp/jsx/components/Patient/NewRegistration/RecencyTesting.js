import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import "react-phone-input-2/lib/style.css";
import { Label as LabelRibbon, Button } from "semantic-ui-react";
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { token, url as baseUrl } from "../../../../api";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { getNextForm } from "../../../../utility";
import { calculate_age } from "../../utils";
import { Modal } from "react-bootstrap";

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
}));

const Recency = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  const history = useHistory();
  const patientID =
    props.patientObj && props.patientObj.personResponseDto
      ? props.patientObj.personResponseDto.id
      : "";
  const clientId =
    props.patientObj && props.patientObj ? props.patientObj.id : "";
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [hivTestDate, setHivTestDate] = useState("");
  const [nextForm, setNextForm] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(true);

  const handleItemClick = (page, completedMenu) => {
    props.handleItemClick(page);
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu]);
    }
  };
  const [permissions, setPermission] = useState(
    localStorage.getItem("permissions")?.split(",")
  );
  const [objValues, setObjValues] = useState({
    htsClientId: clientId,
    recency: {},
    personId: patientID,
  });
  const [recency, setRecency] = useState({
    optOutRTRI:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.optOutRTRI
        : "",
    optOutRTRITestName:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.optOutRTRITestName
        : "",
    optOutRTRITestDate:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.optOutRTRITestDate
        : "",
    rencencyId:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.rencencyId
        : "",
    controlLine:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.controlLine
        : "",
    verififcationLine:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.verififcationLine
        : "",
    longTermLine:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.longTermLine
        : "",
    rencencyInterpretation:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.rencencyInterpretation
        : "",
    hasViralLoad:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.hasViralLoad
        : "",
    sampleCollectedDate:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.sampleCollectedDate
        : "",
    sampleReferanceNumber:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.sampleReferanceNumber
        : "",
    dateSampleSentToPCRLab:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.dateSampleSentToPCRLab
        : "",
    sampleTestDate:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.sampleTestDate
        : "",
    sampleType:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.sampleType
        : "",
    receivingPcrLab:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.receivingPcrLab
        : "",
    viralLoadResultClassification:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.viralLoadResultClassification
        : "",
    recencyResult:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.recencyResult
        : "",
    finalRecencyResult:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.finalRecencyResult
        : "",
    viralLoadConfirmationResult:
      props.patientObj && props.patientObj.recency !== null
        ? props.patientObj.recency.viralLoadConfirmationResult
        : "",
  });

  const handleDone = () => {
    toggle();
    handleItemClick(nextForm[2], nextForm[2]);
  };
  const loadOtherForm = (row) => {
    console.log("loadOtherForm called - opening modal");
    setOpen(true);
  };

  const loadNextForm = (row) => {
    handleItemClick(nextForm[0], nextForm[1]);
    toggle();
  };
  
  useEffect(() => {
    if (props.patientObj && props.patientObj.recency !== null) {
      console.log(props.patientObj.recency);
      setRecency(props.patientObj.recency);
    }
    if (props.patientObj) {
      if (
        props.patientObj.confirmatoryTest2 &&
        props.patientObj.confirmatoryTest2.date2 !== ""
      ) {
        setHivTestDate(props.patientObj.confirmatoryTest2.date2);
      } else if (
        props.patientObj.confirmatoryTest &&
        props.patientObj.confirmatoryTest.date !== ""
      ) {
        setHivTestDate(props.patientObj.confirmatoryTest.date);
      } else {
        setHivTestDate("");
      }
    }
    if (
      recency.longTermLine === "true" &&
      recency.verififcationLine === "true" &&
      recency.controlLine === "true"
    ) {
      recency.rencencyInterpretation = "RTRI Long Term";
      setRecency({ ...recency, ["rencencyInterpretation"]: "RTRI Long Term" });
    } else if (
      recency.longTermLine === "false" &&
      recency.verififcationLine === "true" &&
      recency.controlLine === "true"
    ) {
      recency.rencencyInterpretation = "RTRI Recent";
      setRecency({ ...recency, ["rencencyInterpretation"]: "RTRI Recent" });
      //setRecency ({...recency,  ['hasViralLoad']: 'true'});
    } else if (
      recency.longTermLine === "false" &&
      recency.verififcationLine === "false" &&
      recency.controlLine === "true"
    ) {
      recency.rencencyInterpretation = "Negative";
      setRecency({ ...recency, ["rencencyInterpretation"]: "Negative" });
    } else if (
      recency.longTermLine === "true" &&
      recency.verififcationLine === "true" &&
      recency.controlLine === "false"
    ) {
      recency.rencencyInterpretation = "Invalid";
      setRecency({ ...recency, ["rencencyInterpretation"]: "Invalid" });
    } else if (
      recency.longTermLine === "true" &&
      recency.verififcationLine === "false" &&
      recency.controlLine === "true"
    ) {
      recency.rencencyInterpretation = "Invalid";
      setRecency({ ...recency, ["rencencyInterpretation"]: "Invalid" });
    } else {
      setRecency({ ...recency, ["rencencyInterpretation"]: "" });
    }
    if (recency.optOutRTRI === "true") {
      setRecency({
        optOutRTRI:
          props.patientObj && props.patientObj.recency !== null
            ? props.patientObj.recency.optOutRTRI
            : "",
        optOutRTRITestName: "",
        optOutRTRITestDate: "",
        rencencyId: "",
        controlLine: "",
        verififcationLine: "",
        longTermLine: "",
        rencencyInterpretation: "",
        hasViralLoad: "",
        sampleCollectedDate: "",
        sampleReferanceNumber: "",
        dateSampleSentToPCRLab: "",
        sampleTestDate: "",
        sampleType: "",
        receivingPcrLab: "",
        viralLoadResultClassification: "",
        recencyResult: "",
        finalRecencyResult: "",
        viralLoadConfirmationResult: "",
      });
    }
  }, [
    recency.longTermLine,
    recency.verififcationLine,
    recency.controlLine,
    props.patientObj,
  ]);
  //console.log(props.patientObj)
  const handleInputChangeRecency = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "viralLoadConfirmationResult") {
      if (e.target.value >= 1000) {
        recency.viralLoadResultClassification = ">=1000";
        recency.finalRecencyResult = "RITA Recent";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      } else if (e.target.value < 1000) {
        recency.viralLoadResultClassification = "<1000";
        recency.finalRecencyResult = "RITA Long term";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      }
    }

    if (
      e.target.name === "controlLine" ||
      e.target.name === "verififcationLine" ||
      e.target.name === "longTermLine"
    ) {
      setErrors({ ...errors, hasViralLoad: "" });
      // hasViralLoad
    }

    if (e.target.name === "viralLoadResultClassification") {
      if (e.target.value === ">=1000") {
        recency.finalRecencyResult = "RITA Recent";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      } else if (e.target.value === "<1000") {
        recency.finalRecencyResult = "RITA Long term";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      } else if (e.target.value === "Failed run") {
        recency.finalRecencyResult = "RITA Inconclusive";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      } else if (e.target.value === "Invalid viral load result") {
        recency.finalRecencyResult = "RITA Inconclusive";
        setRecency({ ...recency, [e.target.name]: e.target.value });
      } else {
        setRecency({ ...recency, [e.target.name]: e.target.value });
      }
    } else if (e.target.name === "optOutRTRI") {
      setRecency({
        // optOutRTRI: "false",
        optOutRTRITestName: "",
        optOutRTRITestDate: "",
        rencencyId: "",
        controlLine: "",
        verififcationLine: "",
        longTermLine: "",
        rencencyInterpretation: "",
        hasViralLoad: "",
        sampleCollectedDate: "",
        sampleReferanceNumber: "",
        dateSampleSentToPCRLab: "",
        sampleTestDate: "",
        sampleType: "",
        receivingPcrLab: "",
        viralLoadResultClassification: "",
        recencyResult: "",
        finalRecencyResult: "",
        viralLoadConfirmationResult: "",
        [e.target.name]: e.target.value,
      });

      setErrors({
        optOutRTRITestName: "",
        optOutRTRITestDate: "",
        rencencyId: "",
        controlLine: "",
        verififcationLine: "",
        longTermLine: "",
        rencencyInterpretation: "",
        hasViralLoad: "",
        sampleCollectedDate: "",
        sampleReferanceNumber: "",
        dateSampleSentToPCRLab: "",
        sampleTestDate: "",
        sampleType: "",
        receivingPcrLab: "",
        viralLoadResultClassification: "",
        recencyResult: "",
        finalRecencyResult: "",
        viralLoadConfirmationResult: "",
        [e.target.name]: "",
      });
    } else if (e.target.name === "rencencyId" && e.target.value !== "") {
      const recencyIdNumberValue = checkRecencyLimit(e.target.value);
      setRecency({ ...recency, [e.target.name]: recencyIdNumberValue });
    } else {
      setRecency({ ...recency, [e.target.name]: e.target.value });
    }
  };
  const checkRecencyLimit = (e) => {
    const limit = 10;
    const acceptedNumber = e.slice(0, limit);
    return acceptedNumber;
  };

  /*****  Validation - FIXED VERSION  */
  const validate = () => {
    let temp = {};

    // Only validate fields when NOT opting out of RTRI
    if (recency.optOutRTRI === "false") {
      temp.optOutRTRITestName = recency.optOutRTRITestName
        ? ""
        : "This field is required.";

      temp.optOutRTRITestDate = recency.optOutRTRITestDate
        ? ""
        : "This field is required.";

      temp.rencencyId = recency.rencencyId ? "" : "This field is required.";

      temp.controlLine = recency.controlLine ? "" : "This field is required.";

      temp.verififcationLine = recency.verififcationLine
        ? ""
        : "This field is required.";

      temp.longTermLine = recency.longTermLine
        ? ""
        : "This field is required.";

      temp.rencencyInterpretation = recency.rencencyInterpretation
        ? ""
        : "This field is required.";

      // Only validate viral load fields if recency interpretation is "RTRI Recent"
      if (recency.rencencyInterpretation === "RTRI Recent") {
        temp.hasViralLoad = recency.hasViralLoad
          ? ""
          : "This field is required.";

        // Only validate viral load specific fields if hasViralLoad is true
        if (recency.hasViralLoad === "true") {
          temp.sampleReferanceNumber = recency.sampleReferanceNumber
            ? ""
            : "This field is required.";

          temp.sampleType = recency.sampleType ? "" : "This field is required.";
        }
      }
    }
    // If optOutRTRI is "true", no validation is needed - all fields are optional

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("=== HANDLE SUBMIT CALLED ===");
    console.log("Opt Out RTRI:", recency.optOutRTRI);
    
    let age = calculate_age(props?.patientObj?.personResponseDto?.dateOfBirth);
    let latestForm = getNextForm(
      "HIV_Recency_Testing",
      age,
      "",
      props?.patientObj?.hivTestResult
    );
    console.log("Next form:", latestForm);
    setNextForm(latestForm);
    
    objValues.htsClientId = clientId;
    objValues.recency = recency;
    objValues.personId = patientID;
    
    const validationResult = validate();
    console.log("Validation result:", validationResult);
    console.log("Errors:", errors);
    
    if (validationResult) {
      console.log("Validation passed - making API call");
      setSaving(true);
      axios
        .put(`${baseUrl}hts/${clientId}/recency`, objValues, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("API call successful");
          setSaving(false);
          props.setPatientObj(response.data);

          // Check if user opted out of RTRI
          if (recency.optOutRTRI === "true") {
            console.log("User opted out - calling loadOtherForm");
            loadOtherForm();
          } else if (
            latestForm[0] === "recency-testing" &&
            latestForm[1] === "recency-testing"
          ) {
            // if there are no other form then we should hide the save button
            console.log("No other forms - hiding save button");
            setShowSaveButton(false);
          } else {
            console.log("Other forms available - calling loadOtherForm");
            loadOtherForm();
          }
          //toast.success("Risk Assesment successful");
          // history.push('/')
        })
        .catch((error) => {
          console.log("API call failed:", error);
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else {
      console.log("Validation failed - errors:", errors);
    }
  };

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2>RECENCY FORM </h2>
          <form>
            <div className="row">
              <LabelRibbon
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h5 style={{ color: "#fff" }}>RECENCY</h5>
              </LabelRibbon>
              <br />
              <br />
              <br />
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Opt Out of RTRI? <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="optOutRTRI"
                    id="optOutRTRI"
                    value={recency.optOutRTRI}
                    onChange={handleInputChangeRecency}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>
              <div className="form-group  col-md-8"></div>
              {recency.optOutRTRI === "false" && (
                <>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Test Name <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="optOutRTRITestName"
                        id="optOutRTRITestName"
                        value={recency.optOutRTRITestName}
                        onChange={handleInputChangeRecency}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="Asante">Asante</option>
                        <option value="Others">Others</option>
                      </select>
                      {errors.optOutRTRITestName !== "" ? (
                        <span className={classes.error}>{errors.optOutRTRITestName}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Test Date <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="optOutRTRITestDate"
                        id="optOutRTRITestDate"
                        value={recency.optOutRTRITestDate}
                        onChange={handleInputChangeRecency}
                        min={
                          hivTestDate !== "" && hivTestDate !== null
                            ? hivTestDate
                            : ""
                        }
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                      {errors.optOutRTRITestDate !== "" ? (
                        <span className={classes.error}>{errors.optOutRTRITestDate}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Recency ID <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        className="form-control"
                        name="rencencyId"
                        id="rencencyId"
                        type="text"
                        value={recency.rencencyId}
                        onChange={handleInputChangeRecency}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />
                      {errors.rencencyId !== "" ? (
                        <span className={classes.error}>{errors.rencencyId}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Control Line <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="controlLine"
                        id="controlLine"
                        value={recency.controlLine}
                        onChange={handleInputChangeRecency}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.controlLine !== "" ? (
                        <span className={classes.error}>{errors.controlLine}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Verification Line{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="verififcationLine"
                        id="verififcationLine"
                        value={recency.verififcationLine}
                        onChange={handleInputChangeRecency}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.verififcationLine !== "" ? (
                        <span className={classes.error}>{errors.verififcationLine}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Long Term Line <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="longTermLine"
                        id="longTermLine"
                        value={recency.longTermLine}
                        onChange={handleInputChangeRecency}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.longTermLine !== "" ? (
                        <span className={classes.error}>{errors.longTermLine}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Recency Interpretation{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        className="form-control"
                        name="rencencyInterpretation"
                        id="rencencyInterpretation"
                        type="text"
                        value={recency.rencencyInterpretation}
                        disabled
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />
                      {errors.rencencyInterpretation !== "" ? (
                        <span className={classes.error}>{errors.rencencyInterpretation}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  {recency.rencencyInterpretation === "RTRI Recent" && (
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Has Viral Load been ordered?{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="hasViralLoad"
                          id="hasViralLoad"
                          value={recency.hasViralLoad}
                          onChange={handleInputChangeRecency}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.hasViralLoad !== "" ? (
                          <span className={classes.error}>{errors.hasViralLoad}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  )}
                  {recency.hasViralLoad === "true" && (
                    <>
                      <div className="row">
                        <h4>Recency Viral Load Classification :</h4>
                        <br />
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Recency Sample Collected Date</Label>
                            <Input
                              className="form-control"
                              name="sampleCollectedDate"
                              id="sampleCollectedDate"
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              value={recency.sampleCollectedDate}
                              min={recency.optOutRTRITestDate}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>
                              Recency Sample Reference Number{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <Input
                              className="form-control"
                              name="sampleReferanceNumber"
                              id="sampleReferanceNumber"
                              type="text"
                              value={recency.sampleReferanceNumber}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                            {errors.sampleReferanceNumber !== "" ? (
                              <span className={classes.error}>
                                {errors.sampleReferanceNumber}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>
                              Recency Sample Type{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <select
                              className="form-control"
                              name="sampleType"
                              id="sampleType"
                              value={recency.sampleType}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            >
                              <option value={""}></option>
                              <option value="DBS">DBS</option>
                              <option value="Plasma">Plasma</option>
                            </select>
                            {errors.sampleType !== "" ? (
                              <span className={classes.error}>
                                {errors.sampleType}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Date Recency Sample Sent to PCR Lab</Label>
                            <Input
                              className="form-control"
                              name="dateSampleSentToPCRLab"
                              id="dateSampleSentToPCRLab"
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              min={recency.sampleCollectedDate}
                              value={recency.dateSampleSentToPCRLab}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                            {errors.dateSampleSentToPCRLab !== "" ? (
                              <span className={classes.error}>
                                {errors.dateSampleSentToPCRLab}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Recency Sample Test Date</Label>
                            <Input
                              className="form-control"
                              name="sampleTestDate"
                              id="sampleTestDate"
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              // min={recency.optOutRTRITestDate}
                              min={recency.dateSampleSentToPCRLab}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              value={recency.sampleTestDate}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Receiving PCR Lab</Label>
                            <Input
                              className="form-control"
                              name="receivingPcrLab"
                              id="receivingPcrLab"
                              type="text"
                              value={recency.receivingPcrLab}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>
                              Recency Viral Load Confirmation Result (copies/ml)
                            </Label>
                            <Input
                              className="form-control"
                              name="viralLoadConfirmationResult"
                              id="viralLoadConfirmationResult"
                              type="number"
                              value={recency.viralLoadConfirmationResult}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>
                              Recency Viral Load Result Received Date
                            </Label>
                            <Input
                              className="form-control"
                              name="receivedResultDate"
                              id="receivedResultDate"
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              // min={recency.optOutRTRITestDate}
                              min={recency.sampleTestDate}
                              value={recency?.receivedResultDate}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>
                              Recency Viral Load Result Classification and
                              Result (copies/ml)
                            </Label>
                            <select
                              className="form-control"
                              name="viralLoadResultClassification"
                              id="viralLoadResultClassification"
                              disabled
                              value={recency.viralLoadResultClassification}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            >
                              <option value={""}>Select</option>
                              <option value=">=1000">{">= "} 1000</option>
                              <option value="<1000">{"< "} 1000</option>
                              <option value="Failed run">Failed run</option>
                              <option value="Invalid viral load result">
                                Invalid Recency viral load result
                              </option>
                            </select>
                          </FormGroup>
                        </div>

                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Final Recency Result</Label>
                            <Input
                              className="form-control"
                              name="finalRecencyResult"
                              id="finalRecencyResult"
                              type="text"
                              disabled
                              value={recency.finalRecencyResult}
                              onChange={handleInputChangeRecency}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div
                  className="form-group mb-3 "
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div className="">
                    {/* // <Button
                    //   content="Back"
                    //   icon="left arrow"
                    //   labelPosition="left"
                    //   style={{ backgroundColor: "#992E62", color: "#fff" }}
                    //   onClick={() => handleItemClick("post-test", "post-test")}
                    // /> */}
                    {showSaveButton && (
                      <Button
                        content="Done"
                        icon="right arrowrr"
                        labelPosition="right"
                        style={{ backgroundColor: "#014d88", color: "#fff" }}
                        onClick={() => {
                          history.push("/");
                        }}
                        disabled={
                          props.patientObj
                            ?.postTestCounselingKnowledgeAssessment
                            ?.hivTestResult === "true" &&
                          recency.optOutRTRI === ""
                            ? true
                            : false
                        }
                      />
                    )}
                  </div>

                  {showSaveButton ? (
                    <div>
                      {" "}
                      <Button
                        content="Save & Continue"
                        icon="right arrow"
                        labelPosition="right"
                        style={{ backgroundColor: "#014d88", color: "#fff" }}
                        onClick={handleSubmit}
                        disabled={
                          props.patientObj
                            ?.postTestCounselingKnowledgeAssessment
                            ?.hivTestResult === "true" &&
                          recency.optOutRTRI === ""
                            ? true
                            : false
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      {" "}
                      <Button
                        content="Done"
                        icon="right arrow"
                        labelPosition="right"
                        style={{ backgroundColor: "#014d88", color: "#fff" }}
                        onClick={() => {
                          history.push("/");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal
        show={open}
        onHide={toggle}
        className="fade"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Would you like to fill the Family Index form ?
            {/* <b>{row && record.activityName}</b> */}
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => loadNextForm()}
            style={{ backgroundColor: "red", color: "#fff" }}
          >
            Yes
          </Button>
          <Button
            onClick={handleDone}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Skip
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Recency;