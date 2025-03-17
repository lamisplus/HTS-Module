import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import { token, url as baseUrl } from "../../../../api";
import 'react-phone-input-2/lib/style.css'
import { Label as LabelRibbon, Button, Message } from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import * as moment from "moment";
// import {
//   getAllStateByCountryId,
//   getAllCountry,
//   getAllProvinces,
//   getAllGenders,
//   alphabetOnly,
// } from "../../../../utility";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
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
    '& > *': {
      margin: theme.spacing(1)
    },
    "& .card-title": {
      color: '#fff',
      fontWeight: 'bold'
    },
    "& .form-control": {
      borderRadius: '0.25rem',
      height: '41px'
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0"
    },
    "& .dropdown-toggle::after": {
      display: " block !important"
    },
    "& select": {
      "-webkit-appearance": "listbox !important"
    },
    "& p": {
      color: 'red'
    },
    "& label": {
      fontSize: '14px',
      color: '#014d88',
      fontWeight: 'bold'
    }
  },
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
  error: {
    color: '#f85032',
    fontSize: '12.8px'
  }
}));

const PartnerNotificationService = (props) => {
  const classes = useStyles();
  const patientID = props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.id : "";
  const sex = props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.sex : "";
  const clientId = props.patientObj && props.patientObj ? props.patientObj.id : "";
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [setting, setSetting] = useState([]) 
  const familyIndexClient = ['Select family index client', 'Mother', 'Father', 'Child']
  const maritalStatusOptions = ['Single', 'Engaged to be married', 'Cohabiting', 'Married-monogamous', 'Married-polygamous', 'Divorced', 'Widow or Widower'];
  const providerRoleCompletingFormOptions = ['HTS provider',' Linkage Provider', 'Peer educator', 'ART provider/nurse', 'Other clinical provider']
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState([]);
  const [ProviderRoleCompletingForm, setProviderRoleCompletingForm] = useState([])
 const recencyTestingOptionForNewlyPositive = [ 'Results not yet confirmed', 'NA']
  const [selectedRecencyTest, setSelectedRecencyTest] = useState([]);

  let temp = { ...errors }
  const [riskAssessmentPartner, setRiskAssessmentPartner] = useState(
    {
      sexPartnerHivPositive: "",
      newDiagnosedHivlastThreeMonths: "",
      currentlyArvForPmtct: "",
      knowHivPositiveOnArv: "",
      knowHivPositiveAfterLostToFollowUp: "",
      uprotectedAnalSex: "",
    }
  )
  const [objValues, setObjValues] = useState(
    {
      htsClientId: clientId,
      knowledgeAssessment: {},
      personId: patientID,
      riskAssessment: {},
      stiScreening: {},
      tbScreening: {},
      sexPartnerRiskAssessment: {}
    }
  )
  const [knowledgeAssessment, setKnowledgeAssessment] = useState(
    {
      previousTestedHIVNegative: "",
      timeLastHIVNegativeTestResult: "",
      clientPregnant: "",
      clientInformHivTransRoutes: "",
      clientInformRiskkHivTrans: "",
      clientInformPreventingsHivTrans: "",
      clientInformPossibleTestResult: "",
      informConsentHivTest: "",
    }
  )
  const [riskAssessment, setRiskAssessment] = useState(
    {
      everHadSexualIntercourse: "",
      bloodtransInlastThreeMonths: "",
      uprotectedSexWithCasualLastThreeMonths: "",
      uprotectedSexWithRegularPartnerLastThreeMonths: "",
      unprotectedVaginalSex: "",
      uprotectedAnalSex: "",
      stiLastThreeMonths: "",
      sexUnderInfluence: "",
      moreThanOneSexPartnerLastThreeMonths: "",
      experiencePain: "",
      haveSexWithoutCondom: "",
      abuseDrug: "",
      bloodTransfusion: "",
      consistentWeightFeverNightCough: "",
      soldPaidVaginalSex: "",
    }
  )
  const [stiScreening, setStiScreening] = useState(
    {
      vaginalDischarge: "",
      lowerAbdominalPains: "",
      urethralDischarge: "",
      complaintsOfScrotal: "",
      complaintsGenitalSore: "",

    }
  )
  const [tbScreening, setTbScreening] = useState(
    {
      currentCough: "",
      weightLoss: "",
      lymphadenopathy: "",
      fever: "",
      nightSweats: "",
    }
  )

  // const loadGenders = useCallback(async () => {
  //   getAllGenders()
  //     .then((response) => {
  //       setGenders(response);
  //     })
  //     .catch(() => {});
  // }, []);

  const handleCheckboxChange = (value) => {
    // Toggle the selection
    setSelectedMaritalStatus((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((status) => status !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  const familyIndexSetting = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSetting(response.data);
      })
      .catch((error) => {
      });
  };

  useEffect(() => {
    familyIndexSetting();

  }, [props.patientObj])


  useEffect(() => {

    if (props.patientObj) {
      setKnowledgeAssessment(props.patientObj.knowledgeAssessment && props.patientObj.knowledgeAssessment !== null ? props.patientObj.knowledgeAssessment : {})
      setRiskAssessment(props.patientObj.riskAssessment && props.patientObj.riskAssessment !== null ? props.patientObj.riskAssessment : {})
      setRiskAssessmentPartner(props.patientObj.sexPartnerRiskAssessment && props.patientObj.sexPartnerRiskAssessment !== null ? props.patientObj.sexPartnerRiskAssessment : {})
      setStiScreening(props.patientObj.stiScreening && props.patientObj.stiScreening !== null ? props.patientObj.stiScreening : {})
      setTbScreening(props.patientObj.tbScreening && props.patientObj.tbScreening !== null ? props.patientObj.tbScreening : {})
      //patientAge=calculate_age(moment(props.patientObj.personResponseDto.dateOfBirth).format("DD-MM-YYYY"))
      if (props.patientObj.riskStratificationResponseDto && Object.keys(props.patientObj.riskStratificationResponseDto.riskAssessment).length !== 0 && props.patientObj.riskAssessment === null) {
        //setRiskAssessment({...riskAssessment, ...props.patientObj.riskStratificationResponseDto.riskAssessment})
        props.patientObj.riskStratificationResponseDto.riskAssessment.whatWasTheResult !== "" && props.patientObj.riskStratificationResponseDto.riskAssessment.whatWasTheResult === 'Positive' ? knowledgeAssessment.previousTestedHIVNegative = 'false' :
          knowledgeAssessment.previousTestedHIVNegative = 'true'
      } else {
        setRiskAssessment({ ...riskAssessment, ...props.patientObj.riskAssessment })
      }
      knowledgeAssessment.clientPregnant = props.patientObj.pregnant === 73 ? "true" : "";
    }
  }, [props.patientObj]);
  const handleItemClick = (page, completedMenu) => {
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu])
    }
    props.handleItemClick(page)
  }

  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const handleInputChangeKnowledgeAssessment = e => {
    //setErrors({...temp, [e.target.name]:""})

    setKnowledgeAssessment({ ...knowledgeAssessment, [e.target.name]: e.target.value });

  }

  const handleInputChangeRiskAssessment = e => {
    setErrors({ ...temp, [e.target.name]: "" })
    setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });
  }
  // Getting the number count of riskAssessment True
  const actualRiskCountTrue = Object.values(riskAssessment)
  const riskCount = actualRiskCountTrue.filter((x) => x === 'true')

  const handleInputChangeRiskAssessmentPartner = e => {
    //setErrors({...temp, [e.target.name]:""})
    setRiskAssessmentPartner({ ...riskAssessmentPartner, [e.target.name]: e.target.value });
  }
  // Getting the number count of sexPartRiskCount True
  const actualSexPartRiskCountTrue = Object.values(riskAssessmentPartner)
  const sexPartRiskCount = actualSexPartRiskCountTrue.filter((x) => x === 'true')

  const handleInputChangeStiScreening = e => {
    //setErrors({...temp, [e.target.name]:""})
    setStiScreening({ ...stiScreening, [e.target.name]: e.target.value });
  }
  // Getting the number count of STI True
  const actualStiTrue = Object.values(stiScreening)
  const stiCount = actualStiTrue.filter((x) => x === 'true')

  const [tbCount, settbCount] = useState(0);
  const handleInputChangeTbScreening = e => {
    //setErrors({...temp, [e.target.name]:""})

    if (e.target.value === 'true') {
      const newcount = tbCount + 1
      if (newcount >= 0 && newcount <= 5) {
        settbCount(newcount)
      }
    }
    if (e.target.value === 'false') {
      const newcount = tbCount - 1
      //settbCount(newcount)
      if (newcount <= 0) {

        settbCount(0)
      } else {
        settbCount(newcount)
      }
    }
    setTbScreening({ ...tbScreening, [e.target.name]: e.target.value });
  }
  /*****  Validation  */
  /*****  Validation  */
  const validate = () => {

    props.patientObj.targetGroup === "TARGET_GROUP_GEN_POP" && (temp.everHadSexualIntercourse = riskAssessment.everHadSexualIntercourse ? "" : "This field is required.")
    props.patientObj.targetGroup === "TARGET_GROUP_GEN_POP" && (temp.bloodtransInlastThreeMonths = riskAssessment.bloodtransInlastThreeMonths ? "" : "This field is required.")


    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.experiencePain = riskAssessment.experiencePain ? "" : "This field is required.")

    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.haveSexWithoutCondom = riskAssessment.haveSexWithoutCondom ? "" : "This field is required.")
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.abuseDrug = riskAssessment.abuseDrug ? "" : "This field is required.")
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.bloodTransfusion = riskAssessment.bloodTransfusion ? "" : "This field is required.")
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.consistentWeightFeverNightCough = riskAssessment.consistentWeightFeverNightCough ? "" : "This field is required.")
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (temp.soldPaidVaginalSex = riskAssessment.soldPaidVaginalSex ? "" : "This field is required.")


    setErrors({ ...temp })
    return Object.values(temp).every(x => x === "")
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.htsClientId = clientId
      objValues.knowledgeAssessment = knowledgeAssessment
      objValues.personId = patientID
      objValues.riskAssessment = riskAssessment
      objValues.stiScreening = stiScreening
      objValues.tbScreening = tbScreening
      objValues.sexPartnerRiskAssessment = riskAssessmentPartner
      axios.put(`${baseUrl}hts/${clientId}/pre-test-counseling`, objValues,
        { headers: { "Authorization": `Bearer ${token}` } },

      )
        .then(response => {
          setSaving(false);
          props.setPatientObj(response.data)
          //toast.success("Risk Assesment successful");
          handleItemClick('hiv-test', 'pre-test-counsel')

        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage = error.response.data.apierror && error.response.data.apierror.message !== "" ? error.response.data.apierror.message : "Something went wrong, please try again";
            toast.error(errorMessage);
          }
          else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else {
      toast.error("All fields are required", { position: toast.POSITION.BOTTOM_CENTER });

    }
  }

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2>PARTNER NOTIFICATION SERVICES</h2>
          <form >
            <div className="row">

              <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{ backgroundColor: 'rgb(0,181,173)', width: '125%', height: '35px', color: '#fff', fontWeight: 'bold' }} >SECTION A</div>

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>State <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="state"
                    // id="previousTestedHIVNegative"
                    // value={knowledgeAssessment.previousTestedHIVNegative}
                    // onChange={handleInputChangeKnowledgeAssessment}
                    style={{ border: "1px solid #014D88", borderRadius: "0.2rem" }}
                  // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>

                  </select>
                  {/* {errors.previousTestedHIVNegative !=="" ? (
                                    <span className={classes.error}>{errors.previousTestedHIVNegative}</span>
                                    ) : "" } */}
                </FormGroup>
              </div>

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Lga</Label>
                  <select
                    className="form-control"
                    // name="timeLastHIVNegativeTestResult"
                    // id="timeLastHIVNegativeTestResult"
                    // value={knowledgeAssessment.timeLastHIVNegativeTestResult}
                    // onChange={handleInputChangeKnowledgeAssessment}
                    style={{ border: "1px solid #014D88", borderRadius: "0.2rem" }}
                  // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="<1"> {"< 1"} month</option>
                    <option value="1-3 Months">1-3 Months</option>
                    <option value="4-6 Months">4-6 Months</option>
                    <option value=">6 Months"> {">6"} Months</option>

                  </select>
                  {/* {errors.timeLastHIVNegativeTestResult !=="" ? (
                                    <span className={classes.error}>{errors.timeLastHIVNegativeTestResult}</span>
                                    ) : "" } */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    family name <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="familyName"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    Date <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    // name="dateVisit"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>setting </Label>
                  <select
                    className="form-control"
                    name="setting"
                    // id="clientInformHivTransRoutes"
                    // value={knowledgeAssessment.clientInformHivTransRoutes}
                    onChange={handleInputChange}
                    style={{ border: "1px solid #014D88", borderRadius: "0.2rem" }}
                  // disabled={props.activePage.actionType === "view"}
                  >
                    {setting.map((value, index) =>
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    )}
                  </select>
                  {/* {errors.clientInformHivTransRoutes !=="" ? (
                                    <span className={classes.error}>{errors.clientInformHivTransRoutes}</span>
                                    ) : "" } */}
                </FormGroup>
              </div>
            <div className="form-group col-md-4">
              <FormGroup>
                <Label for="">
                  Name of provider completing form <span style={{ color: "red" }}> *</span>
                </Label>
                <Input
                  type="text"
                  name="name"
                  // id="clientCode"
                  // value={objValues.clientCode}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                // readOnly={props.activePage.actionType === "view"}
                />
                {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
              </FormGroup>
              </div>
              <div className="form-group  col-md-4">
              <FormGroup>
                <Label>Role of provider completing form </Label>
                <select
                  className="form-control"
                  name="providerRoleCompletingForm"
                  // id="clientInformHivTransRoutes"
                  // value={knowledgeAssessment.clientInformHivTransRoutes}
                  onChange={handleInputChange}
                  style={{ border: "1px solid #014D88", borderRadius: "0.2rem" }}
                // disabled={props.activePage.actionType === "view"}
                >
                  {providerRoleCompletingFormOptions.map((item, index) =>
                    <option key={index} value={"item"}>{item}</option>
                  )}
                </select>
                {/* {errors.clientInformHivTransRoutes !=="" ? (
                                    <span className={classes.error}>{errors.clientInformHivTransRoutes}</span>
                                    ) : "" } */}
              </FormGroup>
            </div>
             {/* information about the index client section  */}
            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{ backgroundColor: 'rgb(0,181,173)', width: '125%', height: '35px', color: '#fff', fontWeight: 'bold' }} >SECTION 1: INFORMATION ABOUT THE INDEX CLIENT</div>
            <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                    Client's Name
                  </Label>
                  <Input
                    type="text"
                    name="mobileNumber"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    index client ID <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="indexClientId"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                    Mobile number
                  </Label>
                  <Input
                    type="text"
                    name="mobileNumber"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                    Alternative contact number
                  </Label>
                  <Input
                    type="text"
                    name="alternativeContactNumber"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                   descriptive residential address
                  </Label>
                  <Input
                    type="text"
                    name="descriptiveResidentialAddress"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    date of index client HIV-positive test results
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="indexClientConfirmedHivPositiveDate"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>

              <div className="form-group col-md-4">
                <FormGroup>
                  <Label>Marital Status</Label>
                  {maritalStatusOptions.map((option, index) => (
                    <div key={index} className="form-check">
                      <input
                        type="checkbox"
                        id={`maritalStatus-${index}`}
                        value={option}
                        checked={selectedMaritalStatus.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className="form-check-input"
                      />
                      <label htmlFor={`maritalStatus-${index}`} className="form-check-label">
                        {option}
                      </label>
                    </div>
                  ))}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
              <FormGroup>
                  <Label>recency testing(for newly tested positive only) : </Label>
                  <select
                    className="form-control"
                    name="recencyTestingForNewTested"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="Result not yet confirmed">Result not yet confirmed</option>
                    <option value="NA">NA</option>
                  </select>
                  {/* {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label>is client currently on HIV treatment: </Label>
                  <select
                    className="form-control"
                    name="isClientCurrentlyOnHiv"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="NA">NO</option>
                  </select>
                  {/* {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    date of treatemnt initiation
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="treatmentInitiationDate"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label>virally unsuppressed </Label>
                  <select
                    className="form-control"
                    name="virallyUnsuppressed"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="NA">NO</option>
                  </select>
                  {/* {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <hr />
              <br />
              <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{ backgroundColor: '#000', width: '125%', height: '35px', color: '#fff', fontWeight: 'bold' }} >SECTION B</div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                   position of child enumerated
                  </Label>
                  <Input
                    type="number"
                    name="childPosition"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                  sex
                  </Label>
                  <Input
                    type="text"
                    name="sex"
                    // id="clientCode"
                    // value={objValues.clientCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.clientCode !== "" ? (
                    <span className={classes.error}>{errors.clientCode}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label for="">
                   follow up appointment location
                  </Label>
                  <select
                    className="form-control"
                    name="followUpaApointmentLocation"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="Family">Family</option>
                    <option value="Home">Home</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Others">Others</option>
                  </select>
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    schedule visit date
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="scheduleVisitDate"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    date visited
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="dateVisited"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label>known HIV positive </Label>
                  <select
                    className="form-control"
                    name="knownHivPositive"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="NA">NO</option>
                  </select>
                  {/* {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    date tested
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="dateTested"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                <Label>HIV test result </Label>
                  <select
                    className="form-control"
                    name="hivTestResult"
                    // id="previouslyTested"
                    // value={objValues.previouslyTested}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.activePage.actionType === "view"}
                  >
                    <option value={""}></option>
                    <option value="Tested Negative">Tested Negative</option>
                    <option value="Testted Positive">Tested Positive</option>
                  </select>
                  {/* {errors.previouslyTested !== "" ? (
                    <span className={classes.error}>
                      {errors.previouslyTested}
                    </span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
           {payload.age  < 21 &&  <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    Date enrolled in OVC
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="ovcEnrolledDate"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              }
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="">
                    Date enrolled\ on ART
                  </Label>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="artEnrolledDate"
                    // id="dateVisit"
                    // value={objValues.dateVisit}
                    onChange={handleInputChange}
                    // min={objValues.dateOfRegistration}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  // readOnly={props.activePage.actionType === "view"}
                  />
                  {/* {errors.dateVisit !== "" ? (
                    <span className={classes.error}>{errors.dateVisit}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <hr />
              <br />
              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12">
                  <Button content='Back' icon='left arrow' labelPosition='left' style={{ backgroundColor: "#992E62", color: '#fff' }} onClick={() => handleItemClick('basic', 'basic')} />
                  <Button content='Save & Continue' icon='right arrow' labelPosition='right' style={{ backgroundColor: "#014d88", color: '#fff' }} onClick={handleSubmit} disabled={saving} />
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default PartnerNotificationService;