import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { Label as LabelRibbon, Message } from "semantic-ui-react";
import PhoneInput from "react-phone-input-2";
import { Table } from "react-bootstrap";
import { Icon, List, Label as LabelSui } from "semantic-ui-react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

import Select from "react-select";
// import { getAcount } from "../../../../utility";
import Cookies from "js-cookie";
import {
  getAllStateByCountryId,
  getAllCountry,
  getAllProvinces,
  getAllGenders,
  alphabetOnly,
} from "../../../../utility";

import { calculate_age } from "../../utils/index.js";
import { LiveHelp } from "@material-ui/icons";
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

const FamilyIndexTestingForm = (props) => {
  const classes = useStyles();
  let history = useHistory();
  let VL = "";
  const [errors, setErrors] = useState({});
  const [codesets, setCodesets] = useState({})
  const [ageDisabled2, setAgeDisabled2] = useState(true);
  const [saving, setSaving] = useState(false);
  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [setting, setSetting] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [isClientCurrentlyOnHiv, setClientCurrentlyOnHiv] = useState(true);
  const [states, setStates] = useState([]);
  const [genders, setGenders] = useState([]);
  const [hivStatus, setHivStatus] = useState([]);
  const [indexClientConfirmedHivPositive, setIndexClientConfirmedHivPositive] =
    useState(false);
  const [familyRelationship, setFamilyRelationship] = useState([]);
  const [selectedFamilyIndex, setSelectedFamilyIndex] = useState({});
  const [statusOfContact, setFamilyIndexHivStatus] = useState([]);
  const [familyIndex, setFamilyIndex] = useState([]);
  const [followUpAppointmentLocation, setFollowUpAppointmentLocation] =
    useState([]);
  const [childNumber, setChildNumber] = useState([]);
  const [indexVisitAttempt, setIndexVisitAttempt] = useState([]);
  const [isWillingToHaveChildrenTested, setIsWillingToHaveChildrenTested] =
    useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [retrieveFromIdToCode, setRetrieveFromIdToCode] = useState(true);

  const [stateInfo, setStateInfo] = useState(
    props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
      ? props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
      : props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
  );
  const [permissions, setPermission] = useState(
    localStorage.getItem("permissions")?.split(",")
  );

  const [lgaInfo, setLgaInfo] = useState(
    props?.basicInfo?.personResponseDto?.address?.address[0].district
      ? props?.basicInfo?.personResponseDto?.address?.address[0].district
      : props?.patientObj?.personResponseDto?.address?.address[0].district
  );
  const [facilityName, setFacilityName] = useState(Cookies.get("facilityName"));
  const [facilityInfo, setFacilityInfo] = useState(props?.organizationInfo);
  const [contactId, setContactId] = useState("");
  const [familyIndexRequestDto, setFamilyIndexRequestDto] = useState({
    childNumber: "",
    otherChildNumber: "",
    age: "",
    childDead: "",
    dateOfBirth: "",
    dateOfHts: "",
    familyRelationship: "",
    statusOfContact: "",
    motherDead: "",
    yearMotherDead: "",
    yearChildDead: "",
    uan: "",
    liveWithParent: "",
    isDateOfBirthEstimated: "",
    firstName: props?.patientObj?.personResponseDto?.firstName,
    middleName: props?.patientObj?.personResponseDto?.otherName,
    lastName: props?.patientObj?.personResponseDto?.surname,
  });

  const [arrayFamilyIndexRequestDto, setArrayFamilyIndexRequestDto] = useState(
    []
  );
  const [
    arrayFamilyTestingTrackerRequestDTO,
    setArrayFamilyTestingTrackerRequestDTO,
  ] = useState([]);
  const [errorFamilyIndexDTO, setErrorFamilyIndexDTO] = useState({});
  const [errorFamilyIndexTracker, setErrorFamilyIndexDTOTracker] = useState({});

  const [addIndexTracker, setaAddIndexTracker] = useState(false);
  const [addIndexTracker2, setaAddIndexTracker2] = useState(false);
  const [disableCurrenTreatment, setDisableCurrenTreatment] = useState(false);
  const [disableVL, setDisableVL] = useState(false);
  const [htsClientUUID, setHtsClientUUID] = useState("");
  const [familyTestingTrackerRequestDTO, setFamilyTestingTrackerRequestDTO] =
    useState({
      attempt: "",
      dateEnrolledInOVC: "",
      dateEnrolledOnArt: "",
      dateTested: "",
      dateVisit: "",
      facilityId: "",
      followUpAppointmentLocation: "",
      hiveTestResult: "",
      knownHivPositive: "",
      ovcId: "",
      positionOfChildEnumerated: "",
      scheduleVisitDate: "",
      trackerAge: "",
      trackerSex: "",
    });
  const [payload, setPayload] = useState({
    age: null,
    alternatePhoneNumber: "",
    dateClientEnrolledOnTreatment: "",
    dateIndexClientConfirmedHivPositiveTestResult:
      props?.patientObj?.confirmatoryTest2?.date2,
    dateOfBirth: props?.patientObj?.personResponseDto?.dateOfBirth,
    extra: {},
    facilityName: "",
    familyIndexClient: "",
    familyIndexRequestDto: {
      childNumber: 0,
      otherChildNumber: 0,
      familyRelationship: "",
      motherDead: "",
      yearMotherDead: "",

      familyTestingTrackerRequestDTOs: [],

      // not there
      statusOfContact: "",
      familyIndexTestingUuid: "",
    },

    htsClientId: props && props.patientObj ? props.patientObj?.id : "",
    htsClientUuid: props?.patientObj?.htsClientUUid
      ? props?.patientObj?.htsClientUUid
      : props?.basicInfo?.htsClientUUid
        ? props?.basicInfo?.htsClientUUid
        : JSON.parse(localStorage.getItem("htsClientUUid")),
    indexClientId: props?.patientObj?.clientCode,
    isClientCurrentlyOnHivTreatment: "",
    lga: "",
    maritalStatus: props?.patientObj?.personResponseDto?.maritalStatus?.id,
    name: props?.patientObj?.personResponseDto?.firstName,
    phoneNumber:
      props?.patientObj?.personResponseDto?.contactPoint?.contactPoint[0]
        ?.value,
    recencyTesting: (() => {
      if (
        props?.patientObj?.recency?.finalRecencyResult &&
        props?.patientObj?.recency?.finalRecencyResult !== ""
      ) {
        return props.patientObj.recency.finalRecencyResult;
      } else if (
        props?.patientObj?.recency?.rencencyInterpretation &&
        props?.patientObj?.recency?.rencencyInterpretation !== ""
      ) {
        return props.patientObj.recency.rencencyInterpretation;
      } else {
        return "Not Done";
      }
    })(),
    setting: props.patientObj.testingSetting,
    // chnage position
    visitDate: "",
    sex: props?.patientObj?.personResponseDto?.gender?.id,
    state: "",
    willingToHaveChildrenTestedElseWhere: "",

    reasonForIndexClientDateHivConfirmedNotSelected: "",
    address: props?.patientObj?.personResponseDto?.address?.address[0].city,
    // recencyTesting: "",
    virallyUnSuppressed: "",
  });

  const fetchHtsClientUuid = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}hts-family-index-testing/hts-client-uuid?clientCode=${encodeURIComponent(props?.patientObj?.clientCode)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHtsClientUUID(response.data.uuid);
    } catch (error) {
      return "";
    }
  };

  const [lgas, setLGAs] = useState([]);
  const [facilities, setFacilities1] = useState([]);
  const [selectedState, setSelectedState] = useState({});
  const [selectedFacility, setSelectedFacility] = useState({});
  const [selectedLga, setSelectedLga] = useState({});
  const [showHTSDate, setShowHTSDate] = useState(false);
  const [showOther, setShowOther] = useState(false);

  const loadStates = () => {
    axios
      .get(`${baseUrl}organisation-units/parent-organisation-units/1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          setStates(response.data);
        }
      })
      .catch((e) => { });
  };

  const loadOtherForm = (row) => {
    // setSaving(true);
    //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
    toggle();
  };
  const loadLGA = (id) => {
    axios
      .get(`${baseUrl}organisation-units/parent-organisation-units/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          setLGAs(response.data);
          // const selectedLga = response.data.find(lga => lga.id === id);
          // setPayload(prevPayload => ({ ...prevPayload, lgaTransferTo: selectedLga ? selectedLga.name : "" }));
        }
      })
      .catch((e) => {

      });
  };
  const handleItemClick = (next, present) => {
    props.handleItemClick(next);
    if (props.completed.includes(present)) {
    } else {
      props.setCompleted([...props.completed, present]);
    }
  };

  //Date of Birth and Age handle
  const handleDobChange2 = (e) => {
    setErrors({ ...errors, [e.target.value]: "" });
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
      familyIndexRequestDto.age = age_now;
      familyTestingTrackerRequestDTO.trackerAge = age_now;

      //setBasicInfo({...basicInfo, age: age_now});
    } else {
      setFamilyIndexRequestDto({ ...familyIndexRequestDto, age: "" });
    }
    setFamilyIndexRequestDto({
      ...familyIndexRequestDto,
      dateOfBirth: e.target.value,
    });

    // if (familyIndexRequestDto.age !== "" && familyIndexRequestDto.age >= 85) {
    //   toggle();
    // }
  };

  const loadFacilities = (id) => {
    axios
      .get(`${baseUrl}organisation-units/parent-organisation-units/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          setFacilities1(response.data);
        }
      })
      .catch((e) => {

      });
  };

  const getIntPosition = (ex) => {
    let code = [];

    let main = childNumber.map((each, index) => {
      if (each.code !== "CHILD_NUMBER_OTHERS") {
        code.push({
          id: each.id,
          value: index + 1,
        });
      }
    });

    if (ex) {
      let ans = code.filter((each) => {
        return each.id === parseInt(ex);
      });

      let result = ans.length > 0 ? ans[0].value : "";
      return result;
    } else {
      return "";
    }
  };

  const TargetGroupSetup = () => {
    axios
      .get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFacilityInfo(response.data);
      })
      .catch((error) => {

      });
  };





  useEffect(() => {
    getContactId();
    fetchHtsClientUuid();
  }, []);

  const getContactId = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}hts-family-index-testing/get-contact-id?htsClientId=${props.patientObj.id ? props.patientObj.id : props.basicInfo.id
        }&clientCode=${props?.patientObj?.clientCode
          ? props?.patientObj?.clientCode
          : props?.basicInfo?.clientCode
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newContactId = response.data;

      setContactId(newContactId);

      setFamilyIndexRequestDto((prevState) => ({
        ...prevState,
        contactId: newContactId,
      }));

      setPayload((prevState) => ({
        ...prevState,
        contactId: newContactId,
        familyIndexRequestDto: {
          ...prevState.familyIndexRequestDto,
          contactId: newContactId,
        },
      }));

      return newContactId;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {

    loadStates();
    getCountry();
    getStateByCountryId();
    getVL();
    getCurrentTreatment();

    if (
      props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId ||
      props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
    ) {
      loadLGA(
        props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
          ? props?.basicInfo?.personResponseDto?.address?.address[0]?.stateId
          : props?.patientObj?.personResponseDto?.address?.address[0]?.stateId
      );
    }

    if (props.organizationInfo) {
      TargetGroupSetup();
    }
  }, []);

  //Get list of State
  const getStateByCountryId = () => {
    getAllStateByCountryId()
      .then((res) => {
        setStates(res);
      })
      .catch(() => { });
  };
  const checkPhoneNumberBasic = (e, inputName) => {
    if (e) {
      setErrors({ ...errors, phoneNumber: "" });
    }
    const limit = 10;

    if (inputName === "phoneNumber") {
      setPayload({ ...payload, phoneNumber: e.slice(0, limit) });
    } else if (inputName === "alternatePhoneNumber") {
      setPayload({ ...payload, alternatePhoneNumber: e.slice(0, limit) });
    } else if (inputName === "phoneNoOfReferrringFacility") {
      setPayload({
        ...payload,
        phoneNoOfReferrringFacility: e.slice(0, limit),
      });
    } else if (inputName === "phoneNoOfRecievingFacility") {
      setPayload({ ...payload, phoneNoOfRecievingFacility: e.slice(0, limit) });
    }
  };

  // handle Facility Name to slect drop down
  const handleInputChangeObject = (e) => {
    setPayload({
      ...payload,
      nameOfRecievingFacility: e.name,
      addressOfRecievingFacility: e.parentParentOrganisationUnitName,
      // lgaTransferTo: e.parentOrganisationUnitName,
    });
    setErrors({ ...errors, nameOfRecievingFacility: "" });
    // setSelectedState(e.parentParentOrganisationUnitName);
    // setSelectedLga(e.parentOrganisationUnitName);
  };

  const convertIdToCode = (id) => {
    if (id) {
      let ans = childNumber.filter((each) => {
        return each.code === "CHILD_NUMBER_OTHERS";
      });

      if (ans[0].id === parseInt(id)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  // handlefamilyIndexRequestDto
  const handlefamilyIndexRequestDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setErrorFamilyIndexDTO({ ...errorFamilyIndexDTO, [e.target.name]: "" });
    setaAddIndexTracker(false);


    if (e.target.name === "childNumber") {
      setErrors({ ...errors, otherChildNumber: "" });

      let res = convertIdToCode(e.target.value);
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        [e.target.name]: e.target.value,
        otherChildNumber: "",
      });

      if (res) {
        setShowOther(true);
      } else {
        let deductedValue = getIntPosition(e.target.value);
        //set position to child number
        setFamilyTestingTrackerRequestDTO({
          ...familyTestingTrackerRequestDTO,
          positionOfChildEnumerated: deductedValue,
        });
        setShowOther(false);
      }
    } else if (e.target.name === "otherChildNumber") {
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        [e.target.name]: e.target.value,
      });
      setFamilyTestingTrackerRequestDTO({
        ...familyTestingTrackerRequestDTO,
        positionOfChildEnumerated: e.target.value,
      });
    } else if (e.target.name === "statusOfContact") {
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        [e.target.name]: e.target.value,
      });

      if (
        e.target.value === "FAMILY_INDEX_HIV_STATUS_CURRENT_ON_ART" ||
        e.target.value === "FAMILY_INDEX_HIV_STATUS_HIV_POSITIVE" ||
        e.target.value === "FAMILY_INDEX_HIV_STATUS_HIV_POSITIVE" ||
        e.target.value === "FAMILY_INDEX_HIV_STATUS_HIV_POSITIVE" ||
        e.target.value ===
        "FAMILY_INDEX_HIV_STATUS_REFERRED_ESCORTED_FOR_ART_INITIATION"
      ) {
        setShowHTSDate(true);
      }
    } else {
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        [e.target.name]: e.target.value,
      });
    }

    // clearf the error with e.target.name
    setErrors({ ...errors, [e.target.name]: "" });
  };
  // handlefamilyIndexRequestDto
  const handlefamilyTestingTrackerRequestDTO = (e) => {
    setErrorFamilyIndexDTOTracker({
      ...errorFamilyIndexTracker,
      [e.target.name]: "",
    });
    setaAddIndexTracker2(false);

    if (e.target.name === "positionOfChildEnumerated") {
      if (e.target.value > -1) {
        setFamilyTestingTrackerRequestDTO({
          ...familyTestingTrackerRequestDTO,
          [e.target.name]: e.target.value,
        });
      }
    } else if (e.target.name === "trackerAge") {
      if (e.target.value > -1) {
        setFamilyTestingTrackerRequestDTO({
          ...familyTestingTrackerRequestDTO,
          [e.target.name]: e.target.value,
        });
      }
    } else {
      setFamilyTestingTrackerRequestDTO({
        ...familyTestingTrackerRequestDTO,
        [e.target.name]: e.target.value,
      });
    }

    // clearf the error with e.target.name
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleDone = () => {
    toggle();
    handleItemClick("new-referral", "");
  };

  const loadNextForm = (row) => {
    handleItemClick("pns", "fit");
  };

  const getSelectedDFamilyIndex = (relationship) => {
    // use the code to get object in the codeset
    let result = familyIndex.filter((each, index) => {
      return each.code === relationship;
    });
    // filter family relationship
    let result2 = familyRelationship.filter((each, index) => {
      if (
        each.display === "Biological Child" &&
        result[0].display === "Child"
      ) {
        return each;
      } else {
        return each.display === result[0].display;
      }
    });

    if (result2.length > 0) {
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        familyRelationship: result2[0].code,
      });
    }
  };

  //fetch province
  const getProvinces = (e) => {
    const stateId = e.target.value;
    if (e.target.value) {
      setErrors({ ...errors, stateId: "" });
    }
    setPayload({ ...payload, stateId: e.target.value });
    getAllProvinces(stateId)
      .then((res) => {
        setProvinces(res);
      })
      .catch((e) => { });
  };
  const getCountry = () => {
    getAllCountry()
      .then((res) => {
        setCountries(res);
      })
      .catch((e) => {

      });
  };

  const handleFamilyRelationshipChange = (e) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: value,
      // Reset childNumber when family relationship changes
      childNumber:
        value === "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD"
          ? ""
          : prevPayload.childNumber,
      // Reset statusOfContact when family relationship changes, where mother = '1293', father = '1294', biological child = '1295', siblings = '1296'
      statusOfContact: [
        "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD",
        "FAMILY_RELATIONSHIP_FATHER",
        "FAMILY_RELATIONSHIP_MOTHER",
        "FAMILY_RELATIONSHIP_SIBLINGS",
      ].includes(value)
        ? ""
        : prevPayload.statusOfContact,
      // Reset uan when family relationship changes
      uan:
        value === "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD" ||
          value === "FAMILY_RELATIONSHIP_FATHER" ||
          value === "FAMILY_RELATIONSHIP_MOTHER" ||
          value === "FAMILY_RELATIONSHIP_SIBLINGS"
          ? ""
          : prevPayload.uan,
      // Reset motherDead when family relationship changes
      motherDead:
        value === "FAMILY_RELATIONSHIP_MOTHER" ||
          value === "FAMILY_RELATIONSHIP_FATHER" ||
          value === "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD"
          ? ""
          : prevPayload.motherDead,
      // Reset yearMotherDied when family relationship changes
      yearMotherDied:
        value === "FAMILY_RELATIONSHIP_MOTHER" ||
          value === "FAMILY_RELATIONSHIP_FATHER" ||
          value === "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD"
          ? ""
          : prevPayload.yearMotherDied,
    }));
  };

  //Get list of HIV STATUS ENROLLMENT

  const convertCodeToDisplay = (type, value) => {
    let data = "";
    if (type === "familyRelationship") {
      data = familyRelationship.filter((each) => {
        if (each.code === value) {
          return each;
        }
      });

      return data[0].display;
    }
    if (type === "statusOfContact") {
      data = statusOfContact.filter((each) => {
        if (each.code === value) {
          return each;
        }
      });

      return data[0].display;
    }
    if (type === "statusOfContact") {
      data = statusOfContact.filter((each) => {
        if (each.code === value) {
          return each;
        }
      });

      return data[0].display;
    }
  };

  // const removeFamilyIndexRow = (index) => {
  //   arrayFamilyIndexRequestDto.splice(index, 1);
  //   setArrayFamilyIndexRequestDto([...arrayFamilyIndexRequestDto]);
  // };

  // const removeFamilyTrackerRow = (index) => {
  //   arrayFamilyTestingTrackerRequestDTO.splice(index, 1);
  //   setArrayFamilyTestingTrackerRequestDTO([
  //     ...arrayFamilyTestingTrackerRequestDTO,
  //   ]);
  // };
  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    const { name, value } = e.target;

    if (name === "contactId") {
      setContactId(value);

      setFamilyIndexRequestDto((prevState) => ({
        ...prevState,
        contactId: value,
      }));

      setPayload((prevState) => ({
        ...prevState,
        contactId: value,
        familyIndexRequestDto: {
          ...prevState.familyIndexRequestDto,
          contactId: value,
        },
      }));
    } else if (e.target.name === "name" || e.target.name === "lastName") {
      const name = alphabetOnly(e.target.value);
      setPayload((prevState) => ({
        ...prevState,
        [e.target.name]: name,
      }));
    } else if (name === "willingToHaveChildrenTested") {
      setPayload((prevState) => ({
        ...prevState,
        [name]: value,
        familyIndexTracker: {
          ...prevState.familyIndexTracker,
          positionOfChildEnumerated:
            value === "Yes"
              ? prevState.familyIndexTracker.positionOfChildEnumerated
              : "",
          trackerSex:
            value === "Yes" ? prevState.familyIndexTracker.trackerSex : "",
          trackerAge:
            value === "Yes" ? prevState.familyIndexTracker.trackerAge : "",
          scheduleVisitDate:
            value === "Yes"
              ? prevState.familyIndexTracker.scheduleVisitDate
              : "",
          followUpAppointmentLocation:
            value === "Yes"
              ? prevState.familyIndexTracker.followUpAppointmentLocation
              : "",
          dateVisit:
            value === "Yes" ? prevState.familyIndexTracker.dateVisit : "",
          knownHivPositive:
            value === "Yes"
              ? prevState.familyIndexTracker.knownHivPositive
              : "",
          dateTested:
            value === "Yes" ? prevState.familyIndexTracker.dateTested : "",
          hivTestResult:
            value === "Yes" ? prevState.familyIndexTracker.hivTestResult : "",
          dateEnrolledInOVC:
            value === "Yes"
              ? prevState.familyIndexTracker.dateEnrolledInOVC
              : "",
          dateEnrolledOnArt:
            value === "Yes"
              ? prevState.familyIndexTracker.dateEnrolledOnArt
              : "",
          attempt: value === "Yes" ? prevState.familyIndexTracker.attempt : "",
        },
      }));
    } else if (e.target.name === "middleName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (e.target.name === "indexClientId" && e.target.value !== "") {
      //    setPayload({...payload, [e.target.name]: name })
    } else if (e.target.name === "dateIndexConfirmedHiv") {
      if (e.target.value !== "") {
        const name = e.target.name;
        setPayload({ ...payload, [e.target.name]: name });
        setIndexClientConfirmedHivPositive(false); // Hide extra fields when date is selected
      } else {
        setIndexClientConfirmedHivPositive(true); // Show extra fields if date is not selected
      }
    } else if (
      e.target.name === "nameOfContactPerson" &&
      e.target.value !== ""
    ) {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (
      e.target.name === "nameOfPersonRefferringClient" &&
      e.target.value !== ""
    ) {
      const name = alphabetOnly(e.target.value);
      setPayload({ ...payload, [e.target.name]: name });
    } else if (e.target.name === "hospitalNumber" && e.target.value !== "") {
      async function getHosiptalNumber() {
        const hosiptalNumber = e.target.value;
        const response = await axios.post(
          `${baseUrl}patient/exist/hospital-number`,
          hosiptalNumber,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data !== true) {
          setHospitalNumStatus(false);
          errors.hospitalNumber = "";
        } else {
          errors.hospitalNumber = "";
          toast.error("Error! Hosiptal Number already exist");
          setHospitalNumStatus(true);
        }
      }

      getHosiptalNumber();
    } else if (e.target.name === "familyIndexClient" && e.target.value !== "") {
      getSelectedDFamilyIndex(e.target.value);

      setPayload({
        ...payload,
        [e.target.name]: e.target.value,
        trackerSex:
          e.target.value === "FAMILY_INDEX_MOTHER"
            ? "SEX_FEMALE"
            : e.target.value === "FAMILY_INDEX_FATHER"
              ? "SEX_MALE"
              : "",
      });
    } else {
      setPayload({ ...payload, [e.target.name]: e.target.value });
    }
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
      payload.age = age_now;

      //setpayload({...payload, age: age_now});
    } else {
      setPayload({ ...payload, age: "" });
    }
    setPayload({ ...payload, [e.target.name]: e.target.value });

    setPayload({ ...payload, dateOfBirth: e.target.value });
    if (payload.age !== "" && payload.age <= 15) {
      // props.setHideOtherMenu(true);
    } else if (payload.age !== "" && payload.age > 15) {
      // props.setHideOtherMenu(true);
    } else {
      // props.setHideOtherMenu(true);
    }

    // if (payload.age !== "" && payload.age >= 85) {
    //   toggle();
    // }
  };
  const handleDateOfBirthChange = (e) => {
    if (e.target.value == "Actual") {
      familyIndexRequestDto.isDateOfBirthEstimated = false;
      setAgeDisabled2(true);
    } else if (e.target.value == "Estimated") {
      familyIndexRequestDto.isDateOfBirthEstimated = true;
      setAgeDisabled2(false);
    }
  };
  useEffect(() => {
    // Only run this if we haven't initialized yet
    if (payload.age === null) {
      const dob =
        props?.basicInfo?.personResponseDto?.dateOfBirth ||
        props?.patientObj?.personResponseDto?.dateOfBirth;

      if (dob) {
        const calculatedAge = calculate_age(dob);
        setPayload({
          ...payload,
          age: calculatedAge,
          dateOfBirth: dob,
        });
      }
    }
  }, []);

  const handleAgeChange = (e) => {
    e.preventDefault();
    if (!ageDisabled) {
      const enteredAge = e.target.value;

      // Get current year and subtract age
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - enteredAge;

      // Always set to January 1st
      const dobNew = `${birthYear}-01-01`;

      setPayload({
        ...payload,
        dateOfBirth: dobNew,
        age: enteredAge,
      });
    }
  };

  const getCurrentTreatment = async () => {
    await axios
      .get(
        `${baseUrl}hts-family-index-testing/getCurrentTreatment?personUuid=${props.patientObj.personResponseDto.uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          setPayload({
            ...payload,
            isClientCurrentlyOnHivTreatment: "Yes",
            dateClientEnrolledOnTreatment: response.data,
            virallyUnSuppressed: VL,
          });
          setDisableCurrenTreatment(true);
        }
      })
      .catch((e) => {

      });
  };

  const getVL = async () => {
    await axios
      .get(
        `${baseUrl}hts-family-index-testing/getViralLoad?personUuid=${props.patientObj.personResponseDto.uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          if (parseInt(response.data) >= 0) {
            if (parseInt(response.data) > 1000) {
              setPayload({ ...payload, virallyUnSuppressed: "Yes" });
              setDisableVL(true);
              VL = "Yes";
            } else if (parseInt(response.data) < 1000) {
              setPayload({ ...payload, virallyUnSuppressed: "No" });
              setDisableVL(true);
              VL = "No";
            }
          }
        }
      })
      .catch((e) => {

      });
  };

  // NU-23-0064

  const handleAgeChange2 = (e) => {
    e.preventDefault();

    setErrors({ ...errors, [e.target.name]: "" });
    if (!ageDisabled2) {
      // if (e.target.value !== "" && e.target.value >= 85) {
      //   toggle();

      // }
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate.toISOString());
      const dobNew = estDob.add(e.target.value * -1, "years");
      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        dateOfBirth: moment(dobNew).format("YYYY-MM-DD"),
      });
      familyIndexRequestDto.dateOfBirth = moment(dobNew).format("YYYY-MM-DD");

      setFamilyIndexRequestDto({
        ...familyIndexRequestDto,
        age: e.target.value,
      });
      setFamilyTestingTrackerRequestDTO({
        ...familyTestingTrackerRequestDTO,
        trackerAge: e.target.value,
      });
    }
  };

  //End of Date of Birth and Age handling
  /*****  Validation  */
  const validate = () => {
    temp.familyIndexClient = payload.familyIndexClient
      ? ""
      : "This field is required.";

    temp.familyRelationship = familyIndexRequestDto.familyRelationship
      ? ""
      : "This field is required.";

    temp.dateOfBirth = familyIndexRequestDto.dateOfBirth
      ? ""
      : "This field is required.";

    temp.statusOfContact = familyIndexRequestDto.statusOfContact
      ? ""
      : "This field is required.";

    //  familyIndexRequestDto.childNumber == retrieveFromIdToCode && ( temp.otherChildNumber= familyIndexRequestDto.otherChildNumber
    //       ? ""
    //       : "This field is required.")

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  const postPayload = (payload) => {
    axios
      .post(`${baseUrl}hts-family-index-testing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSaving(false);

        toast.success("Family Index form save succesfully!");
        handleItemClick("fit-history", "fit");

        // if (props.history) {
        //   handleItemClick("pns-history", "fit");
        // } else {
        //   loadOtherForm();
        // }

        // history.push({pathName: "/patient-history",
        //   state: {
        //     patientObject: props.basicInfo,
        //     patientObj: props.basicInfo,
        //     clientCode: props.basicInfo.clientCode,
        //   },}
        // );
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
  };

  useEffect(() => {
    if (
      props?.patientObj?.testingSetting ===
      "FACILITY_HTS_TEST_SETTING_PEDIATRIC"
    ) {
      setPayload((prevPayload) => ({
        ...prevPayload,
        familyIndexClient: "FAMILY_INDEX_CHILD",
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        familyIndexClient: "",
      }));
    }
  }, [props?.patientObj?.testingSetting]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create an array with the single tracker
    let arrOfFamilyTrackers = [familyTestingTrackerRequestDTO];

    familyTestingTrackerRequestDTO.facilityId =
      facilityInfo.currentOrganisationUnitId;

    let currentContactId;
    try {
      currentContactId = await getContactId();
    } catch (error) {
      toast.error("Failed to get contactId. Please try again.");
      return;
    }

    if (!currentContactId) {
      toast.error("Failed to get contactId. Please try again.");
      return;
    }

    const submissionPayload = {
      ...payload,
      htsClientUuid: htsClientUUID,
      contactId: currentContactId,
      familyIndexRequestDto: {
        ...familyIndexRequestDto,
        contactId: currentContactId,
        familyTestingTrackerRequestDTOs: arrOfFamilyTrackers,
      },
      state: stateInfo,
      lga: lgaInfo,
    };

    // Validate and submit if valid
    if (validate()) {
      postPayload(submissionPayload);
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
    setPayload({ ...payload, [inputName]: NumberValue });
    if (inputName === "phoneNumber") {
      setPayload({ ...payload, [inputName]: NumberValue });
    }
    if (inputName === "alternatePhoneNumber") {
      setPayload({ ...payload, [inputName]: NumberValue });
    }
  };

  const loadCodesets = (data) => {
    setCodesets(data)
    setMaritalStatus(data["MARITAL_STATUS"])
    setFamilyRelationship(data["FAMILY_RELATIONSHIP"])
    setFamilyIndexHivStatus(data["FAMILY_INDEX_HIV_STATUS"])
    setFamilyIndex(data["FAMILY_INDEX"])
    setFollowUpAppointmentLocation(data["FOLLOW UP_APPOINTMENT_LOCATION"])
    setChildNumber(data["CHILD_NUMBER"])

    let ans = data?.["CHILD_NUMBER"]?.filter?.((each) => {
      return each.code === "CHILD_NUMBER_OTHERS";
    });
    setRetrieveFromIdToCode(ans[0]?.id);

    setIndexVisitAttempt(data["INDEX_VISIT_ATTEMPTS"])
    setGenders(data["SEX"])

    if (props?.patientObj?.testingSetting?.toLowerCase() === "facility" 
    || 
    props?.patientObj?.testingSetting?.toLowerCase() === "hts_entry_point_facility") {
      setSetting(data["FACILITY_HTS_TEST_SETTING"])
    } 
    if (props.patientObj.testingSetting.toLowerCase() === "community" 
    || 
    props?.patientObj?.testingSetting?.toLowerCase() === "hts_entry_point_community") {
      setSetting(data["COMMUNITY_HTS_TEST_SETTING"])
    }

  }

  useGetCodesets({
    codesetsKeys: ["MARITAL_STATUS",
      "FAMILY_RELATIONSHIP",
      "FAMILY_INDEX_HIV_STATUS",
      "FAMILY_INDEX",
      "FOLLOW UP_APPOINTMENT_LOCATION",
      "CHILD_NUMBER",
      "INDEX_VISIT_ATTEMPTS",
      "SEX",
      "GENDER",
      "FACILITY_HTS_TEST_SETTING",
      "COMMUNITY_HTS_TEST_SETTING"
    ],
    patientId: props?.basicInfo?.personResponseDto?.address,
    onSuccess: loadCodesets
  })

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}> Family Index Testing Form</h2>
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
                SECTION A
              </div>
              <div className="row">
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label
                      for=""
                      style={{ color: "#014d88", fontWeight: "bolder" }}
                    >
                      State <span style={{ color: "red" }}> *</span>{" "}
                    </Label>
                    <Input
                      type="select"
                      name="stateId"
                      style={{
                        height: "40px",
                        border: "solid 1px #014d88",
                        borderRadius: "5px",
                        fontWeight: "bolder",
                        appearance: "auto",
                      }}
                      value={stateInfo}
                      required
                      // onChange={loadLGA1}
                      onChange={(e) => {
                        if (e.target.value !== "") {
                          const filterState = states.filter((st) => {
                            return Number(st.id) === Number(e.target.value);
                          });
                          setSelectedState(filterState);

                          setPayload((prevPayload) => ({
                            ...prevPayload,
                            stateId: filterState[0].id,
                          }));
                        }
                        loadLGA(e.target.value);
                      }}
                      disabled
                    >
                      <option>Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
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
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label
                      for=""
                      style={{ color: "#014d88", fontWeight: "bolder" }}
                    >
                      LGA <span style={{ color: "red" }}> *</span>
                    </Label>
                    <Input
                      type="select"
                      name="lgaId"
                      style={{
                        height: "40px",
                        border: "solid 1px #014d88",
                        borderRadius: "5px",
                        fontWeight: "bolder",
                        appearance: "auto",
                      }}
                      required
                      value={lgaInfo}
                      // onChange={loadFacilities1}
                      onChange={(e) => {
                        if (e.target.value !== "") {
                          const filterlga = lgas.filter((lg) => {
                            return Number(lg.id) === Number(e.target.value);
                          });
                          setSelectedLga(filterlga);
                          setPayload((prevPayload) => ({
                            ...prevPayload,
                            lgaId: filterlga[0].id,
                          }));
                        }
                        loadFacilities(e.target.value);
                      }}
                      disabled
                    >
                      <option>Select LGA</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.id}>
                          {lga.name}
                        </option>
                      ))}
                    </Input>
                    {errors.lgaId !== "" ? (
                      <span className={classes.error}>{errors.lgaId}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label
                      for=""
                      style={{ color: "#014d88", fontWeight: "bolder" }}
                    >
                      Facility Name
                      <span style={{ color: "red" }}> *</span>{" "}
                    </Label>
                    <Input
                      type="text"
                      name="facilityName"
                      style={{
                        height: "40px",
                        border: "solid 1px #014d88",
                        borderRadius: "5px",
                        fontWeight: "bolder",
                        appearance: "auto",
                      }}
                      value={facilityInfo.currentOrganisationUnitName}
                      required
                      onChange={(e) => {
                        // setPayload(prevPayload => ({ ...prevPayload, facilityTransferTo: e.target.value }));
                        if (e.target.value !== "") {
                          const filterFacility = facilities.filter((fa) => {
                            return Number(fa.id) === Number(e.target.value);
                          });
                          setSelectedFacility(filterFacility);
                          setPayload((prevPayload) => ({
                            ...prevPayload,
                            facilityName: filterFacility[0].name,
                          }));
                        }
                      }}
                      disabled
                    >
                      {/* <option>Select Facility</option>
                                          {facilities.map((facility) => (
                                              <option key={facility.id} value={facility.id}>
                                                  {facility.name}
                                              </option>
                                          ))} */}
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

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="">
                      Date <span style={{ color: "red" }}> *</span>{" "}
                    </Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="visitDate"
                      id="visitDate"
                      value={payload.visitDate}
                      onChange={handleInputChange}
                      min={props?.patientObj?.confirmatoryTest2?.date2}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      required
                    // disabled
                    />
                    {errors.visitDate !== "" ? (
                      <span className={classes.error}>{errors.visitDate}</span>
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
                      name="setting"
                      id="setting"
                      value={payload.setting}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={true}
                    >
                      <option value={""}></option>
                      {setting.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                    {errors.setting !== "" ? (
                      <span className={classes.error}>{errors.setting}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label>
                      Family Index client{" "}
                      <span style={{ color: "red" }}> *</span>
                    </Label>
                    <select
                      className="form-control"
                      name="familyIndexClient"
                      id="familyIndexClient"
                      onChange={handleInputChange}
                      value={
                        props?.patientObj?.testingSetting ===
                          "FACILITY_HTS_TEST_SETTING_PEDIATRIC"
                          ? "FAMILY_INDEX_CHILD"
                          : payload.familyIndexClient
                      }
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={
                        props?.patientObj?.testingSetting ===
                        "FACILITY_HTS_TEST_SETTING_PEDIATRIC"
                      }
                    >
                      <option value={""}>Select</option>
                      {familyIndex &&
                        familyIndex.map((x, index) => (
                          <option key={x.id} value={x.code}>
                            {x.display}
                          </option>
                        ))}
                    </select>
                    {errors.familyIndexClient !== "" ? (
                      <span className={classes.error}>
                        {errors.familyIndexClient}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="firstName">
                      First Name <span style={{ color: "red" }}> *</span>
                    </Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={familyIndexRequestDto.firstName}
                      onChange={handlefamilyIndexRequestDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                    {errors.name !== "" ? (
                      <span className={classes.error}>{errors.name}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="lastName">Middle Name</Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="name"
                      id="name"
                      value={familyIndexRequestDto.middleName}
                      onChange={handlefamilyIndexRequestDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                    {errors.name !== "" ? (
                      <span className={classes.error}>{errors.name}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="lastName">
                      Last Name <span style={{ color: "red" }}> *</span>
                    </Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="name"
                      id="name"
                      value={familyIndexRequestDto.lastName}
                      onChange={handlefamilyIndexRequestDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                    {errors.name !== "" ? (
                      <span className={classes.error}>{errors.name}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="firstName">
                      Index Client ID
                      <span style={{ color: "red" }}> *</span>
                    </Label>
                    <Input
                      className="form-control"
                      type="text"
                      name="indexClientId"
                      id="indexClientId"
                      value={payload.indexClientId}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                    {errors.indexClientId !== "" ? (
                      <span className={classes.error}>
                        {errors.indexClientId}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>
                      Sex<span style={{ color: "red" }}> *</span>
                    </Label>
                    <select
                      className="form-control"
                      name="sex"
                      id="sex"
                      onChange={handleInputChange}
                      value={payload.sex}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    >
                      <option value={""}>Select</option>
                      {genders &&
                        genders.map((gender, index) => (
                          <option key={gender.id} value={gender.id}>
                            {gender.display}
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

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      Date Of Birth<span style={{ color: "red" }}> *</span>
                    </Label>
                    <input
                      className="form-control"
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateOfBirth"
                      id="dateOfBirth"
                      min="1929-12-31"
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      value={payload.dateOfBirth}
                      onChange={handleDobChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                    {/* {errors.dateOfBirth !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfBirth}
                    </span>
                  ) : (
                    ""
                  )} */}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      Age <span style={{ color: "red" }}> *</span>
                    </Label>
                    <input
                      className="form-control"
                      type="number"
                      name="age"
                      id="age"
                      value={payload.age}
                      disabled={ageDisabled}
                      onChange={handleAgeChange}
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

                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>
                      Marital Status <span style={{ color: "red" }}> </span>
                    </Label>
                    <select
                      className="form-control"
                      name="maritalStatus"
                      id="maritalStatus"
                      value={payload.maritalStatus}
                      onChange={handleInputChange}
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
                  </FormGroup>
                </div>

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
                      value={payload.phoneNumber}
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

                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>
                      Alternative Contact Number
                      {/* <span style={{ color: "red" }}> *</span> */}
                    </Label>
                    <Input
                      type="text"
                      name="alternatePhoneNumber"
                      id="alternatePhoneNumber"
                      onChange={(e) => {
                        handleInputChangePhoneNumber(e, "alternatePhoneNumber");
                      }}
                      value={payload.alternatePhoneNumber}
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
                      Descriptive Residential Address{" "}
                      <span style={{ color: "red" }}> *</span>
                    </Label>
                    <input
                      className="form-control"
                      type="text"
                      name="address"
                      id="address"
                      value={payload.address}
                      disabled
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    />
                    {errors.address !== "" ? (
                      <span className={classes.error}>{errors.address}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="">
                      Date Of Index Client's confrimed HIV-positive test results{" "}
                      <span style={{ color: "red" }}> *</span>{" "}
                    </Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateIndexClientConfirmedHivPositiveTestResult"
                      id="dateIndexClientConfirmedHivPositiveTestResult"
                      value={
                        payload.dateIndexClientConfirmedHivPositiveTestResult
                      }
                      onChange={handleInputChange}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled
                    />
                    {errors.dateIndexClientConfirmedHivPositiveTestResult !==
                      "" ? (
                      <span className={classes.error}>
                        {errors.referralDate}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                {indexClientConfirmedHivPositive && (
                  <div className="form-group col-md-4">
                    <Label>
                      {" "}
                      Reason for not selecting Index client Hiv confirmed test
                      result Date ?{" "}
                    </Label>
                    <FormGroup>
                      <select
                        className="form-control"
                        name="reasonForIndexClientDateHivConfirmedNotSelected"
                        id="reasonForIndexClientDateHivConfirmedNotSelected"
                        onChange={handleInputChange}
                        value={
                          payload.reasonForIndexClientDateHivConfirmedNotSelected
                        }
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value="">Select</option>
                        <option value="Result not confirmed yet">
                          Result not confirmed yet
                        </option>
                        <option value="NA">NA</option>
                      </select>
                      {errors.reasonForIndexClientDateHivConfirmedNotSelected !==
                        "" ? (
                        <span className={classes.error}>
                          {
                            errors.reasonForIndexClientDateHivConfirmedNotSelected
                          }
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
                {/* )} */}

                <div className="form-group col-md-4 ">
                  <Label>
                    {" "}
                    Recency Testing{" "}
                    <span> (for newly tested HIV-positive only) </span>{" "}
                  </Label>

                  {/* {
                  <FormGroup>
                    <Input
                      className="form-control"
                      name="finalRecencyResult"
                      id="finalRecencyResult"
                      type="text"
                      disabled
                      // value={recency.finalRecencyResult}
                      // onChange={handleInputChangeRecency}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled
                    />
                  </FormGroup>
                } */}
                  <FormGroup>
                    <Input
                      type="text"
                      className="form-control"
                      name="recencyTesting"
                      id="reccencyTesting"
                      onChange={handleInputChange}
                      value={payload.recencyTesting}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled
                    />
                  </FormGroup>
                </div>

                {/* if index client is hiv positive, and date is selected */}
                <div className="form-group col-md-4 ">
                  <Label>Is client current on HIV treatment ?</Label>
                  <FormGroup>
                    <select
                      className="form-control"
                      name="isClientCurrentlyOnHivTreatment"
                      id="isClientCurrentlyOnHivTreatment"
                      onChange={handleInputChange}
                      value={payload.isClientCurrentlyOnHivTreatment}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disableCurrenTreatment}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormGroup>
                </div>

                {payload.isClientCurrentlyOnHivTreatment &&
                  payload.isClientCurrentlyOnHivTreatment === "Yes" && (
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
                          name="dateClientEnrolledOnTreatment"
                          id="dateClientEnrolledOnTreatment"
                          value={payload.dateClientEnrolledOnTreatment}
                          onChange={handleInputChange}
                          min={
                            payload.dateIndexClientConfirmedHivPositiveTestResult
                          }
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disableCurrenTreatment}
                        />
                        {errors.treatmentDate !== "" ? (
                          <span className={classes.error}>
                            {errors.referralDate}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  )}
                {payload.isClientCurrentlyOnHivTreatment &&
                  payload.isClientCurrentlyOnHivTreatment === "Yes" && (
                    <div className="form-group col-md-4 ">
                      <Label>virally unsuppressed</Label>
                      <FormGroup>
                        <select
                          className="form-control"
                          name="virallyUnSuppressed"
                          id="virallyUnSuppressed"
                          onChange={handleInputChange}
                          value={payload.virallyUnSuppressed}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disableVL}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </FormGroup>
                    </div>
                  )}
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="willingToHaveChildrenTestedElseWhere">
                      Are you willing to have your children tested elsewhere by
                      a health care worker?
                    </Label>
                    <select
                      className="form-control"
                      id="willingToHaveChildrenTestedElseWhere"
                      name="willingToHaveChildrenTestedElseWhere"
                      onChange={handleInputChange}
                      value={payload.willingToHaveChildrenTestedElseWhere}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormGroup>
                </div>
              </div>

              <br />
            </div>
            <div className="row">
              <div
                className="form-group col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#992E62",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                SECTION B: FAMILY INDEX
              </div>
            </div>
            <div className="row">
              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="familyRelationship">
                    Family Relationship
                    <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <select
                    className="form-control"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    id="familyRelationship"
                    name="familyRelationship"
                    onChange={handlefamilyIndexRequestDto}
                    value={familyIndexRequestDto.familyRelationship}
                  >
                    <option value="">Select</option>
                    {/* Filter family relationship options based on selected family index */}
                    {familyRelationship
                      .filter((relationship) => {
                        // Define mapping of family index codes to relationship display names to exclude
                        const familyIndexToRelationshipMap = {
                          FAMILY_INDEX_CHILD: ["Biological Child"],
                          FAMILY_INDEX_FATHER: ["Father"],
                          FAMILY_INDEX_MOTHER: ["Mother"],
                        };

                        // Get the effective family index value (considering auto-populated value)
                        const effectiveFamilyIndex =
                          props.patientObj.targetGroup === "TARGET_GROUP_PD"
                            ? "FAMILY_INDEX_CHILD"
                            : payload.familyIndexClient;

                        // Get relationships to exclude based on selected family index
                        const excludedRelationshipDisplays =
                          familyIndexToRelationshipMap[effectiveFamilyIndex] ||
                          [];

                        // Return true if this relationship should be included (not excluded)
                        return !excludedRelationshipDisplays.includes(
                          relationship.display
                        );
                      })
                      .map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                  </select>
                  {errors.familyRelationship && (
                    <span className={classes.error}>
                      {errors.familyRelationship}
                    </span>
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-2 col-md-4">
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
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <input
                    className="form-control"
                    type="date"
                    onKeyPress={(e) => {
                      e.preventDefault();
                    }}
                    name="dateOfBirth"
                    id="dateOfBirth"
                    // min={familyIndexRequestDto.dateVisit}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    value={familyIndexRequestDto.dateOfBirth}
                    onChange={handleDobChange2}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  />
                  {errors.dateOfBirth && (
                    <span className={classes.error}>{errors.dateOfBirth}</span>
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Age</Label>
                  <Input
                    className="form-control"
                    type="number"
                    name="age"
                    id="age"
                    value={familyIndexRequestDto.age}
                    disabled={ageDisabled2}
                    // onKeyUp={handleSubmitForm}
                    //  onKeyDown={testing}
                    // onKeyPress={testing}
                    onChange={handleAgeChange2}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  />
                </FormGroup>
              </div>

              {familyIndexRequestDto.familyRelationship ===
                "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD" && (
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="childNumber">Child Number</Label>
                      <select
                        className="form-control"
                        id="childNumber"
                        name="childNumber"
                        onChange={handlefamilyIndexRequestDto}
                        value={familyIndexRequestDto.childNumber}
                      >
                        <option value="">Select</option>
                        {childNumber.map((each) => (
                          <option key={each.id} value={each.id}>
                            {each.display}
                          </option>
                        ))}

                        {/* <option value="others">Others</option> */}
                      </select>
                      {errorFamilyIndexDTO.childNumber && (
                        <span className={classes.error}>
                          {errorFamilyIndexDTO.childNumber}
                        </span>
                      )}
                    </FormGroup>
                  </div>
                )}

              {showOther && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>
                      Others
                      <span style={{ color: "red" }}> *</span>
                    </Label>
                    <Input
                      type="number"
                      name="otherChildNumber"
                      id="otherChildNumber"
                      onChange={handlefamilyIndexRequestDto}
                      value={familyIndexRequestDto.otherChildNumber}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    />
                    {errors.otherChildNumber !== "" ? (
                      <span className={classes.error}>
                        {errors.otherChildNumber}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              {familyIndexRequestDto.familyRelationship ===
                "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD" && (
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="childNumber">Child Dead</Label>
                      <select
                        className="form-control"
                        id="childDead"
                        name="childDead"
                        onChange={handlefamilyIndexRequestDto}
                        value={familyIndexRequestDto.childDead}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      {/* {errorFamilyIndexDTO.childNumber && (
                    <span className={classes.error}>
                      {errorFamilyIndexDTO.childNumber}
                    </span>
                  )} */}
                    </FormGroup>
                  </div>
                )}
              {/* <div className="form-group col-md-4">
              <FormGroup>
                <Label for="DateofHTS">Other Child Number </Label>
                <Input
                  type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                  name="otherChildNumber"
                  id="otherChildNumber"
                  value={familyIndexRequestDto.otherChildNumber}
                  onChange={handlefamilyIndexRequestDto}
                  min="1929-12-31"
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  // disabled
                />
                {errorFamilyIndexDTO.familyRelationship && (
                  <span className={classes.error}>
                    {errorFamilyIndexDTO.familyRelationship}
                  </span>
                )}
              </FormGroup>
            </div> */}
              {familyIndexRequestDto.familyRelationship ===
                "FAMILY_RELATIONSHIP_BIOLOGICAL_CHILD" && (
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="liveWithParent">Live with Parent</Label>
                      <select
                        className="form-control"
                        id="liveWithParent"
                        name="liveWithParent"
                        onChange={handlefamilyIndexRequestDto}
                        value={familyIndexRequestDto.liveWithParent}
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </FormGroup>
                  </div>
                )}

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="firstName">
                    Contact ID
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="contactId"
                    id="contactId"
                    value={contactId}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled
                  />
                  {errors.indexClientId !== "" ? (
                    <span className={classes.error}>{errors.contactId}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4">
                <FormGroup>
                  <Label for="statusOfContact">
                    Contact HIV Status <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <select
                    className="form-control"
                    id="statusOfContact"
                    name="statusOfContact"
                    onChange={handlefamilyIndexRequestDto}
                    value={familyIndexRequestDto.statusOfContact}
                  >
                    <option value="">Select</option>
                    {statusOfContact.map((value, index) => (
                      <option key={index} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.statusOfContact && (
                    <span className={classes.error}>
                      {errors.statusOfContact}
                    </span>
                  )}
                </FormGroup>
              </div>
              {showHTSDate && (
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="DateofHTS">Date of HTS</Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateOfHts"
                      id="dateOfHts"
                      value={familyIndexRequestDto.dateOfHts}
                      onChange={handlefamilyIndexRequestDto}
                      min="1929-12-31"
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    // disabled
                    />
                    {errorFamilyIndexDTO.familyRelationship && (
                      <span className={classes.error}>
                        {errorFamilyIndexDTO.familyRelationship}
                      </span>
                    )}
                  </FormGroup>
                </div>
              )}

              {familyIndexRequestDto.statusOfContact &&
                familyIndexRequestDto.statusOfContact ===
                "FAMILY_INDEX_HIV_STATUS_CURRENT_ON_ART" && (
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="uan">Unique Art No (UAN)</Label>
                      <input
                        className="form-control"
                        id="uan"
                        type="text"
                        name="uan"
                        value={familyIndexRequestDto.uan}
                        onChange={handlefamilyIndexRequestDto}
                        disabled={
                          familyIndexRequestDto.statusOfContact !==
                          "FAMILY_INDEX_HIV_STATUS_CURRENT_ON_ART"
                        }
                      />
                      {errors.uan && (
                        <span className={classes.error}>{errors.uan}</span>
                      )}
                    </FormGroup>
                  </div>
                )}

              {familyIndexRequestDto.familyRelationship &&
                familyIndexRequestDto.familyRelationship !==
                "FAMILY_RELATIONSHIP_MOTHER" && (
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="motherDead">Mother Dead?</Label>
                      <select
                        className="form-control"
                        id="motherDead"
                        name="motherDead"
                        onChange={handlefamilyIndexRequestDto}
                        value={familyIndexRequestDto.motherDead}
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errorFamilyIndexDTO.motherDead && (
                        <span className={classes.error}>
                          {errorFamilyIndexDTO.motherDead}
                        </span>
                      )}
                    </FormGroup>
                  </div>
                )}

              {familyIndexRequestDto.motherDead === "Yes" && (
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="yearMotherDied">Year Mother Died</Label>
                    <input
                      className="form-control"
                      id="yearMotherDied"
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      min="1929-12-31"
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      name="yearMotherDead"
                      value={familyIndexRequestDto.yearMotherDead}
                      onChange={handlefamilyIndexRequestDto}
                    />
                    {errorFamilyIndexDTO.yearMotherDead && (
                      <span className={classes.error}>
                        {errorFamilyIndexDTO.yearMotherDead}
                      </span>
                    )}
                  </FormGroup>
                </div>
              )}

              {familyIndexRequestDto.childDead === "yes" && (
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="yearMotherDied">Year Child Died</Label>
                    <input
                      className="form-control"
                      id="yearMotherDied"
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      min="1929-12-31"
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      name="yearChildDead"
                      value={familyIndexRequestDto.yearChildDead}
                      onChange={handlefamilyIndexRequestDto}
                    />
                    {errorFamilyIndexDTO.yearChildDead && (
                      <span className={classes.error}>
                        {errorFamilyIndexDTO.yearChildDead}
                      </span>
                    )}
                  </FormGroup>
                </div>
              )}
              {/* {addIndexTracker && (
              <div className="form-group mb-3 col-md-12">
                <p style={{ color: "red" }}>Fill input in section B</p>
              </div>
            )}
            <div className="form-group mb-3 col-md-6">
              <LabelSui
                as="a"
                color="black"
                onClick={handleSubmitfamilyIndexRequestDto}
                size="small"
                style={{ marginTop: 35 }}
              >
                <Icon name="plus" /> Add
              </LabelSui>
            </div> */}
              {/* <div className="form-group mb-3 col-md-6">
              <Button
                content="Add"
                type="submit"
                icon="right plus"
                labelPosition="left"
                style={{ backgroundColor: "#000", color: "white" }}
                onClick={handleSubmitfamilyIndexRequestDto}
                //   disabled={saving}
              />
            </div> */}

              {/* {arrayFamilyIndexRequestDto &&
              arrayFamilyIndexRequestDto.length > 0 && (
                <List className="mb-5">
                  <Table striped responsive>
                    <thead>
                      <tr>
                        <th>Family Relationship</th>
                        <th>Family Index HIV Status</th>
                        <th>Mother Dead</th>

                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arrayFamilyIndexRequestDto.length > 0 &&
                        arrayFamilyIndexRequestDto.map((each, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                {convertCodeToDisplay(
                                  "familyRelationship",
                                  each.familyRelationship
                                )}
                              </td>
                              <td>
                                {convertCodeToDisplay(
                                  "statusOfContact",
                                  each.statusOfContact
                                )}
                              </td>
                              <td>{each.motherDead}</td>
                              <td>
                                {" "}
                                <IconButton
                                  aria-label="delete"
                                  size="small"
                                  color="error"
                                  onClick={() => removeFamilyIndexRow(index)}
                                >
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </List>
              )} */}
            </div>

            <div className="row">
              <div
                className="form-group col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#992E62",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                SECTION C: FAMILY INDEX TRACKER
              </div>

              {/* SECTION C INPUT FILEDS  */}
              <div className="row">
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="positionOfChildEnumerated">
                      Position of the Child Enumerated
                    </Label>
                    <input
                      className="form-control"
                      id="positionOfChildEnumerated"
                      type="number"
                      name="positionOfChildEnumerated"
                      value={
                        familyTestingTrackerRequestDTO?.positionOfChildEnumerated
                      }
                      onChange={handlefamilyTestingTrackerRequestDTO}
                    />
                  </FormGroup>
                </div>
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="sexTrackeer">Sex </Label>
                    <select
                      className="form-control"
                      id="trackerSex"
                      name="trackerSex"
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      value={familyTestingTrackerRequestDTO?.trackerSex}
                    >
                      <option value="">Select</option>
                      {genders.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="sex">Age</Label>
                    <input
                      className="form-control"
                      id="trackerAge"
                      type="number"
                      name="trackerAge"
                      value={familyTestingTrackerRequestDTO?.trackerAge}
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={true}
                    />
                  </FormGroup>
                </div>
                <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="followUpAppointmentLocation">
                      Follow Up Appointment Location
                    </Label>
                    <select
                      className="form-control"
                      id="followUpAppointmentLocation"
                      name="followUpAppointmentLocation"
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      value={
                        familyTestingTrackerRequestDTO?.followUpAppointmentLocation
                      }
                    >
                      <option value="">Select</option>
                      {followUpAppointmentLocation.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="">
                      Schedule Visit Date
                      {/* <span style={{ color: "red" }}> *</span>{" "} */}
                    </Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="scheduleVisitDate"
                      id="scheduleVisitDate"
                      value={familyTestingTrackerRequestDTO?.scheduleVisitDate}
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      min={
                        payload?.visitDate ||
                        props?.patientObj?.confirmatoryTest2?.date2
                      }
                      // max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    // disabled
                    />
                    {/* {errors.referralDate !== "" ? (
                      <span className={classes.error}>
                        {errors.referralDate}
                      </span>
                    ) : (
                      ""
                    )} */}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="">Date visited</Label>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateVisit"
                      id="dateVisit"
                      value={familyTestingTrackerRequestDTO?.dateVisit}
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      min={props?.patientObj?.confirmatoryTest2?.date2}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                    // disabled
                    />
                    {errorFamilyIndexTracker.dateVisit !== "" ? (
                      <span className={classes.error}>
                        {errorFamilyIndexTracker.dateVisit}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label for="">
                      Attempts
                      {/* <span style={{ color: "red" }}> *</span>{" "} */}
                    </Label>
                    <select
                      className="form-control"
                      name="attempt"
                      id="attempt"
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      value={familyTestingTrackerRequestDTO?.attempt}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value="">Select</option>
                      {indexVisitAttempt.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
                <div className="form-group col-md-4 ">
                  <Label>Known HIV Status ?</Label>
                  <FormGroup>
                    <select
                      className="form-control"
                      name="knownHivPositive"
                      id="knownHivPositive"
                      onChange={handlefamilyTestingTrackerRequestDTO}
                      value={familyTestingTrackerRequestDTO?.knownHivPositive}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormGroup>
                </div>
                {familyTestingTrackerRequestDTO.knownHivPositive &&
                  familyTestingTrackerRequestDTO.knownHivPositive === "Yes" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Date Tested</Label>
                        <Input
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dateTested"
                          id="dateTested"
                          value={familyTestingTrackerRequestDTO?.dateTested}
                          onChange={handlefamilyTestingTrackerRequestDTO}
                          min={
                            familyTestingTrackerRequestDTO?.dateVisit ||
                            props?.patientObj?.confirmatoryTest2?.date2
                          }
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                        />
                        {errors.dateTested !== "" ? (
                          <span className={classes.error}>
                            {errors.dateTested}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  )}
                {familyTestingTrackerRequestDTO?.knownHivPositive &&
                  familyTestingTrackerRequestDTO?.knownHivPositive ===
                  "Yes" && (
                    <div className="form-group col-md-4 ">
                      <Label>HIV Test Result </Label>
                      <FormGroup>
                        <select
                          className="form-control"
                          name="hiveTestResult"
                          id="hiveTestResult"
                          onChange={handlefamilyTestingTrackerRequestDTO}
                          value={familyTestingTrackerRequestDTO.hiveTestResult}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value="">Select</option>
                          <option value="Positive">Tested Positive</option>
                          <option value="Negative">Tested Negative</option>
                        </select>
                      </FormGroup>
                    </div>
                  )}
                {familyTestingTrackerRequestDTO?.knownHivPositive === "Yes" &&
                  familyTestingTrackerRequestDTO.hiveTestResult ===
                  "Positive" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label for="">Date Enrolled On ART</Label>
                        <Input
                          type="date"
                          onKeyPress={(e) => {
                            e.preventDefault();
                          }}
                          name="dateEnrolledOnArt"
                          id="dateEnrolledOnArt"
                          value={
                            familyTestingTrackerRequestDTO?.dateEnrolledOnArt
                          }
                          onChange={handlefamilyTestingTrackerRequestDTO}
                          min={
                            familyTestingTrackerRequestDTO?.dateTested ||
                            props?.patientObj?.confirmatoryTest2?.date2
                          }
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
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
                  )}
                {familyTestingTrackerRequestDTO?.trackerAge < 21 && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label for="">Date Enrolled In Ovc</Label>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateEnrolledInOVC"
                        id="dateEnrolledInOVC"
                        value={
                          familyTestingTrackerRequestDTO?.dateEnrolledInOVC
                        }
                        onChange={handlefamilyTestingTrackerRequestDTO}
                        min={
                          familyTestingTrackerRequestDTO?.dateVisit ||
                          props?.patientObj?.confirmatoryTest2?.date2
                        }
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
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
                )}

                {/* {addIndexTracker2 && (
                <div className="form-group mb-3 col-md-12">
                  <p style={{ color: "red" }}>
                    Fill section C; Index Tracker
                  </p>
                </div>
              )}{" "}
              <div className="form-group mb-3 col-md-6">
                <LabelSui
                  as="a"
                  color="black"
                  onClick={handleSubmitfamilyTestingTrackerRequestDTO}
                  size="small"
                  style={{ marginTop: 35 }}
                >
                  <Icon name="plus" /> Add
                </LabelSui>
              </div> */}
              </div>
            </div>

            {/* {arrayFamilyTestingTrackerRequestDTO.length > 0 && (
            <List>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Position of the child</th>
                    <th>Sex</th>
                    <th>Age</th>

                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {arrayFamilyTestingTrackerRequestDTO.map((each, index) => {
                    return (
                      <tr key={index}>
                        <td>{each.positionOfChildEnumerated}</td>
                        <td>{each.trackerSex}</td>
                        <td>{each.trackerAge}</td>
                        <td>
                          {" "}
                          <IconButton
                            aria-label="delete"
                            size="small"
                            color="error"
                            onClick={() => removeFamilyTrackerRow(index)}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </List>
          )} */}

            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <Button
                  content="Done"
                  type="Done"
                  icon="right arrowe"
                  labelPosition="right"
                  style={{ backgroundColor: "#014d88", color: "#fff" }}
                  onClick={() => {
                    history.push("/");
                  }}
                  disabled={saving}
                />
                <Button
                  content="Save"
                  type="submit"
                  icon="right arrow"
                  labelPosition="right"
                  style={{ backgroundColor: "#014d88", color: "#fff" }}
                  onClick={handleSubmit}
                  disabled={saving}
                />
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Would you like to fill the Partner Service Form?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => loadNextForm()}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Yes
          </Button>

          <Button
            onClick={() => handleDone()}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Skip
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FamilyIndexTestingForm;
