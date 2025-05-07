import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { useHistory } from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { fontWeight } from "@mui/system";
import { getCheckModality } from "../../../../utility";
import { getDoubleSkipForm } from "../../../../utility";
import { getNextForm } from "../../../../utility";
import Cookies from "js-cookie";

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
  const history = useHistory();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalityCheck, setModalityCheck] = useState("");
  const [hideNumChild, setHideNumChild] = useState(false);
  const [kP, setKP] = useState([]);
  const [enrollSetting, setEnrollSetting] = useState([]);
  const [sourceReferral, setSourceReferral] = useState([]);
  const [gender, setGender] = useState([]);
  const [sexs, setSexs] = useState([]);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [counselingType, setCounselingType] = useState([]);
  const [pregnancyStatus, setPregnancyStatus] = useState([]);
  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [indexTesting, setIndexTesting] = useState([]);
  const [clientCodeetail, setclientCodeetail] = useState("");
  const [clientCodeetail2, setclientCodeetail2] = useState("");
  const [clientCodeCheck, setClientCodeCheck] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [facilityCode, setFacilityCode] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [showPregancy, setShowPregnancy] = useState(false);
  const [pregnancyCode, setPregnancyCode] = useState("");

  const [permissions, setPermission] = useState(
    localStorage.getItem("stringifiedPermmision")?.split(",")
  );
  const [disableIndexInfo, setDisableIndexInfo] = useState(false);
  const [disableSex, setdisableSex] = useState(false);

  const getPhoneNumber = (identifier) => {
    const identifiers = identifier;
    const phoneNumber = identifiers.contactPoint.find(
      (obj) => obj.type == "phone"
    );
    return phoneNumber ? phoneNumber.value : "";
  };
  const getAddress = (identifier) => {
    const identifiers = identifier;
    const address = identifiers.address.find((obj) => obj.city);
    return address ? address.city : "";
  };
  //Calculate Date of birth
  const calculate_age = (dob) => {
    var today = new Date();
    var dateParts = dob.split("-");
    var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
    var age_now = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (age_now <= 0 && m < 0 && today.getDate() < birthDate.getDate()) {
      age_now--;
    }
    // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //   age_now--;
    // }
    if (age_now === 0) {
      return m + " month(s)";
    }
    return age_now;
  };
  const address = props.patientObj.personResponseDto.address;
  const country =
    address && address.address && address.address.length > 0
      ? address.address[0]
      : null;
  const patientAge = calculate_age(
    //moment(props.patientObj.personResponseDto.dateOfBirth).format("DD-MM-YYYY")
    props.patientObj.personResponseDto.dateOfBirth
  );

  const [pmtctSetting, setPmtctSetting] = useState([
    "FACILITY_HTS_TEST_SETTING_ANC",
    "FACILITY_HTS_TEST_SETTING_L&D",
    "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
  ]);

  const [disableVitals, setDisableVitals] = useState(false);

  const [objValues, setObjValues] = useState({
    active: true,
    clientCode:
      props.patientObj && props.patientObj.clientCode
        ? props.patientObj.clientCode
        : "",
    age:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.dateOfBirth
        ? props.patientObj?.riskStratificationResponseDto?.age
        : "",
    dob:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.dateOfBirth
        ? props.patientObj.personResponseDto.dateOfBirth
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
        : props.patientObj.riskStratificationResponseDto.testingSetting ===
          "FACILITY_HTS_TEST_SETTING_ANC"
        ? localStorage.getItem("pregnancyCode")
        : "",
    dateOfBirth:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.dateOfBirth
        ? props.patientObj.personResponseDto.dateOfBirth
        : "",
    dateOfRegistration:
      props.patientObj && props.patientObj.dateOfRegistration
        ? props.patientObj.dateOfRegistration
        : "",
    deceased: "",
    deceasedDateTime: "",
    educationId:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.educationId
        ? props.patientObj.personResponseDto.educationId
        : "",
    employmentStatusId:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.employmentStatusId
        ? props.patientObj.personResponseDto.employmentStatusId
        : "",
    facilityId: "",
    firstName:
      props.patientObj && props.patientObj.personResponseDto
        ? props.patientObj.personResponseDto.firstName
        : "",
    genderId:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.genderId
        ? props.patientObj.personResponseDto.genderId
        : "",
    address:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.address
        ? getAddress(props.patientObj.personResponseDto.address)
        : "",
    phoneNumber:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.contactPoint
        ? getPhoneNumber(props.patientObj.personResponseDto.contactPoint)
        : "",
    isDateOfBirthEstimated:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.isDateOfBirthEstimated
        ? props.patientObj.personResponseDto.isDateOfBirthEstimated
        : "",
    maritalStatusId:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.maritalStatus
        ? props.patientObj.personResponseDto.maritalStatus.id
        : "",
    organizationId:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.genderId
        ? props.patientObj.personResponseDto.genderId
        : "",
    otherName:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.otherName
        ? props.patientObj.personResponseDto.otherName
        : "",
    sex:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.sex
        ? props.patientObj.personResponseDto.sex
        : pmtctSetting.includes(
            props.patientObj.riskStratificationResponseDto.testingSetting
          )
        ? "Female"
        : props.patientObj.targetGroup === "TARGET_GROUP_FSW"
        ? "Female"
        : props.patientObj.targetGroup === "TARGET_GROUP_MSM"
        ? "Male"
        : "",
    stateId: country && country.stateId ? country.stateId : "",
    riskAssessment:
      props.extra && props.extra.riskAssessment
        ? props.extra.riskAssessment
        : {},
    riskStratificationCode:
      props.extra && props.extra.code !== "" ? props.extra.code : "",
    lga: country && country.district ? country.district : "",
    surname:
      props.patientObj.personResponseDto &&
      props.patientObj.personResponseDto.surname
        ? props.patientObj.personResponseDto.surname
        : "",
    previouslyTested: props.patientObj ? props.patientObj.previouslyTested : "",
    referredFrom: props.patientObj ? props.patientObj.referredFrom : "",
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

  const convertFromIdToDisplay = (code) => {
    let ans = indexTesting.filter((each, index) => {
      return each.code === code;
    });

    if (ans[0]?.id) {
      return ans[0].id;
    }
  };

  const CreateClientCode = async () => {
    let facilityShortCode = "";
    let response = await axios.get(`${baseUrl}hts/get-facility-code`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFacilityCode(response.data);
    facilityShortCode = response.data;
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
    let codeCreated =
      "C" + facilityCode + "/" + settingCode + "/" + month + "/" + year + "/";
    setCreatedCode(codeCreated);

    if (!props.patientObj.id) {
      setObjValues({ ...objValues, clientCode: codeCreated });
    } else {
      setSerialNumber(Cookies.get("serial-number"));
      setDisableVitals(true);
    }
  };

  useEffect(() => {
    KP();
    EnrollmentSetting();
    SourceReferral();
    Genders();
    PregnancyStatus();

    getStates();
    MaterialStatus();
    determinSex();
    CounselingType();

    Sex();
    IndexTesting();
    CreateClientCode();

    //ellicited patient

    let checkEnrollIndex = JSON.parse(localStorage.getItem("index"));
    if (
      checkEnrollIndex &&
      checkEnrollIndex?.type === "family" &&
      checkEnrollIndex?.clientCode
    ) {
      setObjValues({
        ...objValues,
        familyIndex: checkEnrollIndex.uuid,
        indexClient: "true",
        relationWithIndexClient: convertFromIdToDisplay(
          "INDEX_TESTING_BIOLOGICAL"
        ),
        indexClientCode: checkEnrollIndex.clientCode,
      });
      setDisableIndexInfo(true);
    }
    if (checkEnrollIndex?.type === "partner" && checkEnrollIndex?.clientCode) {
      setObjValues({
        ...objValues,
        partnerNotificationService: checkEnrollIndex.uuid,
        indexClient: "true",
        relationWithIndexClient: convertFromIdToDisplay("INDEX_TESTING_SEXUAL"),
        indexClientCode: checkEnrollIndex.clientCode,
      });
      setDisableIndexInfo(true);
    }

    if (props.patientObj.id && props.completed.includes("basic")) {
      setDisableVitals(true);
      setSerialNumber(Cookies.get("serial-number"));
    }
    setModalityCheck(
      getCheckModality(
        props?.patientObj?.riskStratificationResponseDto?.testingSetting
      )
    );
    if (objValues.age !== "") {
      props.setPatientObjAge(objValues.age);
    }
    if (props.extra && props.extra.age !== "") {
      props.setPatientObjAge(props.extra.age);
    }
    if (country && country.stateId !== "") {
      getProvincesId(country.stateId);
    }

    // Cleanup logic here
  }, [objValues.age, props.patientObj, props.extra.age, facilityCode]);
  //Get list of KP
  const KP = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TARGET_GROUP`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setKP(response.data);
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
  //Get list of KP
  const PregnancyStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPregnancyStatus(response.data);
        determinPregnancy(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get list of KP
  const CounselingType = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/COUNSELING_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCounselingType(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
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
        //console.log(response.data);
        setEnrollSetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const HTS_ENTRY_POINT_FACILITY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //Remove retesting from the codeset
        let facilityList = [];
        // response.data.map((each, index)=>{
        //       if(each.code !=="FACILITY_HTS_TEST_SETTING_RETESTING"){
        //         facilityList.push(each);
        //       }

        // })

        setEnrollSetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //Get list of HIV STATUS ENROLLMENT
  const EnrollmentSetting = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (
          props.patientObj.riskStratificationResponseDto.entryPoint ===
          "HTS_ENTRY_POINT_COMMUNITY"
        ) {
          HTS_ENTRY_POINT_COMMUNITY();
        } else if (
          props.patientObj.riskStratificationResponseDto.entryPoint ===
          "HTS_ENTRY_POINT_FACILITY"
        ) {
          HTS_ENTRY_POINT_FACILITY();
        } else {
          setEnrollSetting([]);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //Get list of HIV STATUS ENROLLMENT
  const MaterialStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/MARITAL_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMaritalStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get list of Source of Referral
  const SourceReferral = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SOURCE_REFERRAL`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSourceReferral(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get list of Genders from
  const Genders = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/GENDER`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setGender(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
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
        // determinSex()
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //Get States from selected country
  const getStates = () => {
    setStateByCountryId("1");
    setObjValues({ ...objValues, countryId: 1 });
  };
  //Get list of State
  function setStateByCountryId(getCountryId) {
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
  //fetch province
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

  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "firstName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    } else if (e.target.name === "serialNumber") {
      setSerialNumber(e.target.value);
      checkClientCode(e);
    } else if (e.target.name === "lastName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
    } else if (e.target.name === "middleName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: name });
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
    } else if (e.target.name === "indexClientCode" && e.target.value !== "") {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
      async function getIndexClientCode() {
        const indexClientCode = e.target.value;
        const response = await axios.get(
          `${baseUrl}hts/client?code=${indexClientCode}`,
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
          //setObjValues ({...objValues,  [e.target.name]: e.target.value});
        } else {
          setclientCodeetail("");
          setclientCodeetail2(response.data);
        }
      }
      getIndexClientCode();
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
    } else {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }

    if (e.target.name === "sex" && e.target.value.toLowerCase() === "female") {
      setShowPregnancy(true);

      setErrors({ ...errors, pregnant: "" });
    }
  };

  //checkClientCode
  const checkClientCode = (e) => {
    let code = "";

    if (e.target.name === "serialNumber") {
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
  //Date of Birth and Age handle
  const handleDobChange = (e) => {
    if (e.target.value) {
      const today = new Date();
      const birthDate = new Date(e.target.value);
      let age_now = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (age_now <= 0 && m < 0 && today.getDate() < birthDate.getDate()) {
        age_now--;
      }
      // if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      //   age_now--;
      // }
      objValues.age = age_now;

      //setBasicInfo({...basicInfo, age: age_now});
    } else {
      setObjValues({ ...objValues, age: "" });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });

    setObjValues({ ...objValues, dob: e.target.value });
    if (objValues.age !== "" && objValues.age >= 85) {
      toggle();
    }
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

  const determinPregnancy = (pregList) => {
    // get  the value of pregnancy being used
    let pregnancyUsed = "";
    if (pregList.length > 0) {
      pregList.map((each, index) => {
        if (each.code === "PREGANACY_STATUS_PREGNANT") {
          pregnancyUsed = each.id;
        }
      });
    }

    if (
      props.patientObj.riskStratificationResponseDto.testingSetting ===
      "FACILITY_HTS_TEST_SETTING_ANC"
    ) {
      setObjValues({ ...objValues, pregnant: pregnancyUsed });
    }
  };

  const determinSex = () => {
    if (
      props.patientObj.riskStratificationResponseDto.testingSetting ===
        "FACILITY_HTS_TEST_SETTING_ANC" ||
      props.patientObj.riskStratificationResponseDto.testingSetting ===
        "FACILITY_HTS_TEST_SETTING_L&D" ||
      props.patientObj.riskStratificationResponseDto.testingSetting ===
        "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING"
    ) {
      setShowPregnancy(true);
      setdisableSex(true);
    } else {
      setShowPregnancy(false);
      setdisableSex(false);
    }
  };

  const handleAgeChange = (e) => {
    if (!ageDisabled && e.target.value) {
      if (e.target.value !== "" && e.target.value >= 85) {
        toggle();
      }
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

  /*****  Validation  */
  const validate = () => {
    //HTS FORM VALIDATION

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
    temp.surname = objValues.surname ? "" : "This field is required.";
    temp.sex = objValues.sex ? "" : "This field is required.";
    temp.clientCode = objValues.clientCode ? "" : "This field is required.";
    temp.phoneNumber = objValues.phoneNumber ? "" : "This field is required.";
    // temp.isDateOfBirthEstimated = objValues.isDateOfBirthEstimated ? "" : "This field is required."
    temp.firstName = objValues.firstName ? "" : "This field is required.";
    //temp.dateOfRegistration = objValues.dateOfRegistration ? "" : "This field is required."
    //temp.numChildren = objValues.numChildren ? "" : "This field is required."
    temp.address = objValues.address ? "" : "This field is required.";
    temp.indexClient =
      objValues.indexClient !== "" ? "" : "This field is required.";
    temp.firstTimeVisit =
      objValues.firstTimeVisit !== "" ? "" : "This field is required.";
    temp.dateVisit = objValues.dateVisit ? "" : "This field is required.";
    temp.dob = objValues.dob ? "" : "This field is required.";
    temp.age = objValues.age ? "" : "This field is required.";
    temp.lga = objValues.lga ? "" : "This field is required.";
    temp.stateId = objValues.stateId ? "" : "This field is required.";

    objValues.sex === "Female" &&
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

  const checkNumberLimit = (e) => {
    const limit = 11;
    const acceptedNumber = e.slice(0, limit);
    return acceptedNumber;
  };
  const handleInputChangePhoneNumber = (e, inputName) => {
    const limit = 11;
    const NumberValue = checkNumberLimit(e.target.value.replace(/\D/g, ""));
    setObjValues({ ...objValues, [inputName]: NumberValue });
  };

   const shouldHideMaritalFields = () => {
     // Check if setting is Pediatric and age is less than 15 years
     const isPediatricAndUnder15 =
       objValues.testingSetting === "FACILITY_HTS_TEST_SETTING_PEDIATRIC" &&
       props.patientAge < 15;

     // Check if target group is PD or Children of Most at risk population
     const isTargetGroupPDorChildrenKP =
       props.patientObj.targetGroup === "TARGET_GROUP_PD" ||
       props.patientObj.targetGroup === "TARGET_GROUP_CHILDREN_OF_KP";

     // Hide fields if either condition is true
     return isPediatricAndUnder15 || isTargetGroupPDorChildrenKP;
   };
  const handleSubmit = (e) => {
    e.preventDefault();
    Cookies.set("serial-number", serialNumber);
    // check next form
    let latestForm = getNextForm(
      "Client_intake_form",
      objValues.age,
      modalityCheck,
      "unknown"
    );

    if (validate() && clientCodeCheck === "") {
      setSaving(true);

      const getSexId = sexs.find((x) => x.display === objValues.sex); //get patient sex ID by filtering the request
      //basicInfo.sexId=getSexId.id
      const patientForm = {
        clientCode: objValues.clientCode,
        dateVisit: objValues.dateVisit,
        extra: {},
        firstTimeVisit: objValues.firstTimeVisit,
        indexClient: objValues.indexClient,
        numChildren: objValues.numChildren,
        numWives: objValues.numWives,
        personDto: {
          active: true,
          address: [
            {
              city: objValues.address,
              countryId: 1,
              district: objValues.lga,
              line: [""],
              organisationUnitId: "",
              postalCode: "",
              stateId: objValues.stateId,
            },
          ],
          contact: [],
          contactPoint: [
            {
              type: "phone",
              value: objValues.phoneNumber,
            },
          ],
          dateOfBirth: objValues.dob,
          dateOfRegistration: objValues.dateVisit,
          deceased: true,
          deceasedDateTime: null,
          educationId: "",
          employmentStatusId: "",
          facilityId: "",
          firstName: objValues.firstName,
          genderId: getSexId.id, //objValues.genderId,
          id: "",
          identifier: [
            {
              assignerId: 1,
              type: "HospitalNumber",
              value: objValues.clientCode,
            },
          ],
          isDateOfBirthEstimated: objValues.isDateOfBirthEstimated,
          maritalStatusId: objValues.maritalStatusId,
          organizationId: "",
          otherName: objValues.otherName,
          sexId: getSexId.id,
          surname: objValues.surname,
        },
        personId: "",
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
        riskStratificationCode:
          props.extra && props.extra.code !== "" ? props.extra.code : "",
        comment: objValues.comment,
        partnerNotificationService: objValues.partnerNotificationService,
        familyIndex: objValues.familyIndex,
      };

      props.setPatientObj({ ...props.patientObj, ...objValues });

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
      }
    } else {
      toast.error("All fields are required", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>CLIENT INTAKE FORM </h2>
          <br />
          <form>
            <div className="row">
              <div className="row">
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
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disableVitals}
                    />
                  </FormGroup>
                  {errors.serialNumber !== "" ? (
                    <span className={classes.error}>{errors.serialNumber}</span>
                  ) : (
                    ""
                  )}
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
                      disabled={true}
                      //value={Math.floor(Math.random() * 1093328)}
                      // onBlur={checkClientCode}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    />
                  </FormGroup>
                  {/* {errors.clientCode !== "" ? (
                      <span className={classes.error}>{errors.clientCode}</span>
                    ) : (
                      ""
                    )} */}
                  {clientCodeCheck !== "" ? (
                    <span className={classes.error}>{clientCodeCheck}</span>
                  ) : (
                    ""
                  )}
                </div>
                {/* <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for=""> Date Of Registration </Label>
                                <Input
                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                    name="dateOfRegistration"
                                    id="dateOfRegistration"
                                    value={objValues.dateOfRegistration}
                                    onChange={handleInputChange}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.dateOfRegistration !=="" ? (
                                    <span className={classes.error}>{errors.dateOfRegistration}</span>
                                ) : "" }
                                </FormGroup>
                            </div> */}
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
                    <option value={""}>Select</option>
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
                    Visit Date <span style={{ color: "red" }}> *</span>{" "}
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
                    min="1929-12-31"
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
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">
                    First Name <span style={{ color: "red" }}> *</span>
                  </Label>
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
                    disabled={disableVitals}
                  />
                  {errors.firstName !== "" ? (
                    <span className={classes.error}>{errors.firstName}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">Middle Name</Label>
                  <Input
                    type="text"
                    name="otherName"
                    id="otherName"
                    value={objValues.otherName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disableVitals}
                  />
                  {errors.otherName !== "" ? (
                    <span className={classes.error}>{errors.otherName}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="">
                    Last Name <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="text"
                    name="surname"
                    id="surname"
                    value={objValues.surname}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disableVitals}
                  />
                  {errors.surname !== "" ? (
                    <span className={classes.error}>{errors.surname}</span>
                  ) : (
                    ""
                  )}
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
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dob"
                    id="dob"
                    min={objValues.dateVisit}
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
              {/*<div className="form-group mb-3 col-md-4">*/}
              {/*  <FormGroup>*/}
              {/*    <Label for="">*/}
              {/*      Phone Number <span style={{ color: "red" }}> *</span>*/}
              {/*    </Label>*/}

              {/*    <PhoneInput*/}
              {/*      containerStyle={{*/}
              {/*        width: "100%",*/}
              {/*        border: "1px solid #014D88",*/}
              {/*      }}*/}
              {/*      inputStyle={{ width: "100%", borderRadius: "0px" }}*/}
              {/*      country={"ng"}*/}
              {/*      placeholder="(234)7099999999"*/}
              {/*      minLength={10}*/}
              {/*      name="phoneNumber"*/}
              {/*      id="phoneNumber"*/}
              {/*      masks={{ ng: "...-...-....", at: "(....) ...-...." }}*/}
              {/*      value={objValues.phoneNumber}*/}
              {/*      onChange={(e) => {*/}
              {/*        checkPhoneNumberBasic(e, "phoneNumber");*/}
              {/*      }}*/}
              {/*      //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}*/}
              {/*    />*/}
              {/*    {errors.phoneNumber !== "" ? (*/}
              {/*      <span className={classes.error}>{errors.phoneNumber}</span>*/}
              {/*    ) : (*/}
              {/*      ""*/}
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
                    // disabled
                  />
                  {errors.phoneNumber !== "" ? (
                    <span className={classes.error}>{errors.phoneNumber}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    State <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="stateId"
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Address <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="textarea"
                    name="address"
                    id="address"
                    value={objValues.address}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  />
                  {errors.address !== "" ? (
                    <span className={classes.error}>{errors.address}</span>
                  ) : (
                    ""
                  )}
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
                    disabled={disableSex}
                  >
                    <option value={""}></option>

                    {sexs.map((value) => (
                      <option key={value.id} value={value.display}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.sex !== "" ? (
                    <span className={classes.error}>{errors.sex}</span>
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
              {!shouldHideMaritalFields() && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>Marital Status</Label>
                    <select
                      className="form-control"
                      name="maritalStatusId"
                      id="maritalStatusId"
                      value={objValues.maritalStatusId}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value={""}></option>
                      {maritalStatus.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              )}

              {!shouldHideMaritalFields() &&
                (props.patientObj.personResponseDto.sex === "Male" ||
                  props.patientObj.personResponseDto.sex === "male" ||
                  props.patientObj.personResponseDto.sex === "MALE") && (
                  <div className="form-group col-md-4">
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
                        readOnly={props?.activePage?.actionType === "view"}
                      />
                    </FormGroup>
                  </div>
                )}
              {/* && objValues.maritalStatusId==='6' */}
              {!shouldHideMaritalFields() && (
                <div className="form-group col-md-4">
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
                      readOnly={props?.activePage?.actionType === "view"}
                    />
                  </FormGroup>
                </div>
              )}
              {/* objValues.maritalStatusId==='6' && */}

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
                          objValues.age > 14 &&
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
                    disabled={disableIndexInfo}
                  >
                    <option value={""}>Select</option>
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
                        disabled={disableIndexInfo}
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
                        Index Client Code/ID
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
                        disabled={disableIndexInfo}
                      />
                      {errors.indexClientCode !== "" ? (
                        <span className={classes.error}>
                          {errors.indexClientCode}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                    {clientCodeetail2 !== "" ? (
                      <span className={classes.error}>{clientCodeetail2}</span>
                    ) : (
                      ""
                    )}
                    {clientCodeetail !== "" ? (
                      <span className={classes.success}>{clientCodeetail}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </>
              )}

              {objValues.sex === "Female" && (
                <>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Pregnant Status <span style={{ color: "red" }}> *</span>
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
                            .testingSetting === "FACILITY_HTS_TEST_SETTING_ANC"
                            ? true
                            : false
                        }
                      >
                        <option value={""}></option>
                        {pregnancyStatus.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.display}
                          </option>
                        ))}
                      </select>
                      {errors.pregnant !== "" ? (
                        <span className={classes.error}>{errors.pregnant}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  {/*objValues.pregnant === "" &&
                      (objValues.pregnant !== 73 ||
                        objValues.pregnant !== "73") && (
                        <div className="form-group  col-md-4">
                          <FormGroup>
                            <Label>Breast Feeding</Label>
                            <select
                              className="form-control"
                              name="breastFeeding"
                              id="breastFeeding"
                              value={objValues.breastFeeding}
                              onChange={handleInputChange}
                              style={{
                                border: "1px solid #014D88",
                                borderRadius: "0.2rem",
                              }}
                            >
                              <option value={""}>Select</option>
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
                    First time visit <span style={{ color: "red" }}>*</span>
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
                    <option value={""}>Select</option>
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
                    <span style={{ color: "red" }}>*</span>
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
                    <option value={""}>Select</option>
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
                    Type of Counseling <span style={{ color: "red" }}>*</span>
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
                    <option value={""}>Select</option>
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
                    content="Saves & Continue"
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

export default BasicInfo;
