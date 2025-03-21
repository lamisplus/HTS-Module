import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { checkPregnantPatient } from "../../../../utility";
import {
  FormGroup,
  Label,
  CardBody,
  Spinner,
  Badge,
  Input,
  Form,
} from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import FeedbackModal from "./FeedbackModal";
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import { Label as LabelRibbon, Button, Message } from "semantic-ui-react";

import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PanToolIcon from "@mui/icons-material/PanTool";
import { getCheckModality } from "../../../../utility";
import { getNextForm } from "../../../../utility";
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

const BasicInfo = (props) => {
  const [predictionValue, setPredictionValue] = useState(0);
  const [openModal, setOpenModal] = React.useState(false);
  const toggleModal = (event) => {
    event.preventDefault();
    setOpenModal(!openModal);
  };

  const predictionRanges = (prediction) => {
    if (parseFloat(prediction) < 0.005575358) {
      return <Badge color="success">Low Risk</Badge>;
    } else if (
      parseFloat(prediction) > 0.005575358 &&
      parseFloat(prediction) < 0.02719647
    ) {
      return <Badge color="info">Medium Risk</Badge>;
    } else if (
      parseFloat(prediction) > 0.02719647 &&
      parseFloat(prediction) < 0.08083864
    ) {
      return <Badge color="warning">High Risk</Badge>;
    } else if (parseFloat(prediction) > 0.08083864) {
      return <Badge color="danger">Highest Risk</Badge>;
    } else {
      return <Badge color="dark">No Prediction Result</Badge>;
    }
  };

  const classes = useStyles();
  //let patientAge=""
  const patientID =
    props.patientObj && props.patientObj.personResponseDto
      ? props.patientObj.personResponseDto.id
      : "";
  const clientId =
    props.patientObj && props.patientObj ? props.patientObj.id : "";
  const [saving, setSaving] = useState(false);
  const [mlresult, setMlresult] = useState(false);
  const [savingPrediction, setSavingPrediction] = useState(false);
  const [savingResult, setSavingRsult] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [errors, setErrors] = useState({});
  let temp = { ...errors };
  const [modalityCheck, setModalityCheck] = useState("");

  let dataObj = props.patientObj;
  //console.log("data", dataObj);
  const [permissions, setPermission] = useState(
    localStorage.getItem("stringifiedPermmision")?.split(",")
  );
  const [knowledgeAssessment, setKnowledgeAssessment] = useState({
    previousTestedHIVNegative: "",
    timeLastHIVNegativeTestResult: "",
    clientPregnant: "",
    clientInformHivTransRoutes: "",
    clientInformRiskkHivTrans: "",
    clientInformPreventingsHivTrans: "",
    clientInformPossibleTestResult: "",
    informConsentHivTest: "",
  });
  const [objValues, setObjValues] = useState({
    htsClientId: clientId,
    knowledgeAssessment: {},
    personId: patientID,
    riskAssessment: {},
    stiScreening: {},
    tbScreening: {},
    sexPartnerRiskAssessment: {},
  });

  const [riskAssessment, setRiskAssessment] = useState({
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
    haveCondomBurst: "",
    mlStatus: "",
    mlScore: "",
  });

  const [riskAssessmentPartner, setRiskAssessmentPartner] = useState({
    sexPartnerHivPositive: "",
    newDiagnosedHivlastThreeMonths: "",
    currentlyArvForPmtct: "",
    knowHivPositiveOnArv: "",
    knowHivPositiveAfterLostToFollowUp: "",
    uprotectedAnalSex: "",
  });

  const [tbScreening, setTbScreening] = useState({
    currentCough: "",
    weightLoss: "",
    lymphadenopathy: "",
    fever: "",
    nightSweats: "",
  });

  const [stiScreening, setStiScreening] = useState({
    vaginalDischarge: "",
    lowerAbdominalPains: "",
    urethralDischarge: "",
    complaintsOfScrotal: "",
    complaintsGenitalSore: "",
  });

  const [mlResultObj, setMlResultObj] = useState({
    htsClientId: clientId,
    status: "",
    score: "",
  });

  useEffect(() => {
    if (props.patientObj) {
      let knowledgeAsses = props?.patientObj?.knowledgeAssessment;
      setKnowledgeAssessment(
        props.patientObj.knowledgeAssessment &&
          props.patientObj.knowledgeAssessment !== null
          ? props.patientObj.knowledgeAssessment
          : {}
      );

      if (props?.patientObj?.pregnant) {
        checkPregnantPatient(props.patientObj.pregnant).then((res) => {
          console.log("my result", res);
          setKnowledgeAssessment({
            ...knowledgeAsses,
            clientPregnant: res ? "true" : "false",
          });
        });
      }
      setRiskAssessment(
        props.patientObj.riskAssessment &&
          props.patientObj.riskAssessment !== null
          ? props.patientObj.riskAssessment
          : {}
      );
      setRiskAssessmentPartner(
        props.patientObj.sexPartnerRiskAssessment &&
          props.patientObj.sexPartnerRiskAssessment !== null
          ? props.patientObj.sexPartnerRiskAssessment
          : {}
      );
      setStiScreening(
        props.patientObj.stiScreening && props.patientObj.stiScreening !== null
          ? props.patientObj.stiScreening
          : {}
      );
      setTbScreening(
        props.patientObj.tbScreening && props.patientObj.tbScreening !== null
          ? props.patientObj.tbScreening
          : {}
      );

      if (
        props.patientObj.riskStratificationResponseDto &&
        Object.keys(
          props.patientObj.riskStratificationResponseDto.riskAssessment
        ).length !== 0 &&
        props.patientObj.riskAssessment === null
      ) {
        props.patientObj.riskStratificationResponseDto.riskAssessment
          .whatWasTheResult !== "" &&
        props.patientObj.riskStratificationResponseDto.riskAssessment
          .whatWasTheResult === "Positive"
          ? (knowledgeAssessment.previousTestedHIVNegative = "false")
          : (knowledgeAssessment.previousTestedHIVNegative = "true");
      } else {
        setRiskAssessment({
          ...riskAssessment,
          ...props.patientObj.riskAssessment,
        });
      }
      knowledgeAssessment.clientPregnant =
        props.patientObj.pregnant === 73 ? "true" : "";

      setModalityCheck(
        getCheckModality(
          props.patientObj?.riskStratificationResponseDto?.testingSetting
        )
      );
    }
  }, [props.patientObj]);

  const handleItemClick = (page, completedMenu) => {
    if (props.completed.includes(completedMenu)) {
    } else {
      props.setCompleted([...props.completed, completedMenu]);
    }
    props.handleItemClick(page);
  };

  const handleInputChangeKnowledgeAssessment = (e) => {
    setKnowledgeAssessment({
      ...knowledgeAssessment,
      [e.target.name]: e.target.value,
    });
  };

  const postPredictions = (e) => {
    e.preventDefault();
    setSavingRsult(true);

    if (dataObj?.riskStratificationResponseDto?.age < 15) {
      toast.info(`No risk score for client less than 15 years`, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      setMlresult(true);
      setSavingRsult(false);
    } else {
      let mlData = {
        modelConfigs: {
          debug: "true",
          encounterDate: dataObj?.dateVisit,
          facilityId: "LBgwDTw2C8u", // TODO: get facility id from database
          modelId: "hts_v5",
        },
        variableValues: {
          age:
            dataObj?.riskStratificationResponseDto?.age !== null
              ? dataObj?.riskStratificationResponseDto?.age
              : -1000.0,
          bloodTransfusionInLast3Months:
            dataObj?.riskStratificationResponseDto?.riskAssessment
              ?.lastHivTestBloodTransfusion === "true" ||
            riskAssessment.bloodTransfusion === "true" ||
            riskAssessment.bloodtransInlastThreeMonths === "true"
              ? 1
              : 0,
          clientPregnant:
            dataObj?.pregnant === 73 &&
            dataObj?.personResponseDto?.sex === "Female"
              ? 1
              : dataObj?.pregnant === 72 &&
                dataObj?.personResponseDto?.sex === "Male"
              ? 0
              : dataObj?.pregnant === 72 &&
                dataObj?.personResponseDto?.sex === "Female"
              ? 0
              : dataObj?.pregnant === "" &&
                dataObj?.personResponseDto?.sex === "Female"
              ? 0
              : 0,
          everHadSexualIntercourse:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
                        "TARGET_GROUP_SEXUAL_PARTNER" ||
            dataObj?.riskStratificationResponseDto?.targetGroup ===
                                    "TARGET_GROUP_MSM" ||
            dataObj?.riskStratificationResponseDto?.targetGroup ===
                        "TARGET_GROUP_FSW" ||
            riskAssessment?.everHadSexualIntercourse === "true" ||
            riskAssessment?.soldPaidVaginalSex === "true" ||
            riskAssessmentPartner?.uprotectedAnalSex === "true" ||
            riskAssessment?.haveCondomBurst === "true" ||
            riskAssessment?.haveSexWithoutCondom === "true"
              ? 1
              : riskAssessment?.soldPaidVaginalSex === "false" &&
                riskAssessmentPartner?.uprotectedAnalSex === "false" &&
                riskAssessment?.haveCondomBurst === "false" &&
                riskAssessment?.haveSexWithoutCondom === "false"
              ? 0
              : riskAssessment?.soldPaidVaginalSex === "" &&
                riskAssessmentPartner?.uprotectedAnalSex === "" &&
                riskAssessment?.haveCondomBurst === "" &&
                riskAssessment?.haveSexWithoutCondom === ""
              ? 0
              : 0,
          first_time_visit: dataObj?.firstTimeVisit === true ? 1 : 0,
          gender_female: dataObj?.personResponseDto?.sex === "Female" ? 1 : 0,
          gender_male: dataObj?.personResponseDto?.sex === "Male" ? 1 : 0,
          index_client: dataObj?.indexClient === true ? 1 : 0,
          marital_status_divorced:
            dataObj?.personResponseDto?.maritalStatus?.display === "Divorced"
              ? 1
              : 0,
          marital_status_married:
            dataObj?.personResponseDto?.maritalStatus?.display === "Married"
              ? 1
              : 0,
          marital_status_other:
            dataObj?.personResponseDto?.maritalStatus?.display === "Divorced" ||
            dataObj?.personResponseDto?.maritalStatus?.display ===
              "Separated" ||
            dataObj?.personResponseDto?.maritalStatus?.display === "Widowed"
              ? 1
              : 0,
          marital_status_single:
            dataObj?.personResponseDto?.maritalStatus?.display === "Single"
              ? 1
              : 0,
          moreThan1SexPartnerDuringLast3Months:
            riskAssessment?.soldPaidVaginalSex === "true" ||
            riskAssessment?.moreThanOneSexPartnerLastThreeMonths === "true"
              ? 1
              : 0,
          previously_tested: dataObj?.previouslyTested === true ? 1 : 0,
          referred_from_Community_Mobilization:
            dataObj?.referredFrom === 1015 ? 1 : 0,
          referred_from_OPD: dataObj?.referredFrom === 47 ? 1 : 0,
          referred_from_Others:
            dataObj?.referredFrom === 50 ||
            dataObj?.referredFrom === 45 ||
            dataObj?.referredFrom === 44 ||
            dataObj?.referredFrom === 48 ||
            dataObj?.referredFrom === 45 ||
            dataObj?.referredFrom === 447 ||
            dataObj?.referredFrom === 449 ||
            dataObj?.referredFrom === 46 ||
            dataObj?.referredFrom === 49 ||
            dataObj?.referredFrom === 870
              ? 1
              : 0,
          referred_from_Private_Commercial_Health_facility:
            dataObj?.referredFrom === 448 ? 1 : 0,
          referred_from_Self: dataObj?.referredFrom === 43 ? 1 : 0,
          stiInLast3Months:
            riskAssessment?.stiLastThreeMonths === "true" ||
            riskAssessment?.experiencePain === "true" ||
            riskAssessmentPartner?.sexPartnerHivPositive === "true" ||
            riskAssessmentPartner?.newDiagnosedHivlastThreeMonths === "true" ||
            riskAssessmentPartner?.currentlyArvForPmtct === "true" ||
            riskAssessmentPartner?.knowHivPositiveOnArv === "true" ||
            riskAssessmentPartner?.knowHivPositiveAfterLostToFollowUp === "true"
              ? 1
              : 0,
          sti_symptoms:
            (stiScreening?.lowerAbdominalPains === "true" &&
              stiScreening?.vaginalDischarge === "true") ||
            (stiScreening?.complaintsGenitalSore === "true" &&
              stiScreening?.complaintsOfScrotal === "true" &&
              stiScreening?.urethralDischarge === "true")
              ? 1
              : stiScreening?.lowerAbdominalPains === "" ||
                stiScreening?.vaginalDischarge === ""
              ? -1000
              : 0,
          target_group_FSW:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
            "TARGET_GROUP_FSW"
              ? 1
              : 0,
          target_group_GEN_POP:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
            "TARGET_GROUP_GEN_POP"
              ? 1
              : 0,
          target_group_MSM:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
            "TARGET_GROUP_MSM"
              ? 1
              : 0,
          target_group_PWID:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
            "TARGET_GROUP_PWID"
              ? 1
              : 0,
          target_group_SEXUAL_PARTNER:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
            "TARGET_GROUP_SEXUAL_PARTNER"
              ? 1
              : 0,
          target_group_other:
            dataObj?.riskStratificationResponseDto?.targetGroup ===
              "TARGET_GROUP_PRISON" ||
            dataObj?.riskStratificationResponseDto?.targetGroup ===
              "TARGET_GROUP_TRANSGENDER" ||
            dataObj?.riskStratificationResponseDto?.targetGroup ===
              "TARGET_GROUP_CHILDREN_OF_KP"
              ? 1
              : 0,
          tb_symptoms:
            tbScreening?.currentCough === "true" ||
            tbScreening?.weightLoss === "true" ||
            tbScreening?.lymphadenopathy === "true" ||
            tbScreening?.fever === "true" ||
            tbScreening?.nightSweats === "true"
              ? 1
              : tbScreening?.currentCough === "" &&
                tbScreening?.weightLoss === "" &&
                tbScreening?.lymphadenopathy === "" &&
                tbScreening?.fever === "" &&
                tbScreening?.nightSweats === ""
              ? -1000
              : 0,
          testing_settingANC:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
            "FACILITY_HTS_TEST_SETTING_ANC"
              ? 1
              : 0,
          testing_settingCPMTCT:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY"
              ? 1
              : 0,
          testing_settingCT:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_CT" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_CT"
              ? 1
              : 0,
          testing_settingIndex:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_INDEX" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_SNS" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_SNS" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_INDEX"
              ? 1
              : 0,
          testing_settingOthers:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_OTHERS" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_OTHERS_(SPECIFY)" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_BLOOD_BANK" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_EMERGENCY" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_FP" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_L&D" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_MALNUTRITION" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_PEDIATRIC" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_STANDALONE_HTS" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_STI" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_PREP_TESTING" ||
            dataObj?.riskStratificationResponseDto?.testingSetting ===
              "COMMUNITY_HTS_TEST_SETTING_STANDALONE_HTS"
              ? 1
              : 0,
          testing_settingOutreach:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
            "COMMUNITY_HTS_TEST_SETTING_OUTREACH"
              ? 1
              : 0,
          testing_settingOVC:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
            "COMMUNITY_HTS_TEST_SETTING_OVC"
              ? 1
              : 0,
          testing_settingTB:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
            "FACILITY_HTS_TEST_SETTING_TB"
              ? 1
              : 0,
          testing_settingWard_Inpatient:
            dataObj?.riskStratificationResponseDto?.testingSetting ===
            "FACILITY_HTS_TEST_SETTING_WARD_INPATIENT"
              ? 1
              : 0,
          unprotectedSexWithCasualPartnerInLast3Months:
            riskAssessment?.uprotectedSexWithCasualLastThreeMonths === "true" ||
            riskAssessment?.soldPaidVaginalSex === "true" ||
            riskAssessmentPartner?.uprotectedAnalSex === "true"
              ? 1
              : 0,
          unprotectedSexWithRegularPartnerInLast3Months:
            riskAssessment?.uprotectedSexWithRegularPartnerLastThreeMonths ===
              "true" ||
            riskAssessment?.haveCondomBurst === "true" ||
            riskAssessment?.haveSexWithoutCondom === "true"
              ? 1
              : 0,
        },
      };

      setMlresult(true);

      axios
        .post(`${baseUrl}machine-learning/evaluate`, mlData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((resp) => {
          console.log("ML", resp);
          let predictions = Object.values(resp.data.result.predictions);
          setPredictionValue(predictions);
          let statusVal = "";

          if (parseFloat(predictions[1]) < 0.005575358) {
            statusVal = "Low Risk";
          } else if (
            parseFloat(predictions[1]) > 0.005575358 &&
            parseFloat(predictions[1]) < 0.02719647
          ) {
            statusVal = "Medium Risk";
          } else if (
            parseFloat(predictions[1]) > 0.02719647 &&
            parseFloat(predictions[1]) < 0.08083864
          ) {
            statusVal = "High Risk";
          } else if (parseFloat(predictions[1]) > 0.08083864) {
            statusVal = "Highest Risk";
          } else {
            statusVal = "No Prediction Result";
          }

          setMlResultObj({
            htsClientId: clientId,
            status: statusVal,
            score: predictions[1],
          });

          setSavingPrediction(true);
          setSavingRsult(false);
        })
        .catch((err) => {
          console.error("ML_err", err);
        });
    }
  };

  const handleInputChangeRiskAssessment = (e) => {
    setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });
  };
  // Getting the number count of riskAssessment True
  const actualRiskCountTrue = Object.values(riskAssessment);
  const riskCount = actualRiskCountTrue.filter((x) => x === "true");

  const handleInputChangeRiskAssessmentPartner = (e) => {
    //setErrors({...temp, [e.target.name]:""})
    setRiskAssessmentPartner({
      ...riskAssessmentPartner,
      [e.target.name]: e.target.value,
    });
  };
  // Getting the number count of sexPartRiskCount True
  const actualSexPartRiskCountTrue = Object.values(riskAssessmentPartner);
  const sexPartRiskCount = actualSexPartRiskCountTrue.filter(
    (x) => x === "true"
  );

  const handleInputChangeStiScreening = (e) => {
    //setErrors({...temp, [e.target.name]:""})
    setStiScreening({ ...stiScreening, [e.target.name]: e.target.value });
  };
  // Getting the number count of STI True
  const actualStiTrue = Object.values(stiScreening);
  const stiCount = actualStiTrue.filter((x) => x === "true");

  const handleInputChangeTbScreening = (e) => {
    //setErrors({...temp, [e.target.name]:""})
    setTbScreening({ ...tbScreening, [e.target.name]: e.target.value });
  };
  // Getting the number count of TB True
  const actualTBTrue = Object.values(tbScreening);
  const newTbTrue = actualTBTrue.filter((x) => x === "true");
  /*****  Validation  */
  const validate = () => {
    props.patientObj.targetGroup === "TARGET_GROUP_GEN_POP" &&
      (temp.everHadSexualIntercourse = riskAssessment.everHadSexualIntercourse
        ? ""
        : "This field is required.");
    props.patientObj.targetGroup === "TARGET_GROUP_GEN_POP" &&
      (temp.bloodtransInlastThreeMonths =
        riskAssessment.bloodtransInlastThreeMonths
          ? ""
          : "This field is required.");

    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.experiencePain = riskAssessment.experiencePain
        ? ""
        : "This field is required.");

    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.haveSexWithoutCondom = riskAssessment.haveSexWithoutCondom
        ? ""
        : "This field is required.");
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.abuseDrug = riskAssessment.abuseDrug
        ? ""
        : "This field is required.");
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.bloodTransfusion = riskAssessment.bloodTransfusion
        ? ""
        : "This field is required.");
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.consistentWeightFeverNightCough =
        riskAssessment.consistentWeightFeverNightCough
          ? ""
          : "This field is required.");
    props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" &&
      (temp.soldPaidVaginalSex = riskAssessment.soldPaidVaginalSex
        ? ""
        : "This field is required.");

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x === "");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    let latestForm = getNextForm(
      "Pre_Test_Counseling",
      objValues.age,
      modalityCheck,
      "unknown"
    );
    if (validate()) {
      setSaving(true);

      riskAssessment.mlStatus = mlResultObj.status;
      riskAssessment.mlScore = mlResultObj.score;

      objValues.htsClientId = clientId;
      objValues.knowledgeAssessment = knowledgeAssessment;
      objValues.personId = patientID;
      objValues.riskAssessment = riskAssessment;
      objValues.stiScreening = stiScreening;
      objValues.tbScreening = tbScreening;
      objValues.sexPartnerRiskAssessment = riskAssessmentPartner;

      axios
        .put(`${baseUrl}hts/${clientId}/pre-test-counseling`, objValues, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSaving(false);
          props.setPatientObj({
            ...props.patientObj,
            knowledgeAssessment: response.data.knowledgeAssessment,
            riskAssessment: response.data.riskAssessment,
            stiScreening: response.data.stiScreening,
            tbScreening: response.data.tbScreening,
            sexPartnerRiskAssessment: response.data.sexPartnerRiskAssessment,
          });
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
          <h2>PRE TEST COUNSELING</h2>
          {savingPrediction ? (
            <Stack sx={{ width: "50%" }} spacing={2}>
              <Alert severity="info" style={{ fontSize: "16px", color: "000" }}>
                <b>ML Prediction Result for HTS Patient :</b>{" "}
                {predictionRanges(predictionValue[1])}
              </Alert>
            </Stack>
          ) : (
            ""
          )}
          <br />
          <form>
            <div className="row">
              <div
                className="form-group  col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "rgb(0,181,173)",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Knowledge Assessment
              </div>

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Previously tested HIV negative{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="previousTestedHIVNegative"
                    id="previousTestedHIVNegative"
                    value={knowledgeAssessment.previousTestedHIVNegative}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.previousTestedHIVNegative !== "" ? (
                    <span className={classes.error}>
                      {errors.previousTestedHIVNegative}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {knowledgeAssessment.previousTestedHIVNegative === "true" && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>Time of last HIV Negative test Result</Label>
                    <select
                      className="form-control"
                      name="timeLastHIVNegativeTestResult"
                      id="timeLastHIVNegativeTestResult"
                      value={knowledgeAssessment.timeLastHIVNegativeTestResult}
                      onChange={handleInputChangeKnowledgeAssessment}
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
                      {knowledgeAssessment.previousTestedHIVNegative !==
                        "true" && <option value="Never"> Never</option>}
                    </select>
                    {errors.timeLastHIVNegativeTestResult !== "" ? (
                      <span className={classes.error}>
                        {errors.timeLastHIVNegativeTestResult}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              {props.patientObj &&
                (props.patientObj.personResponseDto.sex === "Female" ||
                  props.patientObj.personResponseDto.sex === "female" ||
                  props.patientObj.personResponseDto.sex === "FEMALE") && (
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>Client pregnant </Label>
                      <select
                        className="form-control"
                        name="clientPregnant"
                        id="clientPregnant"
                        value={knowledgeAssessment.clientPregnant}
                        onChange={handleInputChangeKnowledgeAssessment}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                        disabled={true}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.clientPregnant !== "" ? (
                        <span className={classes.error}>
                          {errors.clientPregnant}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Client informed about HIV transmission routes </Label>
                  <select
                    className="form-control"
                    name="clientInformHivTransRoutes"
                    id="clientInformHivTransRoutes"
                    value={knowledgeAssessment.clientInformHivTransRoutes}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.clientInformHivTransRoutes !== "" ? (
                    <span className={classes.error}>
                      {errors.clientInformHivTransRoutes}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Client informed about risk factors for HIV transmission{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="clientInformRiskkHivTrans"
                    id="clientInformRiskkHivTrans"
                    value={knowledgeAssessment.clientInformRiskkHivTrans}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.clientInformRiskkHivTrans !== "" ? (
                    <span className={classes.error}>
                      {errors.clientInformRiskkHivTrans}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Client informed on preventing HIV transmission methods{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="clientInformPreventingsHivTrans"
                    id="clientInformPreventingsHivTrans"
                    value={knowledgeAssessment.clientInformPreventingsHivTrans}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.clientInformPreventingsHivTrans !== "" ? (
                    <span className={classes.error}>
                      {errors.clientInformPreventingsHivTrans}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Client informed about possible test results </Label>
                  <select
                    className="form-control"
                    name="clientInformPossibleTestResult"
                    id="clientInformPossibleTestResult"
                    value={knowledgeAssessment.clientInformPossibleTestResult}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.clientInformPossibleTestResult !== "" ? (
                    <span className={classes.error}>
                      {errors.clientInformPossibleTestResult}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Informed consent for HIV testing given </Label>
                  <select
                    className="form-control"
                    name="informConsentHivTest"
                    id="informConsentHivTest"
                    value={knowledgeAssessment.informConsentHivTest}
                    onChange={handleInputChangeKnowledgeAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.informConsentHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.informConsentHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <hr />
              <br />

              {props.patientObj.targetGroup === "TARGET_GROUP_GEN_POP" && (
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
                        Ever had sexual intercourse{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="everHadSexualIntercourse"
                        id="everHadSexualIntercourse"
                        value={riskAssessment.everHadSexualIntercourse}
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
                      {errors.everHadSexualIntercourse !== "" ? (
                        <span className={classes.error}>
                          {errors.everHadSexualIntercourse}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Blood transfusion in last 3 months{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="bloodtransInlastThreeMonths"
                        id="bloodtransInlastThreeMonths"
                        value={riskAssessment.bloodtransInlastThreeMonths}
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
                      {errors.bloodtransInlastThreeMonths !== "" ? (
                        <span className={classes.error}>
                          {errors.bloodtransInlastThreeMonths}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Unprotected sex with casual partner in last 3 months{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="uprotectedSexWithCasualLastThreeMonths"
                            id="uprotectedSexWithCasualLastThreeMonths"
                            value={
                              riskAssessment.uprotectedSexWithCasualLastThreeMonths
                            }
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
                          {errors.uprotectedSexWithCasualLastThreeMonths !==
                          "" ? (
                            <span className={classes.error}>
                              {errors.uprotectedSexWithCasualLastThreeMonths}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Unprotected sex with regular partner in the last
                            3months <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="uprotectedSexWithRegularPartnerLastThreeMonths"
                            id="uprotectedSexWithRegularPartnerLastThreeMonths"
                            value={
                              riskAssessment.uprotectedSexWithRegularPartnerLastThreeMonths
                            }
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
                          {errors.uprotectedSexWithRegularPartnerLastThreeMonths !==
                          "" ? (
                            <span className={classes.error}>
                              {
                                errors.uprotectedSexWithRegularPartnerLastThreeMonths
                              }
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Unprotected vaginal sex{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="unprotectedVaginalSex"
                            id="unprotectedVaginalSex"
                            value={riskAssessment.unprotectedVaginalSex}
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
                          {errors.unprotectedVaginalSex !== "" ? (
                            <span className={classes.error}>
                              {errors.unprotectedVaginalSex}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Unprotected Anal sex{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="uprotectedAnalSex"
                            id="uprotectedAnalSex"
                            value={riskAssessment.uprotectedAnalSex}
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
                          {errors.uprotectedAnalSex !== "" ? (
                            <span className={classes.error}>
                              {errors.uprotectedAnalSex}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            STI in last 3 months{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="stiLastThreeMonths"
                            id="stiLastThreeMonths"
                            value={riskAssessment.stiLastThreeMonths}
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
                          {errors.stiLastThreeMonths !== "" ? (
                            <span className={classes.error}>
                              {errors.stiLastThreeMonths}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Sex under the influence of drugs or alcohol{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="sexUnderInfluence"
                            id="sexUnderInfluence"
                            value={riskAssessment.sexUnderInfluence}
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
                          {errors.sexUnderInfluence !== "" ? (
                            <span className={classes.error}>
                              {errors.sexUnderInfluence}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  {riskAssessment.everHadSexualIntercourse !== "" &&
                    riskAssessment.everHadSexualIntercourse === "true" && (
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            More than 1 sex partner during last 3 months{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="moreThanOneSexPartnerLastThreeMonths"
                            id="moreThanOneSexPartnerLastThreeMonths"
                            value={
                              riskAssessment.moreThanOneSexPartnerLastThreeMonths
                            }
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
                          {errors.moreThanOneSexPartnerLastThreeMonths !==
                          "" ? (
                            <span className={classes.error}>
                              {errors.moreThanOneSexPartnerLastThreeMonths}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}

                  <Message warning>
                    <h4> Risk assessment score (sum of all 7 answers)</h4>
                    <b>Score : {riskCount.length}</b>
                  </Message>
                  <hr />
                  <br />
                </>
              )}
              {props.patientObj.targetGroup !== "TARGET_GROUP_GEN_POP" && (
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
                        Have you/your partner experienced lower abdominal pain,
                        smelly discharge, blisters and wounds around you/partner
                        vagina, penis anus or mouth?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="experiencePain"
                        id="experiencePain"
                        value={riskAssessment.experiencePain}
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
                      {errors.experiencePain !== "" ? (
                        <span className={classes.error}>
                          {errors.experiencePain}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you/partner had sex without a condom with someone
                        of unknown HIV status, or you/partner raped by person
                        with unknown HIV status?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="haveSexWithoutCondom"
                        id="haveSexWithoutCondom"
                        value={riskAssessment.haveSexWithoutCondom}
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
                      {errors.haveSexWithoutCondom !== "" ? (
                        <span className={classes.error}>
                          {errors.haveSexWithoutCondom}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you had a condom burst with your partner during
                        sexual intercourse?{" "}
                        <span style={{ color: "red" }}> *</span>{" "}
                      </Label>
                      <select
                        className="form-control"
                        name="haveCondomBurst"
                        id="haveCondomBurst"
                        value={riskAssessment.haveCondomBurst}
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
                      {errors.haveCondomBurst !== "" ? (
                        <span className={classes.error}>
                          {errors.haveCondomBurst}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Do you/partner share needles/syringes, other sharp
                        objects or used abuse drug substances of any kind?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="abuseDrug"
                        id="abuseDrug"
                        value={riskAssessment.abuseDrug}
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
                      {errors.abuseDrug !== "" ? (
                        <span className={classes.error}>
                          {errors.abuseDrug}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you/partner had any blood or blood product
                        transfusion? <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="bloodTransfusion"
                        id="bloodTransfusion"
                        value={riskAssessment.bloodTransfusion}
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
                      {errors.bloodTransfusion !== "" ? (
                        <span className={classes.error}>
                          {errors.bloodTransfusion}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you/partner experienced coughing, weight loss,
                        fever, night sweats consistently?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="consistentWeightFeverNightCough"
                        id="consistentWeightFeverNightCough"
                        value={riskAssessment.consistentWeightFeverNightCough}
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
                      {errors.consistentWeightFeverNightCough !== "" ? (
                        <span className={classes.error}>
                          {errors.consistentWeightFeverNightCough}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Have you/partner paid or sold vaginal, anal or oral sex?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <select
                        className="form-control"
                        name="soldPaidVaginalSex"
                        id="soldPaidVaginalSex"
                        value={riskAssessment.soldPaidVaginalSex}
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
                      {errors.soldPaidVaginalSex !== "" ? (
                        <span className={classes.error}>
                          {errors.soldPaidVaginalSex}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <Message warning>
                    <h4> HIV Risk assessment score (sum of all 7 answers)</h4>
                    <b>Score :{riskCount.length}</b>
                  </Message>
                  <hr />
                  <br />
                </>
              )}

              <div
                className="form-group  col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#000",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Clinical TB screening
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Current cough </Label>
                  <select
                    className="form-control"
                    name="currentCough"
                    id="currentCough"
                    value={tbScreening.currentCough}
                    onChange={handleInputChangeTbScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.currentCough !== "" ? (
                    <span className={classes.error}>{errors.currentCough}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Weight loss </Label>
                  <select
                    className="form-control"
                    name="weightLoss"
                    id="weightLoss"
                    value={tbScreening.weightLoss}
                    onChange={handleInputChangeTbScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.weightLoss !== "" ? (
                    <span className={classes.error}>{errors.weightLoss}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Lymphadenopathy (swelling of the lymph nodes) </Label>
                  <select
                    className="form-control"
                    name="lymphadenopathy"
                    id="lymphadenopathy"
                    value={tbScreening.lymphadenopathy}
                    onChange={handleInputChangeTbScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.lymphadenopathy !== "" ? (
                    <span className={classes.error}>
                      {errors.lymphadenopathy}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Fever </Label>
                  <select
                    className="form-control"
                    name="fever"
                    id="fever"
                    value={tbScreening.fever}
                    onChange={handleInputChangeTbScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.fever !== "" ? (
                    <span className={classes.error}>{errors.fever}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Night sweats</Label>
                  <select
                    className="form-control"
                    name="nightSweats"
                    id="nightSweats"
                    value={tbScreening.nightSweats}
                    onChange={handleInputChangeTbScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.nightSweats !== "" ? (
                    <span className={classes.error}>{errors.nightSweats}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <Message warning>
                <h4>
                  TB Screening score (calculate the sum of the TB assessment) If
                  score {">= 1"}, test for Xper MTB RIF or refer to TB service{" "}
                </h4>
                <b>Score : {newTbTrue.length}</b>
              </Message>
              <hr />
              <br />
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
                Sex Partner Risk Assessment (Last 3 months)
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who is HIV positive?{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="sexPartnerHivPositive"
                    id="sexPartnerHivPositive"
                    value={riskAssessmentPartner.sexPartnerHivPositive}
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.sexPartnerHivPositive !== "" ? (
                    <span className={classes.error}>
                      {errors.sexPartnerHivPositive}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {riskAssessmentPartner.sexPartnerHivPositive === "true" && (
                <>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Is sex partner newly diagnosed with HIV and started
                        treatment less than 3-6 months ago?
                      </Label>
                      <select
                        className="form-control"
                        name="newDiagnosedHivlastThreeMonths"
                        id="newDiagnosedHivlastThreeMonths"
                        value={
                          riskAssessmentPartner.newDiagnosedHivlastThreeMonths
                        }
                        onChange={handleInputChangeRiskAssessmentPartner}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.newDiagnosedHivlastThreeMonths !== "" ? (
                        <span className={classes.error}>
                          {errors.newDiagnosedHivlastThreeMonths}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Is sex partner pregnant and currently receiving ARV for
                        PMTCT?
                      </Label>
                      <select
                        className="form-control"
                        name="currentlyArvForPmtct"
                        id="currentlyArvForPmtct"
                        value={riskAssessmentPartner.currentlyArvForPmtct}
                        onChange={handleInputChangeRiskAssessmentPartner}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.currentlyArvForPmtct !== "" ? (
                        <span className={classes.error}>
                          {errors.currentlyArvForPmtct}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Known HIV positive partner on ARV with an unsurpressed
                        VL
                      </Label>
                      <select
                        className="form-control"
                        name="knowHivPositiveOnArv"
                        id="knowHivPositiveOnArv"
                        value={riskAssessmentPartner.knowHivPositiveOnArv}
                        onChange={handleInputChangeRiskAssessmentPartner}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.knowHivPositiveOnArv !== "" ? (
                        <span className={classes.error}>
                          {errors.knowHivPositiveOnArv}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Known HIV positive recently returned to treatment after
                        being lost to follow up
                      </Label>
                      <select
                        className="form-control"
                        name="knowHivPositiveAfterLostToFollowUp"
                        id="knowHivPositiveAfterLostToFollowUp"
                        value={
                          riskAssessmentPartner.knowHivPositiveAfterLostToFollowUp
                        }
                        onChange={handleInputChangeRiskAssessmentPartner}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.knowHivPositiveAfterLostToFollowUp !== "" ? (
                        <span className={classes.error}>
                          {errors.knowHivPositiveAfterLostToFollowUp}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>Unprotected Anal sex</Label>
                      <select
                        className="form-control"
                        name="uprotectedAnalSex"
                        id="uprotectedAnalSex"
                        value={riskAssessmentPartner.uprotectedAnalSex}
                        onChange={handleInputChangeRiskAssessmentPartner}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value={""}></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.uprotectedAnalSex !== "" ? (
                        <span className={classes.error}>
                          {errors.uprotectedAnalSex}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
              <Message warning>
                <h4>
                  Sex Partner Risk Assessment score (sum of all 6 answers)
                </h4>
                <b>Score :{sexPartRiskCount.length}</b>
              </Message>

              <hr />
              <br />
              {savingResult ? (
                <div
                  style={{
                    display: "block",
                    width: 1000,
                    padding: 10,
                  }}
                >
                  <Spinner style={{ width: "2rem", height: "2rem" }} />
                  <b style={{ color: "#992E62", fontSize: "14px" }}>
                    {" "}
                    <PanToolIcon /> requesting HTS ML predictions...
                  </b>
                </div>
              ) : (
                " "
              )}
              {savingPrediction ? (
                <Stack sx={{ width: "70%" }} spacing={2}>
                  <Alert
                    severity="info"
                    style={{ fontSize: "16px", color: "000" }}
                  >
                    <b>ML Prediction Result for HTS Patient :</b>{" "}
                    {predictionRanges(predictionValue[1])}
                  </Alert>

                  <Button
                    content="Provide Feedback"
                    style={{ backgroundColor: "#014d88", color: "#fff" }}
                    onClick={toggleModal}
                    disabled={savingFeedback ? true : false}
                  />
                  <br />
                </Stack>
              ) : (
                ""
              )}

              <div
                className="form-group  col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#014D88",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Syndromic STI Screening
              </div>
              {props.patientObj.personResponseDto &&
                props.patientObj.personResponseDto.sex === "Female" && (
                  <>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Complaints of vaginal discharge or burning when
                          urinating?
                        </Label>
                        <select
                          className="form-control"
                          name="vaginalDischarge"
                          id="vaginalDischarge"
                          value={stiScreening.vaginalDischarge}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.vaginalDischarge !== "" ? (
                          <span className={classes.error}>
                            {errors.vaginalDischarge}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Complaints of lower abdominal pains with or without
                          vaginal discharge?
                        </Label>
                        <select
                          className="form-control"
                          name="lowerAbdominalPains"
                          id="lowerAbdominalPains"
                          value={stiScreening.lowerAbdominalPains}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.lowerAbdominalPains !== "" ? (
                          <span className={classes.error}>
                            {errors.lowerAbdominalPains}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )}
              {props.patientObj.personResponseDto &&
                props.patientObj.personResponseDto.sex === "Male" && (
                  <>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Complaints of urethral discharge or burning when
                          urinating?
                        </Label>
                        <select
                          className="form-control"
                          name="urethralDischarge"
                          id="urethralDischarge"
                          value={stiScreening.urethralDischarge}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.urethralDischarge !== "" ? (
                          <span className={classes.error}>
                            {errors.urethralDischarge}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Complaints of scrotal swelling and pain</Label>
                        <select
                          className="form-control"
                          name="complaintsOfScrotal"
                          id="complaintsOfScrotal"
                          value={stiScreening.complaintsOfScrotal}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.complaintsOfScrotal !== "" ? (
                          <span className={classes.error}>
                            {errors.complaintsOfScrotal}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Complaints of genital sore(s) or swollen inguinal
                          lymph nodes with or without pains?
                        </Label>
                        <select
                          className="form-control"
                          name="complaintsGenitalSore"
                          id="complaintsGenitalSore"
                          value={stiScreening.complaintsGenitalSore}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        >
                          <option value={""}></option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.complaintsGenitalSore !== "" ? (
                          <span className={classes.error}>
                            {errors.complaintsGenitalSore}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )}
              <Message warning>
                <h4>
                  Calculate the sum of the STI screening. If {">= "}1, should be
                  referred for STI test{" "}
                </h4>
                <b>Score :{stiCount.length}</b>
              </Message>

              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12">
                  <Button
                    content="Check ML Prediction"
                    icon="refresh"
                    labelPosition="left"
                    disabled={mlresult ? true : false}
                    style={{ backgroundColor: "#992E62", color: "#fff" }}
                    onClick={postPredictions}
                  />
                  <Button
                    content="Save & Continue"
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
      <FeedbackModal
        toggleModal={toggleModal}
        openModal={openModal}
        setOpenModal={setOpenModal}
        predictionValue={predictionValue[1]}
        clientId={clientId}
        setSavingFeedback={setSavingFeedback}
      />
    </>
  );
};

export default BasicInfo;
