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

import { calculate_age } from "../../../utils";
import PersonIcon from "@mui/icons-material/Person";
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

const ViewPNSForm = (props) => {
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [sexs, setSexs] = useState([]);
  const [notificationContact, setNotificationContact] = useState([]);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [indexTesting, setIndexTesting] = useState([]);
  const [consent, setConsent] = useState([]);
  const [hivTestDate, setHivTestDate] = useState("");
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [elicitedCount, setElicitedCount] = useState(0);
  const [setting, setSetting] = useState([]);
  const [isClientCurrentlyOnHiv, setIsClientCurrentlyOnHiv] = useState(true);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [roleProvider, setRoleProvider] = useState([]);
  const [facilityInfo, setFacilityInfo] = useState(
    props?.organizationInfo.currentOrganisationUnitName
  );
  const [stateInfo, setStateInfo] = useState(
    props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
      ? props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
      : props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
  );

  const [lgaInfo, setLgaInfo] = useState(
    props?.basicInfo?.personResponseDto?.address?.address[0].district
      ? props?.basicInfo?.personResponseDto?.address?.address[0].district
      : props?.patientObj?.personResponseDto?.address?.address[0].district
  );
  const [partnerId, setPartnerId] = useState("");

  let temp = { ...errors };
  const [objValuesIndex, setObjValuesIndex] = useState({
    htsClientId: null,
    indexNotificationServicesElicitation: {},
    personId: null,
  });
  const [contactTracing, setContactTracing] = useState({
    partnerPhoneNumber: "",
    numberOfAttempt: "",
  });

  const [objValues, setObjValues] = useState({
    acceptedHts: "",
    offeredPns: "",
    reasonForDecline: "",
    otherReasonForDecline: "",
    acceptedPns: "",
    address: "", //
    contactTracing: {
      partnerPhoneNumber: "",
      numberOfAttempt: "",
    },
    dateEnrollmentOnART: "",
    dateOfElicitation: "",
    datePartnerTested: "",
    dob: props?.basicInfo?.personResponseDto?.dateOfBirth,
    facilityId: props?.organizationInfo.currentOrganisationUnitId,
    phoneNumber:
      props?.basicInfo?.personResponseDto?.contactPoint?.contactPoint[0]?.value,
    alternatePhoneNumber: "",
    firstName: props?.basicInfo?.personResponseDto?.firstName,
    hivTestResult: "",
    htsClientId: props && props.patientObj ? props.patientObj?.id : "",
    indexClientId: props?.basicInfo?.indexClientCode,
    intermediatePartnerViolence: {
      DeprivedOfBasicNeedsEmotional: "",
      DeniedBasicNecessitiesForHealthcareEmotional: "",
      ForcedSexualActsSexual: "",
    },
    knownHivPositive: "",
    lastName: props?.basicInfo?.personResponseDto?.surname,
    middleName: props?.basicInfo?.personResponseDto?.otherName,
    notificationMethod: "",
    partnerId: "",
    relationshipToIndexClient: "",
    sex: props?.basicInfo?.personResponseDto?.gender.id,
    htsClientInformation: {
      testingSetting: "",
      providerNameCompletingForm: "",
      providerRoleCompletingForm: "",
      maritalStatus: props?.basicInfo?.personResponseDto?.maritalStatus.id,
      descriptiveResidentialAddress:
        props?.basicInfo?.personResponseDto?.address?.address[0].city,
      dateIndexClientConfirmedHiv: "",
      isClientCurrentlyOnHiv: "",
      DateOfTreatmentInitiation: "",
      recencyTesting: "",
      artEnrollmentNumber: "",
      facilityOfEnrollment: "",
      numberOfPartnerIdentifiedFromClientIndex: "",

      partnerName: "",
      partnerSex: "",
      partnerAge: "",
      partnerAddress: "",
      relativeToIndexClient: "",
      contactTracingType: "",
      freedomDenial: "",
      threatenToHurt: "",
      sexuallyUncomfortable: "",

      //

      partnerNotification: "",
      viralllyUnsppressed: "",

      numberOfPartnerIdentifiedFromClientIndex: "",
    },
  });

  const [htsClientInformation, sethtsClientInformation] = useState({
    testingSetting: props.patientObj.testingSetting,
    providerNameCompletingForm: "",
    providerRoleCompletingForm: "",
    maritalStatus: props?.basicInfo?.personResponseDto?.maritalStatus.id,
    descriptiveResidentialAddress:
      props?.basicInfo?.personResponseDto?.address?.address[0].city,
    dateIndexClientConfirmedHiv: "",
    isClientCurrentlyOnHiv: "",
    DateOfTreatmentInitiation: "",
    recencyTesting: "",
    artEnrollmentNumber: "",
    facilityOfEnrollment: "",
    numberOfPartnerIdentifiedFromClientIndex: "",
    partnerName: "",
    partnerSex: "",
    partnerAge: "",
    partnerAddress: "",
    relativeToIndexClient: "",
    contactTracingType: "",
    freedomDenial: "",
    threatenToHurt: "",
    sexuallyUncomfortable: "",

    //

    partnerNotification: "",
    viralllyUnsppressed: "",

    numberOfPartnerIdentifiedFromClientIndex: "",
  });

  //   const getPNSInfo = (id) => {
  //     axios
  //       .get(`${baseUrl}hts-personal-notification-service/${id}/hts-client`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       })
  //       .then((response) => {
  //         setMaritalStatus(response.data);
  //       })
  //       .catch((error) => {});
  //   };

  const checkNumberLimit = (e) => {
    const limit = 11;
    const acceptedNumber = e.slice(0, limit);
    return acceptedNumber;
  };

  const handleInputChangePhoneNumber = (e, inputName) => {
    const limit = 11;
    const NumberValue = checkNumberLimit(e.target.value.replace(/\D/g, ""));
    setObjValues({ ...objValues, [inputName]: NumberValue });
    if (inputName === "phoneNumber") {
      setObjValues({ ...objValues, [inputName]: NumberValue });
    }
    if (inputName === "alternatePhoneNumber") {
      setObjValues({ ...objValues, [inputName]: NumberValue });
    }
  };

  const TargetGroupSetup = () => {
    axios
      .get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFacilityInfo(response.data.currentOrganisationUnitName);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getPartnerId = (id) => {
    axios
      .get(
        `${baseUrl}hts-personal-notification-service/get-partner-id?htsClientId=${props.patientObj?.id}&clientCode=${props?.patientObj?.clientCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setPartnerId(response.data);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    // getPartnerId();
    Sex();
    getStates();
    NotificationContact();
    IndexTesting();
    Consent();
    getMaritalStatus();
    PROVIDER_ROLE();
    viewPnIsnfo();
    // if (props.patientObj) {
    //   if (props.patientObj.dateVisit && props.patientObj.dateVisit !== "") {
    //     setHivTestDate(props.patientObj.dateVisit);
    //   } else {
    //     setHivTestDate("");
    //   }

    //   setObjValues({
    //     ...objValues,
    //     firstName: props.patientObj.personResponseDto.firstName,
    //     middleName: props?.patientObj?.personResponseDto?.otherName,
    //     lastName: props?.patientObj?.personResponseDto?.surname,
    //     sex: props?.patientObj?.personResponseDto?.gender.id,
    //     dob: props?.patientObj?.personResponseDto?.dateOfBirth,
    //     phoneNumber:
    //       props?.patientObj?.personResponseDto?.contactPoint?.contactPoint[0]
    //         ?.value,
    //   });

    //   sethtsClientInformation({
    //     ...htsClientInformation,
    //     maritalStatus: props?.patientObj?.personResponseDto?.maritalStatus.id,
    //     descriptiveResidentialAddress:
    //       props?.patientObj?.personResponseDto?.address?.address[0].city,
    //   });

    // offeredPns: props.patientObj.personResponseDto.firstName

    //
    //
    //
    //
    //
    //
    //
    // })
    // }

    if (
      props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId ||
      props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
    ) {
      getProvincesId(
        props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
          ? props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
          : props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
      );
    }

    if (props.organizationInfo) {
      TargetGroupSetup();
    }
  }, [props.patientObj]);

  useEffect(() => {
    loadFamilyIndexSetting();
  }, []);

  // console.log(props.basicInfo);
  const handleHTSClientInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });

    if (
      e.target.name === "partnerAge" ||
      e.target.name === "numberOfAttempt" ||
      e.target.name === "numberOfPartnerIdentifiedFromClientIndex"
    ) {
      if (e.target.value > -1) {
        sethtsClientInformation({
          ...htsClientInformation,
          [e.target.name]: e.target.value,
        });
      }
    } else {
      sethtsClientInformation({
        ...htsClientInformation,
        [e.target.name]: e.target.value,
      });
    }
  };

  const loadFamilyIndexSetting = () => {
    let testingSetting = props?.patientObj?.testingSetting;
    let testingType = "";
    // COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES
    if (testingSetting.includes("COMMUNITY")) {
      testingType = "COMMUNITY_HTS_TEST_SETTING";
    }

    if (testingSetting.includes("FACILITY")) {
      testingType = "FACILITY_HTS_TEST_SETTING";
    }
    axios
      .get(`${baseUrl}application-codesets/v2/${testingType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSetting(response.data);
      })
      .catch((error) => {});
  };

  const getMaritalStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/MARITAL_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMaritalStatus(response.data);
      })
      .catch((error) => {});
  };

  const PROVIDER_ROLE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PROVIDER_ROLE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRoleProvider(response.data);
      })
      .catch((error) => {});
  };

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

  function getProvincesId(getStateId) {
    axios
      .get(
        `${baseUrl}organisation-units/parent-organisation-units/${getStateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setProvinces(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  }

  const getProvinces = (e) => {
    const stateId = e.target.value;
    setErrors({ ...temp, stateId: "" });
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
    // setObjValues({ ...objValues, countryId: 1 });
  };

  //Get list of Genders from
  const Sex = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SEX`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setSexs(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get list of IndexTesting
  const IndexTesting = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INDEX_TESTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setIndexTesting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  console.log(props);
  //Get all recorcd by htsClientId
  const getAllRecordByHTSClientId = () => {
    axios
      .get(`${baseUrl}hts-personal-notification-service/{id}/hts-client`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setIndexTesting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get view pns info
  const viewPnIsnfo = () => {
    axios
      .get(`${baseUrl}hts-personal-notification-service/${props.row.row.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setObjValues(response.data);
        sethtsClientInformation(response.data.htsClientInformation);
        setContactTracing(response.data.contactTracing);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  ///CONSENT	Yes		en	CONSENT
  const Consent = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CONSENT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setConsent(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const NotificationContact = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/NOTIFICATION_CONTACT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setNotificationContact(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleItemClick = (page, completedMenu) => {
    props.handleItemClick(page);
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu]);
    }
  };
  const handleItemClickPage = (page) => {
    props.handleIClickPage(page);
  };

  const handleInputContactChanges = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "numberOfAttempt") {
      if (e.target.value > -1) {
        setContactTracing({
          ...contactTracing,
          [e.target.name]: e.target.value,
        });
      }
    } else {
      setContactTracing({ ...contactTracing, [e.target.name]: e.target.value });
    }
  };
  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (
      e.target.name === "providerNameCompletingForm" &&
      e.target.value !== ""
    ) {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }
    if (e.target.name === "lastName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }
    if (e.target.name === "clientName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    }

    if (e.target.name === "offeredPns") {
      setObjValues({
        ...objValues,
        reasonForDecline: "",
        [e.target.name]: e.target.value,
        otherReasonForDecline: "",
        acceptedPns: "",
      });
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
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age_now--;
      }
      objValues.age = age_now;

      //setBasicInfo({...basicInfo, age: age_now});
    } else {
      setObjValues({ ...objValues, age: "" });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });

    setObjValues({ ...objValues, dob: e.target.value });
  };
  const handleDateOfBirthChange = (e) => {
    if (e.target.value === "Actual") {
      objValues.isDateOfBirthEstimated = false;
      setAgeDisabled(true);
    } else if (e.target.value === "Estimated") {
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

    setObjValues({ ...objValues, [e.target.name]: e.target.value });
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
    // temp.stateId = objValues.stateId ? "" : "This field is required.";
    // temp.lga = objValues.lga ? "" : "This field is required.";
    // temp.facilityId = objValues.facilityId ? "" : "This field is required.";
    if (objValues.offeredPns !== "No") {
      temp.testingSetting = htsClientInformation.testingSetting
        ? ""
        : "This field is required.";
      temp.providerRoleCompletingForm =
        htsClientInformation.providerRoleCompletingForm
          ? ""
          : "This field is required.";
      temp.relativeToIndexClient = htsClientInformation.relativeToIndexClient
        ? ""
        : "This field is required.";
    }
    if (objValues.offeredPns === "No") {
      temp.reasonForDecline = objValues.reasonForDecline
        ? ""
        : "This field is required.";
      temp.otherReasonForDecline =
        objValues.reasonForDecline === "others" &&
        objValues.otherReasonForDecline
          ? ""
          : "This field is required.";
    }

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   objValues.htsClientInformation = htsClientInformation;
  //   objValues.contactTracing = contactTracing;

  //   console.log(objValues);
  // };
  const handleSubmit = (e) => {
    e.preventDefault();
    objValues.htsClientInformation = htsClientInformation;
    objValues.contactTracing = contactTracing;
    objValues.htsClientId =
      props && props.patientObj ? props.patientObj?.id : "";

    if (validate()) {
      setSaving(true);
      objValues.isDateOfBirthEstimated =
        objValues.isDateOfBirthEstimated == true ? 1 : 0;
      axios
        .put(
          `${baseUrl}hts-personal-notification-service/${props.row.row.id}`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setSaving(false);
          toast.success("Record save successfully", {
            position: toast.POSITION.BOTTOM_CENTER,
          });

          handleItemClick("pns-history");

          if (
            objValues.offeredPns !== "No" &&
            objValues.acceptedPns !== "No"
            // objValues.elicited !== "No"
          ) {
            // setElicitedCount(elicitedCount + 1);
            // setObjValues({
            //   providerNameCompletingForm: "",
            //   clientName: "",
            //   lastName: "",
            //   dob: "",
            //   phoneNumber: "",
            //   altPhoneNumber: "",
            //   sex: "",
            //   htsClientId: props && props.patientObj ? props.patientObj.id : "",
            // physicalHurt: "",
            // threatenToHurt: "",
            // descriptiveResidentialAddress: "",
            // hangOutSpots: "",
            // relativeToIndexClient: "",
            // currentlyLiveWithPartner: "",
            // partnerTestedPositive: "",
            // sexuallyUncomfortable: "",
            // notificationMethod: "",
            // datePartnerCameForTesting: "",
            // age: "",
            // isDateOfBirthEstimated: false,
            // //offeredPns:"",
            //acceptedPns:"",
            //elicited: "",
            // stateId: "",
            // lga: "",
            // datePartnerTested: "",
            //   // partnerCurrentHivStatus: "",
            // });
          }
          //handleItemClickPage('list')
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
  };

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>
            Partner Notification Services
            {/*<Button*/}
            {/*    variant="contained"*/}
            {/*    color="primary"*/}
            {/*    className=" float-end  mr-2 mt-2"*/}
            {/*    onClick={() => handleItemClickPage("list")}*/}
            {/*//startIcon={<FaUserPlus size="10"/>}*/}
            {/*>*/}
            {/*    <span style={{ textTransform: "capitalize" }}>*/}
            {/*        {" "}*/}
            {/*        Back To Client List*/}
            {/*    </span>*/}
            {/*</Button>*/}
          </h2>

          <br />
          <br />
          <form>
            <div className="row">
              <div className="form-group  col-md-6">
                <FormGroup>
                  <Label>
                    Offered PNS ? <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="offeredPns"
                    id="offeredPns"
                    value={objValues.offeredPns}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={props.row.action === "view" ? true : false}
                  >
                    <option value={""}></option>
                    {consent.map((value) => (
                      <option key={value.id} value={value.display}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.offeredPns !== "" ? (
                    <span className={classes.error}>{errors.offeredPns}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {objValues.offeredPns !== "" && objValues.offeredPns !== "No" && (
                <div className="form-group  col-md-6">
                  <FormGroup>
                    <Label>
                      Accepted PNS ? <span style={{ color: "red" }}> </span>
                    </Label>
                    <select
                      className="form-control"
                      name="acceptedPns"
                      id="acceptedPns"
                      value={objValues.acceptedPns}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={props.row.action === "view" ? true : false}
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

              {objValues.offeredPns.toLowerCase() === "no" && (
                <div className="form-group  col-md-6">
                  <FormGroup>
                    <Label>
                      Reason for decline{" "}
                      <span style={{ color: "red" }}> *</span>
                    </Label>
                    <select
                      className="form-control"
                      type="select"
                      name="reasonForDecline"
                      id="reasonForDecline "
                      value={objValues.reasonForDecline}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={props.row.action === "view" ? true : false}
                    >
                      <option value={""}>Select</option>

                      <option key={1} value={"others"}>
                        Others
                      </option>
                    </select>
                    {errors.reasonForDecline !== "" ? (
                      <span className={classes.error}>
                        {errors.reasonForDecline}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {objValues.offeredPns.toLowerCase() === "no" &&
                objValues.offeredPns.toLowerCase() === "no" && (
                  <div className="form-group  col-md-6">
                    <FormGroup>
                      <Label>
                        Other reason For Decline
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <Input
                        className="form-control"
                        type="text"
                        name="otherReasonForDecline"
                        id="otherReasonForDecline"
                        value={objValues.otherReasonForDecline}
                        onChange={handleInputChange}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                        disabled={props.row.action === "view" ? true : false}
                      />
                      {errors.otherReasonForDecline !== "" ? (
                        <span className={classes.error}>
                          {errors.otherReasonForDecline}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
              {/*{objValues.acceptedPns !== "" &&*/}
              {/*    objValues.acceptedPns !== "No" && (*/}
              {/*        <div className="form-group  col-md-4">*/}
              {/*            <FormGroup>*/}
              {/*                <Label>*/}
              {/*                    Elicited ? <span style={{ color: "red" }}> </span>*/}
              {/*                </Label>*/}
              {/*                <select*/}
              {/*                    className="form-control"*/}
              {/*                    name="elicited"*/}
              {/*                    id="elicited"*/}
              {/*                    value={objValues.elicited}*/}
              {/*                    onChange={handleInputChange}*/}
              {/*                    style={{*/}
              {/*                        border: "1px solid #014D88",*/}
              {/*                        borderRadius: "0.2rem",*/}
              {/*                    }}*/}
              {/*                >*/}
              {/*                    <option value={""}></option>*/}
              {/*                    {consent.map((value) => (*/}
              {/*                        <option key={value.id} value={value.display}>*/}
              {/*                            {value.display}*/}
              {/*                        </option>*/}
              {/*                    ))}*/}
              {/*                </select>*/}
              {/*            </FormGroup>*/}
              {/*        </div>*/}
              {/*    )}*/}
            </div>

            <div className="row">
              {objValues.offeredPns !== "" &&
                objValues.offeredPns === "Yes" &&
                objValues.acceptedPns !== "" &&
                objValues.acceptedPns === "Yes" && (
                  <>
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
                          value={stateInfo}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
                        >
                          <option value={""}></option>
                          {states.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.stateId !== "" ? (
                          <span className={classes.error}>
                            {errors.stateId}
                          </span>
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
                          value={lgaInfo}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
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
                        <Label for="providerNameCompletingForm">
                          Facility Name
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <Input
                          className="form-control"
                          type="text"
                          name="facilityId"
                          id="facilityId"
                          value={facilityInfo}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
                        />
                        {errors.facilityId !== "" ? (
                          <span className={classes.error}>
                            {errors.facilityId}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* <div className="form-group mb-3 col-md-4">
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
                    </div> */}
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Setting <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="testingSetting"
                          id="testingSetting"
                          value={htsClientInformation.testingSetting}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value={""}></option>
                          {setting.map((value) => (
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
                          Name of provider completing the form
                        </Label>
                        <Input
                          type="text"
                          name="providerNameCompletingForm"
                          id="providerNameCompletingForm"
                          value={
                            htsClientInformation.providerNameCompletingForm
                          }
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Role of the provider completing Form
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="providerRoleCompletingForm"
                          id="providerRoleCompletingForm"
                          value={
                            htsClientInformation.providerRoleCompletingForm
                          }
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value={""}></option>
                          {roleProvider.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </select>
                        {errors.providerRoleCompletingForm !== "" ? (
                          <span className={classes.error}>
                            {errors.providerRoleCompletingForm}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
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
                      SECTION 1 : INFORMATION ABOUT THE INDEX CLIENT
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Client's Firstname </Label>
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
                          disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Client's Middlename </Label>
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
                          disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Client's Lastname</Label>
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
                          disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Index Client ID </Label>
                        <Input
                          type="text"
                          name="indexClientId"
                          id="indexClientId"
                          value={props?.patientObj?.clientCode || ""}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          // disabled={props.row.action === "view" ? true : false}
                          disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Sex </Label>
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
                          disabled
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
                    {/*<div className="form-group mb-3 col-md-4">*/}
                    {/*    <FormGroup>*/}
                    {/*        <Label for="">Last Name</Label>*/}
                    {/*        <Input*/}
                    {/*            type="text"*/}
                    {/*            name="lastName"*/}
                    {/*            id="lastName"*/}
                    {/*            value={objValues.lastName}*/}
                    {/*            onChange={handleInputChange}*/}
                    {/*            style={{*/}
                    {/*                border: "1px solid #014D88",*/}
                    {/*                borderRadius: "0.25rem",*/}
                    {/*            }}*/}
                    {/*        />*/}
                    {/*    </FormGroup>*/}
                    {/*</div>*/}
                    {/* <div className="form-group mb-2 col-md-4">
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
                    </div> */}
                    <div className="form-group mb-2 col-md-4">
                      <FormGroup>
                        <Label>Date Of Birth</Label>
                        <input
                          className="form-control"
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dob"
                          id="dob"
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          value={objValues.dob}
                          onChange={handleDobChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-2 col-md-4">
                      <FormGroup>
                        <Label>Age</Label>
                        <input
                          className="form-control"
                          type="number"
                          name="age"
                          id="age"
                          value={calculate_age(
                            props?.basicInfo?.personResponseDto?.dateOfBirth
                              ? props?.basicInfo?.personResponseDto?.dateOfBirth
                              : props?.patientObj?.personResponseDto
                                  ?.dateOfBirth
                          )}
                          // disabled={ageDisabled}
                          disabled
                          onChange={handleAgeChange}
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
                          Marital Status <span style={{ color: "red" }}> </span>
                        </Label>
                        <select
                          className="form-control"
                          name="maritalStatus"
                          id="maritalStatus"
                          value={htsClientInformation.maritalStatus}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
                          // disabled={props.activePage.actionType === "view"}
                        >
                          <option value={""}></option>
                          {maritalStatus.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.display}
                            </option>
                          ))}
                        </select>
                        {/* {errors.testingSetting !== "" ? (
                                            <span className={classes.error}>
                                                {errors.testingSetting}
                                            </span>
                                        ) : (
                                            ""
                                        )} */}
                      </FormGroup>
                    </div>
                    {/*<div className="form-group mb-3 col-md-4">*/}
                    {/*  <FormGroup>*/}
                    {/*    <Label for="">Phone Number</Label>*/}

                    {/*    <PhoneInput*/}
                    {/*        containerStyle={{*/}
                    {/*          width: "100%",*/}
                    {/*          border: "1px solid #014D88",*/}
                    {/*        }}*/}
                    {/*        inputStyle={{width: "100%", borderRadius: "0px"}}*/}
                    {/*        country={"ng"}*/}
                    {/*        placeholder="(234)7099999999"*/}
                    {/*        minLength={10}*/}
                    {/*        name="phoneNumber"*/}
                    {/*        disabled*/}
                    {/*        id="phoneNumber"*/}
                    {/*        masks={{ng: "...-...-....", at: "(....) ...-...."}}*/}
                    {/*        value={objValues.phoneNumber}*/}
                    {/*        onChange={(e) => {*/}
                    {/*          checkPhoneNumberBasic(e, "phoneNumber");*/}
                    {/*        }}*/}
                    {/*        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}*/}
                    {/*    />*/}
                    {/*    {errors.phoneNumber !== "" ? (*/}
                    {/*        <span className={classes.error}>*/}
                    {/*    {errors.phoneNumber}*/}
                    {/*  </span>*/}
                    {/*    ) : (*/}
                    {/*        ""*/}
                    {/*    )}*/}
                    {/*  </FormGroup>*/}
                    {/*</div>*/}

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Phone Number
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <Input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          onChange={(e) => {
                            handleInputChangePhoneNumber(e, "phoneNumber");
                          }}
                          value={objValues.phoneNumber}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled
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
                    {/*<div className="form-group mb-3 col-md-4">*/}
                    {/*  <FormGroup>*/}
                    {/*    <Label for="">Alternative Phone Number</Label>*/}
                    {/*    <PhoneInput*/}
                    {/*        disabled={props.row.action === "view" ? true : false}*/}
                    {/*        containerStyle={{*/}
                    {/*          width: "100%",*/}
                    {/*          border: "1px solid #014D88",*/}
                    {/*        }}*/}
                    {/*        inputStyle={{width: "100%", borderRadius: "0px"}}*/}
                    {/*        country={"ng"}*/}
                    {/*        placeholder="(234)7099999999"*/}
                    {/*        minLength={10}*/}
                    {/*        name="alternatePhoneNumber"*/}
                    {/*        id="altPhoneNumber"*/}
                    {/*        masks={{ng: "...-...-....", at: "(....) ...-...."}}*/}
                    {/*        value={objValues.alternatePhoneNumber}*/}
                    {/*        onChange={(e) => {*/}
                    {/*          checkPhoneNumberBasic(e, "alternatePhoneNumber");*/}
                    {/*        }}*/}
                    {/*        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}*/}
                    {/*    />*/}
                    {/*  </FormGroup>*/}
                    {/*</div>*/}
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Alternative Contact Number
                          {/* <span style={{color: "red"}}> *</span> */}
                        </Label>
                        <Input
                          type="text"
                          name="alternatePhoneNumber"
                          id="alternatePhoneNumber"
                          onChange={(e) => {
                            handleInputChangePhoneNumber(
                              e,
                              "alternatePhoneNumber"
                            );
                          }}
                          value={objValues.alternatePhoneNumber}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for=""> Descriptive Residential Address </Label>
                        <Input
                          type="text"
                          name="descriptiveResidentialAddress"
                          id="descriptiveResidentialAddress"
                          value={
                            htsClientInformation.descriptiveResidentialAddress
                          }
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled
                        />
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="">
                          Date Of Index Client's confirmed HIV-positive test
                          results <span style={{ color: "red" }}> *</span>{" "}
                        </Label>
                        <Input
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dateIndexClientConfirmedHiv"
                          id="dateIndexClientConfirmedHiv"
                          value={
                            props?.patientObj?.confirmatoryTest2?.date2 || ""
                          }
                          onChange={handleHTSClientInputChange}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          // disabled={props.row.action === "view" ? true : false}
                          disabled
                        />
                        {errors.dateIndexClientConfrimedHiv !== "" ? (
                          <span className={classes.error}>
                            {errors.referralDate}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {/* {indexClientConfirmedHivPositive && ( */}

                    {/* )} */}
                    {/* if index client is hiv positive, and date is selected */}
                    <div className="form-group col-md-4 ">
                      <Label>Is client current on HIV treatment?</Label>
                      <FormGroup>
                        <select
                          className="form-control"
                          name="isClientCurrentlyOnHiv"
                          id="isClientCurrentlyOnHiv"
                          onChange={handleHTSClientInputChange}
                          value={htsClientInformation.isClientCurrentlyOnHiv}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </FormGroup>
                    </div>
                    {htsClientInformation.isClientCurrentlyOnHiv &&
                      htsClientInformation.isClientCurrentlyOnHiv === "Yes" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label for="">
                              Date of Treatment Initiation{" "}
                              <span style={{ color: "red" }}> *</span>{" "}
                            </Label>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="DateOfTreatmentInitiation"
                              id="DateOfTreatmentInitiation"
                              value={
                                htsClientInformation.DateOfTreatmentInitiation
                              }
                              onChange={handleHTSClientInputChange}
                              min={props?.patientObj?.confirmatoryTest2?.date2}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.25rem",
                              }}
                              disabled={
                                props.row.action === "view" ? true : false
                              }
                            />
                            {/* {errors.treatmentDateI !== "" ? (
                                          <span className={classes.error}>
                                            {errors.referralDate}
                                          </span>
                                        ) : (
                                          ""
                                        )} */}
                          </FormGroup>
                        </div>
                      )}

                    <div className="form-group col-md-4 ">
                      <Label>Recency Testing</Label>
                      <FormGroup>
                        <select
                          className="form-control"
                          name="recencyTesting"
                          id="recencyTesting"
                          onChange={handleHTSClientInputChange}
                          value={htsClientInformation.recencyTesting}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value="">Select</option>
                          <option value="Recent Infection">
                            Recent Infection
                          </option>
                          <option value="Long Infection">Long Infection</option>
                          <option value="Not Done">Not Done</option>
                        </select>
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for=""> ART Enrollment Number </Label>
                        <Input
                          type="text"
                          name="artEnrollmentNumber"
                          id="artEnrollmentNumber"
                          value={htsClientInformation.artEnrollmentNumber}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for=""> Facility Of Enrollment </Label>
                        <Input
                          type="text"
                          name="facilityOfEnrollment"
                          id="facilityOfEnrollment"
                          value={htsClientInformation.facilityOfEnrollment}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Notification Method selected </Label>
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
                          disabled={props.row.action === "view" ? true : false}
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
                          {" "}
                          Number of Partner{" "}
                          <span>
                            {" "}
                            (sexual or social) identified/elicited from index{" "}
                          </span>
                        </Label>
                        <Input
                          type="number"
                          name="numberOfPartnerIdentifiedFromClientIndex"
                          id="numberOfPartnerIdentifiedFromClientIndex"
                          value={
                            htsClientInformation.numberOfPartnerIdentifiedFromClientIndex
                          }
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>

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
                      SECTION 2 : LISTING INDEX CLIENT PARTNER
                    </div>
                    <p style={{ color: "black", marginBottom: "20px" }}>
                      <i>
                        Instruction: Ask index client to list all the client
                        that have had sex with in the last 12 months. who may be
                        risk to HIV and or partners who they share needle for
                        injection of drugs where index client alluded to
                        injection drugs
                      </i>
                    </p>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Date of Elicitation</Label>
                        <Input
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dateOfElicitation"
                          id="dateOfElicitation"
                          value={objValues.dateOfElicitation}
                          onChange={handleInputChange}
                          min={props?.patientObj?.confirmatoryTest2?.date2}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          // disabled
                        />
                        {errors?.dateOfElicitation !== "" ? (
                          <span className={classes.error}>
                            {errors?.dateOfElicitation}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Partner ID </Label>
                        <Input
                          type="text"
                          name="partnerId"
                          id="partnerId"
                          value={objValues.partnerId}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={true}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">
                          {" "}
                          Name of Partner <span> (Enter surname first) </span>
                        </Label>
                        <Input
                          type="text"
                          name="partnerName"
                          id="partnerName"
                          value={htsClientInformation.partnerName}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Sex </Label>
                        <select
                          className="form-control"
                          name="partnerSex"
                          id="partnerSex"
                          value={htsClientInformation.partnerSex}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
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
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Age <span> (In years) </span>{" "}
                        </Label>
                        <input
                          className="form-control"
                          type="number"
                          name="partnerAge"
                          id="partnerAge"
                          value={htsClientInformation.partnerAge}
                          // disabled={ageDisabled}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">
                          {" "}
                          Home/Contact Address <span> include landmark </span>
                        </Label>
                        <Input
                          type="text"
                          name="partnerAddress"
                          id="partnerAddress"
                          value={htsClientInformation.partnerAddress}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for=""> Contact Phone Number</Label>

                      
                        <PhoneInput
                          containerStyle={{
                            width: "100%",
                            border: "1px solid #014D88",
                          }}
                          inputStyle={{ width: "100%", borderRadius: "0px" }}
                          country={"ng"}
                          placeholder="(234)7099999999"
                          minLength={10}
                          name="partnerPhoneNumber"
                          id="partnerPhoneNumber"
                          masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                          value={contactTracing.partnerPhoneNumber}
                          onChange={(e) => {
                            checkPhoneNumberBasic(e, "partnerPhoneNumber");
                          }}
                          disabled={props.row.action === "view" ? true : false}

                          //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}
                        />
                        {errors.partnerPhoneNumber !== "" ? (
                          <span className={classes.error}>
                            {errors.partnerPhoneNumber}
                          </span>
                        ) : (
                          ""
                        )}
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
                          value={htsClientInformation.relativeToIndexClient}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value={""}></option>
                          {indexTesting.map((value) => (
                            <option key={value.id} value={value.id}>
                              {value.display}
                            </option>
                          ))}
                        </select>
                      </FormGroup>
                      {errors.relativeToIndexClient !== "" ? (
                        <span className={classes.error}>
                          {errors.relativeToIndexClient}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Contact tracing</Label>
                        <select
                          className="form-control"
                          name="contactTracingType"
                          id="contactTracingType"
                          value={htsClientInformation.contactTracingType}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value={""}>select</option>
                          <option value="Phone calls">Phone calls</option>
                          <option value="Physical visit">Physical visit</option>
                        </select>
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for=""> Number of Attempt</Label>
                        <Input
                          type="number"
                          name="numberOfAttempt"
                          id="numberOfAttempt"
                          value={contactTracing.numberOfAttempt}
                          onChange={handleInputContactChanges}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}

                          // disabled
                        />
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Has this partner ever denied you of food, shelter,
                          freedom of movement,livehood?
                        </Label>
                        <select
                          className="form-control"
                          name="freedomDenial"
                          id="freedomDenial"
                          value={htsClientInformation.freedomDenial}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
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
                          Has this partner ever threatened to hurt you? *
                        </Label>
                        <select
                          className="form-control"
                          name="threatenToHurt"
                          id="threatenToHurt"
                          value={htsClientInformation.threatenToHurt}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
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
                          Has this partner ever threatened to rape and force to
                          have sex with you ? *
                        </Label>
                        <select
                          className="form-control"
                          name="sexuallyUncomfortable"
                          id="sexuallyUncomfortable"
                          value={htsClientInformation.sexuallyUncomfortable}
                          onChange={handleHTSClientInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
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
                    <div className="form-group col-md-4 ">
                      <Label>Known HIV Positive ?</Label>
                      <FormGroup>
                        <select
                          className="form-control"
                          name="knownHivPositive"
                          id="knownHivPositive"
                          onChange={handleInputChange}
                          value={objValues.knownHivPositive}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Accepted HTS ? <span style={{ color: "red" }}> </span>
                        </Label>
                        <select
                          className="form-control"
                          name="acceptedHts"
                          id="acceptedHts"
                          value={objValues.acceptedHts}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
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
                          HIV Test Result{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          name="hivTestResult"
                          id="hivTestResult "
                          value={objValues.hivTestResult}
                          onChange={handleInputChange}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}
                        >
                          <option value={""}></option>
                          <option value="negative">Negative</option>
                          <option value="positive">Positive</option>
                        </select>
                      </FormGroup>
                    </div>

                    {objValues.partnerCurrentHivStatus !== "" &&
                      objValues.partnerCurrentHivStatus === "positive" && (
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label for="">
                              Date Tested?{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="datePartnerTested"
                              id="datePartnerTested"
                              value={objValues.datePartnerTested}
                              onChange={handleInputChange}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.25rem",
                              }}
                              disabled={
                                props.row.action === "view" ? true : false
                              }
                            />
                          </FormGroup>
                        </div>
                      )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Date Enrolled On ART</Label>
                        <Input
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dateEnrollmentOnART"
                          id="dateEnrollmentOnART"
                          value={objValues.dateEnrollmentOnART}
                          onChange={handleInputChange}
                          min="1929-12-31"
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={props.row.action === "view" ? true : false}

                          // disabled
                        />
                        {errors.referralDate !== "" ? (
                          <span className={classes.error}>
                            {errors.referralDate}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )}
              {saving ? <Spinner /> : ""}
              <br />
              {props.row.action === "update" && (
                <div className="row">
                  <div className="form-group mb-3 col-md-6">
                    <Button
                      content="Update"
                      icon="save"
                      labelPosition="right"
                      style={{ backgroundColor: "#014d88", color: "#fff" }}
                      onClick={handleSubmit}
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default ViewPNSForm;
