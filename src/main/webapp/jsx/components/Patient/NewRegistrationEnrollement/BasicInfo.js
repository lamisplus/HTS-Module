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
//import { objectValues } from "react-toastify/dist/utils";
import { getCheckModality } from "../../../../utility";
import { getNextForm } from "../../../../utility";
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
}));
// THIS IS THE VIEW AND UPDATE PAGE
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
  const [codesets, setCodsets] = useState({})
  let temp = { ...errors };

  const [modalityCheck, setModalityCheck] = useState("");
  const [objValues, setObjValues] = useState({
    active: true,
    clientCode: "",
    age: "",
    dob: "",
    breastFeeding: "",
    dateVisit: props?.patientObj?.dateVisit,
    firstTimeVisit: null,
    indexClient: null,
    numChildren: "",
    numWives: "",
    pregnant: "",
    dateOfBirth: null,
    dateOfRegistration: null,
    deceased: true,
    deceasedDateTime: null,
    educationId: "",
    employmentStatusId: "",
    facilityId: "",
    firstName: "",
    genderId: "",
    address: "",
    phoneNumber: "",
    isDateOfBirthEstimated: "",
    maritalStatusId: "",
    organizationId: "",
    otherName: "",
    sexId: "",
    state: null,
    lga: "",
    id: "",
    surname: "",
    previouslyTested: "",
    referredFrom: "",
    targetGroup: "",
    testingSetting: "",
    typeCounseling: "",
    relationWithIndexClient:
      props.activePage?.activeObject?.relationWithIndexClient,
    indexClientCode: "",
    comment: "",
    partnerNotificationService: "",
    familyIndex: "",

  });

  useEffect(() => {
    setObjValues({ ...props.activePage.activeObject, testingSetting: props.activePage.activeObject.riskStratificationResponseDto.testingSetting });
    setModalityCheck(
      getCheckModality(
        props?.patientObj?.riskStratificationResponseDto?.testingSetting
      )
    );
  }, [props.patientObj]);
  


  const handleInputChange = (e) => {
    if (e.target.name === "numChildren") {
      if (e.target.value >= 0) {
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      } else {
        setObjValues({
          ...objValues,
          [e.target.name]: 0,
        });
      }
    } else if (e.target.name === "indexClient") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        relationWithIndexClient: "",
        indexClientCode: "",
      });
      setErrors({ ...errors, relationWithIndexClient: "", indexClientCode: "" })

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
    setErrors({ ...temp, [e.target.name]: "" });
  };

  
  /*****  Validation  */
  const validate = () => {
    //HTS FORM VALIDATION

    temp.clientCode = objValues.clientCode ? "" : "This field is required.";
    temp.typeCounseling = objValues.typeCounseling
      ? ""
      : "This field is required.";
    temp.testingSetting = objValues.testingSetting
      ? ""
      : "This field is required.";
    temp.targetGroup =
      objValues.targetGroup !== "" ? "" : "This field is required.";
    temp.referredFrom =
      objValues.referredFrom !== "" ? "" : "This field is required.";
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
        objValues.indexClientCode !== ""
          ? ""
          : "This field is required.");
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
  const handleSubmit = (e) => {
    e.preventDefault();
    let latestForm = getNextForm(
      "client_intake_form",
      props.patientAge,
      modalityCheck,
      "unknown"
    );
    if (props.activePage.actionType === "update") {
      //e.preventDefault();
      const patientForm = {
        ...props.patientObj,
        clientCode: objValues.clientCode,
        dateVisit: objValues.dateVisit,
        extra: {},
        id: objValues.id,
        firstTimeVisit: objValues.firstTimeVisit,
        indexClient: objValues.indexClient,
        numChildren: objValues.numChildren,
        numWives: objValues.numWives,
        personId: props.patientObj.personId,
        hospitalNumber: objValues.clientCode,
        previouslyTested: objValues.previouslyTested,
        referredFrom: objValues.referredFrom,
        targetGroup: objValues.targetGroup,
        testingSetting: objValues.testingSetting,
        typeCounseling: objValues.typeCounseling,
        breastFeeding: objValues.breastFeeding,
        indexClientCode: objValues.indexClientCode,
        pregnant: objValues.pregnant,
        relationWithIndexClient: objValues.relationWithIndexClient,
        comment: objValues.comment,
        partnerNotificationService: objValues.partnerNotificationService,
        familyIndex: objValues.familyIndex,

      };

      if (validate()) {
        setSaving(true);
        axios
          .put(`${baseUrl}hts/${props.patientObj.id}`, patientForm, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            props.setPatientObj(response.data);
            toast.success("HTS Test successful");
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
              toast.error(errorMessage);
            } else {
              toast.error("Something went wrong. Please try again...");
            }
          });
      }
    }
    if (props.activePage.actionType === "view") {
      //e.preventDefault();
      setSaving(true);
      handleItemClick(latestForm[0], latestForm[1]);
    }
  };

  const loadCodesets = (data) => {
    setCodsets(data)
    setKP(data["TARGET_GROUP"])
    setIndexTesting(data["INDEX_TESTING"])
    setPregnancyStatus(data["PREGNANCY_STATUS"])
    setCounselingType(data["COUNSELING_TYPE"])
    setSourceReferral(data["SOURCE_REFERRAL"])
    setGender(data["GENDER"])

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

      "TEST_SETTING", //just in case

    ],
    patientId: props.patientObj?.id,
    onSuccess: loadCodesets
  })


  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>CLIENT INTAKE FORM</h2>
          <br />
          <form>
            <div className="row">
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Target Groups <span style={{ color: "red" }}> *</span>
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
                    disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    {kP.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
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
                    Client Code <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="clientCode"
                    id="clientCode"
                    value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    readOnly={
                      props.activePage.actionType === "view" ||
                      props.activePage.actionType === "update"
                    }
                  />
                  {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
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
                    value={objValues.referredFrom}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.activePage.actionType === "view"}
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
                    disabled={props.activePage.actionType === "view"}
                  >


                    <option value={""}></option>
                    {enrollSetting?.map?.((value) => (
                      <option key={value?.id} value={value?.code}>
                        {value?.display}
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
                    type="date" onKeyPress={(e) => { e.preventDefault() }}

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
                    readOnly={props.activePage.actionType === "view"}
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
              {props.patientAge > 9 &&
                (props.patientObj.personResponseDto.sex === "Male" ||
                  props.patientObj.personResponseDto.sex === "male" ||
                  props.patientObj.personResponseDto.sex === "MALE") && (
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
                        readOnly={props.activePage.actionType === "view"}
                      />
                    </FormGroup>
                  </div>
                )}
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
                      readOnly={props.activePage.actionType === "view"}
                    />
                  </FormGroup>
                </div>
              )}

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Index Testing</Label>
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
                    disabled={props.activePage.actionType === "view"}
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
                      <Label>Relationship of the index client</Label>
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
                        disabled={props.activePage.actionType === "view"}
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
                      <Label>Index Client Code/ID
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
                        readOnly={props.activePage.actionType === "view"}
                      />
                    </FormGroup>
                    {errors.indexClientCode !== "" ? (
                      <span className={classes.error}>
                        {errors.indexClientCode}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </>
              )}
              {props.patientObj.personResponseDto.sex &&
                props.patientObj.personResponseDto.sex.toLowerCase() ===
                "female" && (
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
                            props.patientObj.riskStratificationResponseDto
                              .testingSetting ===
                              "FACILITY_HTS_TEST_SETTING_ANC"
                              ? true
                              : props.activePage.actionType === "view"
                                ? true
                                : false
                          }
                        >
                          <option value={""}></option>
                          {pregnancyStatus.map((value) =>
                            (props.patientObj.riskStratificationResponseDto
                              .testingSetting ===
                              "FACILITY_HTS_TEST_SETTING_ANC")
                              &&
                              value.code === "PREGANACY_STATUS_NOT_PREGNANT" ? (
                              <></>
                            ) : (
                              <option key={value.id} value={value.id}>
                                {value.display}
                              </option>
                            )
                          )}
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
                    {/*objValues.pregnant!== 73 || objValues.pregnant!== "73" && (
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
                  <Label>First time visit</Label>
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
                    disabled={props.activePage.actionType === "view"}
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
                  <Label>Previously tested within the last 3 months</Label>
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
                    disabled={props.activePage.actionType === "view"}
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
                  <Label>Type of Counseling</Label>
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
                    disabled={props.activePage.actionType === "view"}
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
                    disabled={props.activePage.actionType === "view"}
                  />
                </FormGroup>
              </div>

              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12">
                  {props.activePage.actionType === "update" && (
                    <Button
                      content="Update & Continue"
                      icon="right arrow"
                      labelPosition="right"
                      style={{ backgroundColor: "#014d88", color: "#fff" }}
                      onClick={handleSubmit}
                      disabled={saving}
                    />
                  )}
                  {props.activePage.actionType === "view" && (
                    <Button
                      content="Next"
                      icon="right arrow"
                      labelPosition="right"
                      style={{ backgroundColor: "#014d88", color: "#fff" }}
                      onClick={handleSubmit}
                      disabled={saving}
                    />
                  )}
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
