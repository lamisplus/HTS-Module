import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { token, url as baseUrl } from "../../../../../api"
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { Label as LabelRibbon, Message } from "semantic-ui-react";
import PhoneInput from "react-phone-input-2";
// import { getAllGenders, alphabetOnly } from "../../../../utility";
import { alphabetOnly, getAllGenders } from  "../../../../../utility";
import Select from "react-select";
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
  success: {
    color: "green",
    fontSize: "12.8px",
    fontWeight: "bold",
  },
}));

const ServicesProvided = (props) => {
  const classes = useStyles();

  const [errors, setErrors] = useState({});
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [saving, setSaving] = useState(false);
  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [genders, setGenders] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [serviceCategories ,setServiceCategories] = useState([]);

  const [payload, setPayload] = useState({
    nameOfFacilityProvider: props?.formInfo?.receivingOrganization?.nameOfFacilityProvider,
    addressOfFacilityProvider: props?.formInfo?.receivingOrganization?.addressOfFacilityProvider,
    referralDate: props?.formInfo?.receivingOrganization?.referralDate,
    comments: props?.formInfo?.receivingOrganization?.comments,
    clientFirstName: props?.formInfo?.receivingOrganization?.clientFirstName,
    clientLastName: props?.formInfo?.receivingOrganization?.clientLastName,
    clientMiddleName: props?.formInfo?.receivingOrganization?.clientMiddleName,
    nameOfServiceProvider: props?.formInfo?.receivingOrganization?.nameOfServiceProvider,
    signature: props?.formInfo?.receivingOrganization?.signature,
    phoneNumber: props?.formInfo?.receivingOrganization?.phoneNumber,
    categoryOfService: props?.formInfo?.receivingOrganization?.categoryOfService,
    receivingFacilityStateName: props?.formInfo?.receivingOrganization?.receivingFacilityStateName,
    receivingFacilityLgaName: props?.formInfo?.receivingOrganization?.receivingFacilityLgaName,
  });

  const [states1, setStates1] = useState([])
  const [lgas1, setLGAs1] = useState([])
  const [facilities1, setFacilities1] = useState([])
  const [selectedState, setSelectedState] = useState({})
  const [codesets, setCodesets] = useState({})
  const [selectedFacility, setSelectedFacility] = useState({});
  const [selectedLga, setSelectedLga] = useState({});

  

  
  const loadStates1 = () => {
    axios.get(`${baseUrl}organisation-units/parent-organisation-units/1`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
        .then((response) => {
          if (response.data) {
            setStates1(response.data);
          }

        })
        .catch((e) => {
         
        });
  };


  const loadLGA1 = (id) => {
    axios.get(`${baseUrl}organisation-units/parent-organisation-units/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
        .then((response) => {
          if (response.data) {
            setLGAs1(response.data);
            // const selectedLga = response.data.find(lga => lga.id === id);
            // setPayload(prevPayload => ({ ...prevPayload, lgaTransferTo: selectedLga ? selectedLga.name : "" }));
          }

        })
        .catch((e) => {
        });
  };

  const loadFacilities1 = (id) => {
    axios.get(`${baseUrl}organisation-units/parent-organisation-units/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
        .then((response) => {
          if (response.data) {
            setFacilities1(response.data);

          }
        })
        .catch((e) => {
          
        });
  };

  
  useEffect(() => {
    loadStates1();
  }, []);
 

  const checkPhoneNumberBasic = (e, inputName) => {
    if (e) {
      setErrors({ ...errors, phoneNumber: "" });
    }
    const limit = 10;
    setPayload({ ...payload, phoneNumber: e.slice(0, limit) });
  };

  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });

    if (e.target.name === "nameOfFacilityProvider" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (
      e.target.name === "addressOfFacilityProvider" &&
      e.target.value !== ""
    ) {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (e.target.name === "clientFirstName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (e.target.name === "clientMiddleName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (e.target.name === "clientLastName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (
      e.target.name === "nameOfServiceProvider" &&
      e.target.value !== ""
    ) {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else {
      setPayload({ ...payload, [e.target.name]: e.target.value });
    }
  };

  

  
  const validate = () => {
    //HTS FORM VALIDATION

    temp.nameOfFacilityProvider = payload.nameOfFacilityProvider
      ? ""
      : "This field is required.";
    temp.addressOfFacilityProvider = payload.addressOfFacilityProvider
      ? ""
      : "This field is required.";
    temp.referralDate = payload.referralDate ? "" : "This field is required.";
    temp.clientFirstName = payload.clientFirstName
      ? ""
      : "This field is required.";
    temp.clientLastName = payload.clientLastName
      ? ""
      : "This field is required.";
    temp.nameOfServiceProvider = payload.nameOfServiceProvider
      ? ""
      : "This field is required.";

    temp.signature = payload.signature ? "" : "This field is required.";
    temp.phoneNumber = payload.phoneNumber ? "" : "This field is required.";

    temp.categoryOfService = payload.categoryOfService
      ? ""
      : "This field is required.";
    temp.stateTransferTo = payload.receivingFacilityStateName ? "" : "This field is required.";
    temp.lgaTransferTo = payload.receivingFacilityLgaName ? "" : "This field is required.";
    temp.facilityTransferTo = payload.receivingFacilityName ? "" : "This field is required.";
    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  const handleInputChangeLocation = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if(e.target.name === 'stateTransferTo'){
      let filteredState = states1.filter((each)=>{
        return each.name.toLowerCase()  === e.target.value.toLowerCase()
      })
      setPayload({ ...payload, [e.target.name]: e.target.value });
      loadLGA1(filteredState[0].id);
    }
    if(e.target.name === 'lgaTransferTo'){
      let filteredState = lgas1.filter((each)=>{
        return each.name.toLowerCase()  === e.target.value.toLowerCase()
      })
      setPayload({ ...payload, [e.target.name]: e.target.value });
      loadFacilities1(filteredState[0].id);

    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      //   postPayload(payload);
    }
  };

  const loadCodesets = (data) => {
    setCodesets(data)
    setServiceCategories(data["SERVICE_PROVIDED"])
    setGenders(data["GENDER"])
  }

  useGetCodesets({
    codesetsKeys: [
      "SERVICE_PROVIDED",
      "SEX",
      "GENDER"
    ],
    patientId: patientObj?.id,
    onSuccess: loadCodesets
  })

  return (
    <>
      {" "}
      <div>
        <h2 style={{ color: "#000" }}>Client Referral Form - {props.row.action === "update" ? "Update": "View"} </h2>
        <br />
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
            Referral Form For Services Provided
          </div>

          <p style={{ color: "black", marginBottom: "20px" }}>
            <i>
              Note: This form should be filled out by the organization providing
              the service
            </i>
          </p>
          <div className="row">


            {/*######################################*/}

            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label for="" style={{color: '#014d88', fontWeight: 'bolder'}}>Service Provider State<span
                    style={{color: "red"}}> *</span> </Label>
                <Input
                    type="select"
                    name="stateTransferTo"
                    style={{
                      height: "40px",
                      border: 'solid 1px #014d88',
                      borderRadius: '5px',
                      fontWeight: 'bolder',
                      appearance: 'auto'
                    }}
                    required
                    disabled={
                      props.row.action === "view" ? true : false
                    }
                    value={payload?.stateTransferTo}
                    // onChange={loadLGA1}
                    onChange={handleInputChangeLocation}

                >
                  <option>Select State</option>
                  {states1.map((state) => (
                      <option key={state.id} value={state.name}>
                        {state.name}
                      </option>
                  ))}
                </Input>
                {errors.stateTransferTo !== "" ? (
                    <span className={classes.error}>
                        {errors.stateTransferTo}
                      </span>
                ) : (
                    ""
                )}
              </FormGroup>

            </div>


            {/* LOCAL GOVERNMENT TARNASFER TO  */}

            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label for="testGroup">
                  Service Provider LGA <span style={{color: "red"}}> *</span>
                </Label>

                <Input
                    type="select"
                    name="lgaTransferTo"
                    style={{
                      height: "40px",
                      border: 'solid 1px #014d88',
                      borderRadius: '5px',
                      fontWeight: 'bolder',
                      appearance: 'auto'
                    }}
                    required
                    disabled={
                      props.row.action === "view" ? true : false
                    }
                    value={payload?.lgaTransferTo}

                    onChange={handleInputChangeLocation}

                >
                  <option>Select Lga</option>
                  {lgas1.length > 0 && lgas1.map((lga) => (
                      <option key={lga.id} value={lga.name}>
                        {lga.name}
                      </option>
                  ))}
                  {lgas1.length < 1 && <option key={3} value={payload?.lgaTransferTo}>
                    {payload?.lgaTransferTo}
                  </option>}


                </Input>
                {errors.lgaTransferTo !== "" ? (
                    <span className={classes.error}>
                        {errors.lgaTransferTo}
                      </span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>


            {/* FACILITY TRANSFER TO   */}

            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label for="testGroup">
                  Service Provider Facility <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    type="select"
                    name="facilityTransferTo"
                    style={{
                      height: "40px",
                      border: 'solid 1px #014d88',
                      borderRadius: '5px',
                      fontWeight: 'bolder',
                      appearance: 'auto'
                    }}
                    required
                    disabled={
                      props.row.action === "view" ? true : false
                    }
                    value={payload.facilityTransferTo}
                    // onChange={loadLGA1}
                    onChange={handleInputChange}
                >
                  <option>Select State</option>
                  {facilities1.length > 0 && facilities1.map((fa) => (
                      <option key={fa.id} value={fa.name}>
                        {fa.name}
                      </option>
                  ))}

                  {facilities1.length < 1 && <option key={3} value={payload?.facilityTransferTo}>
                    {payload?.facilityTransferTo}
                  </option>}
                </Input>
                {errors.facilityTransferTo !== "" ? (
                    <span className={classes.error}>
                        {errors.facilityTransferTo}
                      </span>
                ) : (
                    ""
                )}

              </FormGroup>
            </div>

            {/*#######################################*/}

            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="firstName">
                  Address of Facility providing the service{" "}
                  <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="addressOfFacilityProvider"
                    id="addressOfFacilityProvider"
                    value={payload.addressOfFacilityProvider}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {errors.addressOfFacilityProvider !== "" ? (
                    <span className={classes.error}>
                    {errors.addressOfFacilityProvider}
                  </span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>

            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="">
                  Date <span style={{color: "red"}}> *</span>{" "}
                </Label>
                <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                    name="referralDate"
                    id="referralDate"
                    value={payload.referralDate}
                    onChange={handleInputChange}
                    min="1929-12-31"
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {errors.referralDate !== "" ? (
                    <span className={classes.error}>{errors.referralDate}</span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="firstName">
                  Client First Name <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="clientFirstName"
                    id="clientFirstName"
                    value={payload.clientFirstName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    // disabled={props.row.action === "view" ? true : false}
                />
                {errors.clientFirstName !== "" ? (
                    <span className={classes.error}>
                    {errors.clientFirstName}
                  </span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="clientMiddleName">
                  Client Middle Name
                  {/* <span style={{ color: "red" }}> *</span> */}
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="clientMiddleName"
                    id="clientMiddleName"
                    value={payload.clientMiddleName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
              </FormGroup>
            </div>

            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="clientLastName">
                  Client Last Name <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="clientLastName"
                    id="clientLastName"
                    value={payload.clientLastName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {errors.clientLastName !== "" ? (
                    <span className={classes.error}>{errors.clientLastName}</span>
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
                    name="comments"
                    id="comments"
                    value={payload.comments}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      height: "100px",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {/* {errors.firstName !== "" ? (
                  <span className={classes.error}>{errors.firstName}</span>
                ) : (
                  ""
                )} */}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="firstName">
                  Name of service provider
                  <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="nameOfServiceProvider"
                    id="nameOfServiceProvider"
                    value={payload.nameOfServiceProvider}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {errors.nameOfServiceProvider !== "" ? (
                    <span className={classes.error}>
                    {errors.nameOfServiceProvider}
                  </span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="firstName">
                  Signature
                  <span style={{color: "red"}}> *</span>
                </Label>
                <Input
                    className="form-control"
                    type="text"
                    name="signature"
                    id="signature"
                    value={payload.signature}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />
                {errors.signature !== "" ? (
                    <span className={classes.error}>{errors.signature}</span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>

            <div className="form-group  col-md-6">
              <FormGroup>
                <Label>
                  Phone Number <span style={{color: "red"}}> *</span>
                </Label>
                <PhoneInput
                    containerStyle={{
                      width: "100%",
                      border: "1px solid #014D88",
                    }}
                    inputStyle={{width: "100%", borderRadius: "0px"}}
                    country={"ng"}
                    placeholder="(234)7099999999"
                    maxLength={5}
                    name="phoneNumber"
                    id="phoneNumber"
                    masks={{ng: "...-...-....", at: "(....) ...-...."}}
                    value={payload.phoneNumber}
                    onChange={(e) => {
                      checkPhoneNumberBasic(e, "phoneNumber");
                    }}
                    disabled={props.row.action === "view" ? true : false}
                />

                {errors.phoneNumber !== "" ? (
                    <span className={classes.error}>{errors.phoneNumber}</span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>

            <div className="form-group  col-md-6">
              <FormGroup>
                <Label>
                  Categories of Services{" "}
                  <span style={{color: "red"}}> *</span>
                </Label>
                <select
                    className="form-control"
                    name="categoryOfService"
                    id="categoryOfService"
                    onChange={handleInputChange}
                    value={payload.categoryOfService}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                >
                  <option value={""}>Select</option>
                  {serviceCategories.map((service, index) => (
                      <option key={service?.id} value={service?.id}>
                        {service?.display}
                      </option>
                  ))}
                </select>
                {errors.categoryOfService !== "" ? (
                    <span className={classes.error}>
                    {errors.categoryOfService}
                  </span>
                ) : (
                    ""
                )}
              </FormGroup>
            </div>
          </div>
          <br/>

          <br/>

          <br/>
          {/* <hr /> */}
          {saving ? <Spinner/> : ""}
          <br/>
          {props.row.action === 'update' && (<div className="row">
                <div className="form-group mb-3 col-md-6">
                  <Button
                      content="Update"
                      type="submit"
                      icon="right arrow"
                      labelPosition="right"
                      style={{backgroundColor: "#014d88", color: "#fff"}}
                      onClick={handleSubmit}
                      disabled={saving}
                  />
                </div>
              </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ServicesProvided;
