import React, { useCallback, useEffect, useState } from "react";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import axios from "axios";
import { token, url as baseUrl } from "../../../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
// import {token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Badge from "@mui/material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import { useGetCodesets } from "../../../../hooks/useGetCodesets.hook";

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

const AddIndexContact = (props) => {
  const classes = useStyles();

  const [saving, setSaving] = useState(false);
  const [sexs, setSexs] = useState([]);
  const [notificationContact, setNotificationContact] = useState([]);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [indexTesting, setIndexTesting] = useState([]);
  const [consent, setConsent] = useState([]);
  const [errors, setErrors] = useState({});
  const [stateUnitOptions, setStateUnitOptions] = useState([]);
  const [districtUnitOptions, setDistrictUnitOptions] = useState([]);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [elicitedCount, setElicitedCount] = useState(0);

  let temp = { ...errors };
  const handleItemClick = (page, completedMenu) => {
    props.handleItemClick(page);
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu]);
    }
  };
  const [objValuesIndex, setObjValuesIndex] = useState({
    htsClientId: null,
    indexNotificationServicesElicitation: {},
    personId: null,
  });
  const handleItemClickPage = (page) => {
    props.handleIClickPage(page);
  };
  const [objValues, setObjValues] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phoneNumber: "",
    altPhoneNumber: "",
    sex: "",
    htsClientId: props && props.patientObj ? props.patientObj.id : "",
    physicalHurt: "",
    threatenToHurt: "",
    address: "",
    hangOutSpots: "",
    relativeToIndexClient: "",
    currentlyLiveWithPartner: "",
    partnerTestedPositive: "",
    sexuallyUncomfortable: "",
    notificationMethod: "",
    datePartnerCameForTesting: "",
    offeredIns: "",
    acceptedIns: "",
    elicited: "",
    stateId: "",
    lga: "",
    dateTested: "",
    currentHivStatus: "",
  });
  useEffect(() => {
    getStates();
  }, []);

  function getStateByCountryId(getCountryId) {
    axios
      .get(
        `${baseUrl}organisation-units/parent-organisation-units/${getCountryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setStates(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  }

 

  const getProvinces = (e) => {
    const stateId = e.target.value;
    setObjValues({ ...objValues, stateId: e.target.value });
    axios
      .get(
        `${baseUrl}organisation-units/parent-organisation-units/${stateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setProvinces(
          response.data.sort((x, y) => {
            return x.id - y.id;
          })
        );
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getStates = () => {
    getStateByCountryId("1");
    setObjValues({ ...objValues, countryId: 1 });
  };
  
  
 
 
  const handleInputChange = (e) => {
    //setErrors({...temp, [e.target.name]:""})
    if (e.target.name === "firstName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }
    if (e.target.name === "lastName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }
    if (e.target.name === "middleName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }
    // if((e.target.name !=='maritalStatusId' && e.target.value!=='5' )){//logic for marital status
    //     setHideNumChild(true)
    // }else{
    //     setHideNumChild(false)
    // }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };
  //Date of Birth and Age handle
  const handleDobChange = (e) => {
    if (e.target.value) {
      const today = new Date();
      const birthDate = new Date(e.target.value);
      let age_now = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      //     age_now--;
      // }
      objValues.age = age_now;

      //setBasicInfo({...basicInfo, age: age_now});
    } else {
      setObjValues({ ...objValues, age: "" });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });

    setObjValues({ ...objValues, dob: e.target.value });
  };
  const handleDateOfBirthChange = (e) => {
    if (e.target.value == "Actual") {
      objValues.isDateOfBirthEstimated = false;
      setAgeDisabled(true);
    } else if (e.target.value == "Estimated") {
      objValues.isDateOfBirthEstimated = true;
      setAgeDisabled(false);
    }
  };
  const handleAgeChange = (e) => {
    if (!ageDisabled && e.target.value) {
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate.toISOString());
      const dobNew = estDob.add(e.target.value * -1, "years");
      setObjValues({ ...objValues, dob: moment(dobNew).format("YYYY-MM-DD") });
      objValues.dob = moment(dobNew).format("YYYY-MM-DD");
    }
    setObjValues({ ...objValues, age: e.target.value });
  };
  //End of Date of Birth and Age handling
  const checkPhoneNumberBasic = (e, inputName) => {
    const limit = 10;
    setObjValues({ ...objValues, [inputName]: e.slice(0, limit) });
  };
  const alphabetOnly = (value) => {
    const result = value.replace(/[^a-z]/gi, "");
    return result;
  };
  const validate = () => {
    //HTS FORM VALIDATION
    //temp.acceptedIns = objValues.acceptedIns ? "" : "This field is required."
    temp.offeredIns = objValues.offeredIns ? "" : "This field is required.";

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.isDateOfBirthEstimated =
        objValues.isDateOfBirthEstimated == true ? 1 : 0;

      //console.log("obj", objValues);
      axios
        .post(`${baseUrl}index-elicitation`, objValues, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSaving(false);
          toast.success("Record save successfully");

          if (
            objValues.offeredIns !== "No" &&
            objValues.acceptedIns !== "No" &&
            objValues.elicited !== "No"
          ) {
            setElicitedCount(elicitedCount + 1);
            setObjValues({
              firstName: "",
              middleName: "",
              lastName: "",
              dob: "",
              phoneNumber: "",
              altPhoneNumber: "",
              sex: "",
              htsClientId: props && props.patientObj ? props.patientObj.id : "",
              physicalHurt: "",
              threatenToHurt: "",
              address: "",
              hangOutSpots: "",
              relativeToIndexClient: "",
              currentlyLiveWithPartner: "",
              partnerTestedPositive: "",
              sexuallyUncomfortable: "",
              notificationMethod: "",
              datePartnerCameForTesting: "",
              age: "",
              isDateOfBirthEstimated: false,
              //offeredIns:"",
              //acceptedIns:"",
              //elicited: "",
              stateId: "",
              lga: "",
              dateTested: "",
              currentHivStatus: "",
            });
          }

          // handleItemClickPage('list')
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
  };
const [codesets, setCodesets] = useState({})
  const loadCodesets = (data) => {
    setCodesets(data)
    
    setSexs(data["SEX"])
    setIndexTesting(data["INDEX_TESTING"])
    setConsent(data["CONSENT"])
    setNotificationContact(data["NOTIFICATION_CONTACT"])
  }

  useGetCodesets({
    codesetsKeys: [
     "SEX",
     "INDEX_TESTING",
     "CONSENT",
     "NOTIFICATION_CONTACT"
    ],
    patientId: props?.patientObj?.id || props?.basicInfo.id,
    onSuccess: loadCodesets
  })

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>
            Index Notification Services - Elicitation
            <Button
              variant="contained"
              color="primary"
              className=" float-end  mr-2 mt-2"
              onClick={() => handleItemClickPage("list")}
              //startIcon={<FaUserPlus size="10"/>}
            >
              <span style={{ textTransform: "capitalize" }}>
                {" "}
                Back To Client Index List
              </span>
            </Button>
          </h2>
          {elicitedCount === 0 ? (
            ""
          ) : (
            <Badge badgeContent={elicitedCount} color="primary">
              Elicited Clients
              <PersonIcon color="action" />
            </Badge>
          )}
          <br />
          <br />
          <form>
            <div className="row">
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Offered INS ? <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="offeredIns"
                    id="offeredIns"
                    value={objValues.offeredIns}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    {consent.map((value) => (
                      <option key={value.id} value={value.display}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.offeredIns !== "" ? (
                    <span className={classes.error}>{errors.offeredIns}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.offeredIns !== "" && objValues.offeredIns !== "No" && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>
                      Accepted INS ? <span style={{ color: "red" }}> </span>
                    </Label>
                    <select
                      className="form-control"
                      name="acceptedIns"
                      id="acceptedIns"
                      value={objValues.acceptedIns}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value={""}></option>
                      {consent.map((value) => (
                        <option key={value.id} value={value.display}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              )}
              {objValues.acceptedIns !== "" &&
                objValues.acceptedIns !== "No" && (
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Elicited ? <span style={{ color: "red" }}> </span>
                      </Label>
                      <select
                        className="form-control"
                        name="elicited"
                        id="elicited"
                        value={objValues.elicited}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {consent.map((value) => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                )}
            </div>

            <div className="row">
              {objValues.elicited !== "" && objValues.elicited !== "No" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">First Name</Label>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={objValues.firstName}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Middle Name</Label>
                      <Input
                        type="text"
                        name="middleName"
                        id="middleName"
                        value={objValues.middleName}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Last Name</Label>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={objValues.lastName}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-2 col-md-2">
                    <FormGroup>
                      <Label>Date Of Birth</Label>
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
                      <Label>Date</Label>
                      <input
                        className="form-control"
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                        name="dob"
                        id="dob"
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        value={objValues.dob}
                        onChange={handleDobChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-3">
                    <FormGroup>
                      <Label>Age</Label>
                      <input
                        className="form-control"
                        type="number"
                        name="age"
                        id="age"
                        value={objValues.age}
                        disabled={ageDisabled}
                        onChange={handleAgeChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Phone Number</Label>

                      <PhoneInput
                        containerStyle={{
                          width: "100%",
                          border: "1px solid #014D88",
                        }}
                        inputStyle={{ width: "100%", borderRadius: "0px" }}
                        country={"ng"}
                        placeholder="(234)7099999999"
                        minLength={10}
                        name="phoneNumber"
                        id="phoneNumber"
                        masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                        value={objValues.phoneNumber}
                        onChange={(e) => {
                          checkPhoneNumberBasic(e, "phoneNumber");
                        }}
                        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}
                      />
                      {errors.phoneNumber !== "" ? (
                        <span className={classes.error}>
                          {errors.phoneNumber}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Alternative Phone Number</Label>
                      <PhoneInput
                        containerStyle={{
                          width: "100%",
                          border: "1px solid #014D88",
                        }}
                        inputStyle={{ width: "100%", borderRadius: "0px" }}
                        country={"ng"}
                        placeholder="(234)7099999999"
                        minLength={10}
                        name="altPhoneNumber"
                        id="altPhoneNumber"
                        masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                        value={objValues.altPhoneNumber}
                        onChange={(e) => {
                          checkPhoneNumberBasic(e, "altPhoneNumber");
                        }}
                        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Sex <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="sex"
                        id="sex"
                        value={objValues.sex}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {sexs.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        State <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="state"
                        id="state"
                        onChange={getProvinces}
                        value={objValues.stateId}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {states.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.name}
                          </option>
                        ))}
                      </select>
                      {errors.stateId !== "" ? (
                        <span className={classes.error}>{errors.stateId}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        LGA <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="lga"
                        id="lga"
                        value={objValues.lga}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {provinces.map((value, index) => (
                          <option key={index} value={value.id}>
                            {value.name}
                          </option>
                        ))}
                      </select>
                      {errors.lga !== "" ? (
                        <span className={classes.error}>{errors.lga}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        Address <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        type="text"
                        name="address"
                        id="address"
                        value={objValues.address}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Hang-out spots</Label>
                      <Input
                        type="text"
                        name="hangOutSpots"
                        id="hangOutSpots"
                        value={objValues.hangOutSpots}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>

                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Relationship to Index Client{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="relativeToIndexClient"
                        id="relativeToIndexClient"
                        value={objValues.relativeToIndexClient}
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
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Do you currently live with this partner?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="currentlyLiveWithPartner"
                        id="currentlyLiveWithPartner"
                        value={objValues.currentlyLiveWithPartner}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value={"true"}>Yes</option>
                        <option value={"false"}>No</option>
                      </select>
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        As far as you know, has this partner ever tested
                        positive for HIV{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="partnerTestedPositive"
                        id="partnerTestedPositive"
                        value={objValues.partnerTestedPositive}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {consent.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Has this partner ever hit, kick, slapped or otherwise
                        physical hurt you?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="physicalHurt"
                        id="physicalHurt"
                        value={objValues.physicalHurt}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {consent.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Has this partner ever threatened to hurt you?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="threatenToHurt"
                        id="threatenToHurt"
                        value={objValues.threatenToHurt}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {consent.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>

                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Has this partner ever threatened to force you to do
                        something sexually that made you uncomfortable ?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="sexuallyUncomfortable"
                        id="sexuallyUncomfortable"
                        value={objValues.sexuallyUncomfortable}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {consent.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Notification Method selected{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="notificationMethod"
                        id="notificationMethod"
                        value={objValues.notificationMethod}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        {notificationContact.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">
                        If contract by which date will partner come for testing?
                      </Label>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                        name="datePartnerCameForTesting"
                        id="datePartnerCameForTesting"
                        value={objValues.datePartnerCameForTesting}
                        onChange={handleInputChange}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                      {errors.datePartnerComeForTesting !== "" ? (
                        <span className={classes.error}>
                          {errors.datePartnerComeForTesting}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        HIV Status of Index Client{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="currentHivStatus"
                        id="currentHivStatus"
                        value={objValues.currentHivStatus}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="negative">Negative</option>
                        <option value="positive">Positive</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </FormGroup>
                  </div>
                  {objValues.currentHivStatus !== "" &&
                    objValues.currentHivStatus === "positive" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="">
                            Date Tested?{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <Input
                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                            name="dateTested"
                            id="dateTested"
                            value={objValues.dateTested}
                            onChange={handleInputChange}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.25rem",
                            }}
                          />
                        </FormGroup>
                      </div>
                    )}
                </>
              )}

              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-6">
                  <Button
                    content="Save"
                    icon="save"
                    labelPosition="left"
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

export default AddIndexContact;
