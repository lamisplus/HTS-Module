import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { useHistory } from "react-router-dom";
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import { Label as LabelRibbon, Button, Message } from "semantic-ui-react";
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
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

const PostTest = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const patientID =
    props.patientObj && props.patientObj.personResponseDto
      ? props.patientObj.personResponseDto.id
      : "";
  const clientId =
    props.patientObj && props.patientObj ? props.patientObj.id : "";
  const [saving, setSaving] = useState(false);
  const [permissions, setPermission] = useState(
    localStorage.getItem("stringifiedPermmision")?.split(",")
  );
  const [nextForm, setNextForm] = useState([]);
  ///const [errors, setErrors] = useState({});
  const [objValues, setObjValues] = useState({
    htsClientId: clientId,
    postTestCounselingKnowledgeAssessment: {},
    personId: patientID,
  });
 
  const [postTest, setPostTest] = useState({
    hivTestResult: "",
    hivTestBefore:
      props.patientObj?.riskStratificationResponseDto?.riskAssessment
        ?.lastHivTestDone !== "Never" &&
      props.patientObj?.riskStratificationResponseDto?.riskAssessment
        ?.whatWasTheResult === "Positive"
        ? "Previously tested positive in HIV care"
        : "",
    hivRequestResult: "",
    hivRequestResultCt: "",
    clientReceivedHivTestResult: "",
    postTestCounseling: "",
    riskReduction: "",
    postTestDisclosure: "",
    bringPartnerHivtesting: "",
    childrenHivtesting: "",
    informationFp: "",
    partnerFpThanCondom: "",
    partnerFpUseCondom: "",
    correctCondomUse: "",
    condomProvidedToClient: "",
    unprotectedSexRegularPartnerLastThreeMonth: "",
    referredToServices: "",
    condomProvidedToClientCount: "",
    lubricantProvidedToClientCount: "",
  });
  useEffect(() => {
    if (
      props.patientObj &&
      props.patientObj.postTestCounselingKnowledgeAssessment
    ) {
      setPostTest(props.patientObj.postTestCounselingKnowledgeAssessment);
    } else {
      ///setPostTest(props.patientObj && props.patientObj.postTestCounselingKnowledgeAssessment!==null ? props.patientObj.postTestCounselingKnowledgeAssessment : {})
      if (
        postTest.hivTestResult === "" &&
        props.patientObj.hivTestResult2 !== "" &&
        props.patientObj.hivTestResult2 !== null &&
        props.patientObj.hivTestResult2 === "Positive"
      ) {
        postTest.hivTestResult = "true";
        setPostTest({ ...postTest, hivTestResult: "true" });
      } else if (
        postTest.hivTestResult === "" &&
        props.patientObj.hivTestResult2 !== "" &&
        props.patientObj.hivTestResult2 !== null &&
        props.patientObj.hivTestResult2 === "Negative"
      ) {
        postTest.hivTestResult = "false";
        setPostTest({ ...postTest, hivTestResult: "false" });
      } else if (
        postTest.hivTestResult === "" &&
        props.patientObj.hivTestResult !== "" &&
        props.patientObj.hivTestResult !== null &&
        props.patientObj.hivTestResult === "Positive"
      ) {
        postTest.hivTestResult = "true";
        setPostTest({ ...postTest, hivTestResult: "true" });
      } else if (
        postTest.hivTestResult === "" &&
        props.patientObj.hivTestResult !== "" &&
        props.patientObj.hivTestResult !== null &&
        props.patientObj.hivTestResult === "Negative"
      ) {
        postTest.hivTestResult = "false";
        setPostTest({ ...postTest, hivTestResult: "false" });
      }
    }
  }, [props.patientObj, postTest.hivTestResult]);
  const handleInputChangePostTest = (e) => {
    if (e.target.name === "lubricantProvidedToClientCount") {
      if (e.target.value >= 0) {
        setPostTest({ ...postTest, [e.target.name]: e.target.value });
      }
    } else if (e.target.name === "condomProvidedToClientCount") {
      if (e.target.value >= 0) {
        setPostTest({ ...postTest, [e.target.name]: e.target.value });
      } else {
        setPostTest({ ...postTest, [e.target.name]: 0 });
      }
    } else {
      setPostTest({ ...postTest, [e.target.name]: e.target.value });
    }
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
    setSaving(true);
     let latestForm = getNextForm(
       "Post_Test_Counseling",
       props?.patientObj?.riskStratificationResponseDto?.age,
       '',
       props?.patientObj?.hivTestResult
     );

    objValues.htsClientId = props.patientObj.id;
    objValues.postTestCounselingKnowledgeAssessment = postTest;
    objValues.personId = props.patientObj.personResponseDto.id;
    axios
      .put(
        `${baseUrl}hts/${props.patientObj.id}/post-test-counseling`,
        objValues,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setSaving(false);
        props.setPatientObj(response.data);
        toast.success("Post test  successful");
        
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
    // }else{
    //     toast.error("All post test fields are required")

    // }
  };

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2>POST TEST COUNSELING</h2>
          <form>
            <div className="row">
              <LabelRibbon
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                {/* <h5 style={{color:'#fff'}}>Knowledge Assessment</h5> */}
              </LabelRibbon>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>HIV test result </Label>
                  <select
                    className="form-control"
                    name="hivTestResult"
                    id="hivTestResult"
                    value={postTest.hivTestResult}
                    onChange={handleInputChangePostTest}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={true}
                  >
                    <option value={""}></option>
                    <option value="true">Positive</option>
                    <option value="false">Negative</option>
                  </select>
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Have you been tested for HIV before within this year?{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="hivTestBefore"
                    id="hivTestBefore"
                    value={postTest.hivTestBefore}
                    onChange={handleInputChangePostTest}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value={""}></option>
                    <option value="Not previously tested">
                      Not previously tested
                    </option>
                    <option value="Previously tested negative">
                      Previously tested negative
                    </option>
                    <option value="Previously tested positive in HIV care">
                      Previously tested positive in HIV care
                    </option>
                    <option value="Previously tested positive not in HIV care">
                      Previously tested positive not in HIV care
                    </option>
                  </select>
                </FormGroup>
              </div>
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>HIV Request and Result form signed by tester </Label>
                  <select
                    className="form-control"
                    name="hivRequestResult"
                    id="hivRequestResult"
                    value={postTest.hivRequestResult}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    HIV Request and Result form filled with CT Intake Form{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="hivRequestResultCt"
                    id="hivRequestResultCt"
                    value={postTest.hivRequestResultCt}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Client received HIV test result </Label>
                  <select
                    className="form-control"
                    name="clientReceivedHivTestResult"
                    id="clientReceivedHivTestResult"
                    value={postTest.clientReceivedHivTestResult}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Post test counseling done </Label>
                  <select
                    className="form-control"
                    name="postTestCounseling"
                    id="postTestCounseling"
                    value={postTest.postTestCounseling}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Risk reduction plan developed </Label>
                  <select
                    className="form-control"
                    name="riskReduction"
                    id="riskReduction"
                    value={postTest.riskReduction}
                    onChange={handleInputChangePostTest}
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

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Post test disclosure plan developed </Label>
                  <select
                    className="form-control"
                    name="postTestDisclosure"
                    id="postTestDisclosure"
                    value={postTest.postTestDisclosure}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Will bring partner(s) for HIV testing </Label>
                  <select
                    className="form-control"
                    name="bringPartnerHivtesting"
                    id="bringPartnerHivtesting"
                    value={postTest.bringPartnerHivtesting}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Will bring own children {"<5"} years for HIV testing{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="childrenHivtesting"
                    id="childrenHivtesting"
                    value={postTest.childrenHivtesting}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Provided with information on FP and dual contraception{" "}
                  </Label>
                  <select
                    className="form-control"
                    name="informationFp"
                    id="informationFp"
                    value={postTest.informationFp}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>
                    Client/Partner use FP methods (other than condom)
                  </Label>
                  <select
                    className="form-control"
                    name="partnerFpThanCondom"
                    id="partnerFpThanCondom"
                    value={postTest.partnerFpThanCondom}
                    onChange={handleInputChangePostTest}
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

              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Client/Partner use condoms as (one) FP method </Label>
                  <select
                    className="form-control"
                    name="partnerFpUseCondom"
                    id="partnerFpUseCondom"
                    value={postTest.partnerFpUseCondom}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Correct condom use demonstrated </Label>
                  <select
                    className="form-control"
                    name="correctCondomUse"
                    id="correctCondomUse"
                    value={postTest.correctCondomUse}
                    onChange={handleInputChangePostTest}
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
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Condoms provided to client </Label>
                  <select
                    className="form-control"
                    name="condomProvidedToClient"
                    id="condomProvidedToClient"
                    value={postTest.condomProvidedToClient}
                    onChange={handleInputChangePostTest}
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
              {postTest.condomProvidedToClient !== null &&
                postTest.condomProvidedToClient === "true" && (
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>How many condoms were provided to client </Label>
                      <Input
                        type="number"
                        name="condomProvidedToClientCount"
                        id="condomProvidedToClientCount"
                        value={postTest.condomProvidedToClientCount}
                        onChange={handleInputChangePostTest}
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
                  <Label>Lubricant were provided to client </Label>
                  <select
                    className="form-control"
                    name="lubricantProvidedToClient"
                    id="lubricantProvidedToClient"
                    value={postTest.lubricantProvidedToClient}
                    onChange={handleInputChangePostTest}
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
              {postTest.lubricantProvidedToClient !== null &&
                postTest.lubricantProvidedToClient === "true" && (
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>How many lubricant provided to client </Label>
                      <Input
                        type="number"
                        name="lubricantProvidedToClientCount"
                        id="lubricantProvidedToClientCount"
                        value={postTest.lubricantProvidedToClientCount}
                        onChange={handleInputChangePostTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                      />
                    </FormGroup>
                  </div>
                )}
              {/* <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected sex with regular partner in the last 3months</Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedSexRegularPartnerLastThreeMonth"
                                        id="unprotectedSexRegularPartnerLastThreeMonth"
                                        value={postTest.unprotectedSexRegularPartnerLastThreeMonth}
                                        onChange={handleInputChangePostTest}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div> */}
              {/* <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected sex with regular particular in the last 3 months</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div> */}
              <div className="form-group  col-md-4">
                <FormGroup>
                  <Label>Client referred to other services </Label>
                  <select
                    className="form-control"
                    name="referredToServices"
                    id="referredToServices"
                    value={postTest.referredToServices}
                    onChange={handleInputChangePostTest}
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
              <Message success>
                <h4>
                  If client tests HIV negative, and HIV Risk Assessment Score{" "}
                  {">0"} or there is evidence for a STI syndrome, recommend
                  re-testing after 3 months
                </h4>
              </Message>

              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12">
                  {/* <Button
                    content="Back"
                    icon="left arrow"
                    labelPosition="left"
                    style={{ backgroundColor: "#992E62", color: "#fff" }}
                    onClick={() => handleItemClick("hiv-test", "hiv-test")}
                  /> */}

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
    </>
  );
};

export default PostTest;
