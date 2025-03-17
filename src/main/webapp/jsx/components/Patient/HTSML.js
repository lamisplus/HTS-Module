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
import { token, url as baseUrl } from "../../../api";


import { Label as LabelRibbon, Button, Message } from "semantic-ui-react";
import { error } from "highcharts";

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

const HTSml = (props) => {
  const classes = useStyles();
  let history = useHistory();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  let temp = { ...errors };

// New payload 
const [payload, setPayload] = useState({
    IsclientHIVscreeningfirsttime: "",
    clientPreviousRiskScore: "",
    clientpreviouslytested: "",
    primaryBasisforDecisionToTest: "",
    // 
    clientTestedmainReason: "",
    clientNotTestedmainReason: "",
    MLRiskScoreCausereassessClient: "",
    MlModelPrediction: "",
    MlRiskScoreContributeToDecision: "",
    agreeWithMLModelRiskScore: "",
    confidentUsingMlRiskAssessment: "",
    

});

const validate = () => {

  payload.IsclientHIVscreeningfirsttime  === "Yes" &&   (temp.clientPreviousRiskScore = payload.clientPreviousRiskScore
    ? ""
    : "This field is required.");

    payload.IsclientHIVscreeningfirsttime  === "Yes" &&   (temp.clientpreviouslytested = payload.clientpreviouslytested
    ? ""
    : "This field is required.");

  setErrors({ ...temp });
  return Object.values(temp).every((x) => x == "");
};



const handlePayload=(e)=>{
  setErrors({ ...temp, [e.target.name]: "" });

    e.preventDefault();
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
    if(e.target.name === "IsclientHIVscreeningfirsttime"){
      setErrors({ ...temp, clientPreviousRiskScore: "", clientpreviouslytested: "" });


    }

  
}


// 







  const handleSubmit = (e) => {
   e.preventDefault();

  };
  
  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h2 style={{ color: "#000" }}>HTS ML FEEDBACK QUESTIONS</h2>
          <br />
       <LabelRibbon
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                {/* <h5 style={{color:'#fff'}}>Knowledge Assessment</h5> */}
              </LabelRibbon>
          <form>
   <div className="row mt-5"> 
   <div className="form-group col-md-4">
                  <FormGroup>
                    <Label for="IsclientHIVscreeningfirsttime? ">Is this client undergoing HIV screening for the first time?  </Label>
                    <select
                      className="form-control"
                      id="IsclientHIVscreeningfirsttime"
                      name="IsclientHIVscreeningfirsttime"
                      onChange={handlePayload}
                      value={payload?.IsclientHIVscreeningfirsttime}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
     
                    </select>
                  </FormGroup>
                </div>

{payload?.IsclientHIVscreeningfirsttime  === "Yes" &&
        <> 
         <div className="form-group col-md-4">
      <FormGroup>
        <Label for="clientPreviousRiskScore ? ">What was the previous risk score for this client  </Label>
        <select
          className="form-control"
          id="clientPreviousRiskScore"
          name="clientPreviousRiskScore"
          onChange={handlePayload}
          value={payload?.clientPreviousRiskScore}
        >
          <option value="">Select</option>
          <option value="High">High</option>
          <option value="Low">Low</option>

        </select>
        {errors.clientPreviousRiskScore !== "" ? (
                    <span className={classes.error}>
                      {errors.clientPreviousRiskScore}
                    </span>
                  ) : (
                    ""
                  )}
      </FormGroup>
    </div>
    <div className="form-group col-md-4">
      <FormGroup>
        <Label for="clientpreviouslytested">Was the client previously tested at the last encounter?</Label>
        <select
          className="form-control"
          id="clientpreviouslytested"
          name="clientpreviouslytested"
          onChange={handlePayload}
          value={payload?.clientpreviouslytested}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>

        </select>
        {errors.clientpreviouslytested !== "" ? (
                    <span className={classes.error}>
                      {errors.clientpreviouslytested}
                    </span>
                  ) : (
                    ""
                  )}

      </FormGroup>
    </div>

    
</>
}

    
<div className="form-group col-md-4">
      <FormGroup>
        <Label for="primaryBasisforDecisionToTest ">What was the primary basis for your decision to test or not test this client? </Label>
        <select
          className="form-control"
          id="primaryBasisforDecisionToTest"
          name="primaryBasisforDecisionToTest"
          onChange={handlePayload}
          value={payload?.primaryBasisforDecisionToTest}
        >


          <option value="">Select</option>
          <option value="ML risk score">	ML risk score</option>
          <option value="Clinical judgment">Clinical judgment</option>
          <option value="Client history">Client history</option>
          <option value="External factors">External factors</option>

        </select>
      </FormGroup>
    </div>
    <div className="form-group col-md-4">
      <FormGroup>
        <Label for="clientTestedmainReason ">Was the client tested despite a low-risk score, what was the main reason?   </Label>
        <select
          className="form-control"
          id=" clientTestedmainReason?"
          name="clientTestedmainReason"
          onChange={handlePayload}
          value={payload?.clientTestedmainReason}
        >



          <option value="">Select</option>
          <option value="Clinical symptom">Clinical symptoms</option>
          <option value="Client’s request">Client’s request</option>
          <option value="High exposure risk">High exposure risk</option>
          <option value="Others – Free text to specifys">Others – Free text to specifys</option>

        </select>
      </FormGroup>
    </div>  


        <div className="form-group col-md-4">
      <FormGroup>
        <Label for="clientNotTestedmainReason ">Was the client NOT- Tested despite a high-risk score, what was the main reason?   </Label>
        <select
          className="form-control"
          id="clientNotTestedmainReason?"
          name="clientNotTestedmainReason"
          onChange={handlePayload}
          value={payload?.clientNotTestedmainReason}
        >


          <option value="">Select</option>
          <option value="Lack of trust in the ML score">Lack of trust in the ML score</option>
          <option value="Lack of symptoms">Lack of symptoms</option>
          <option value="Client refusal">Client refusal</option>
          <option value="Health-care provider’s decision – free text to specify">	Health-care provider’s decision – free text to specify</option>
          <option value="Other priorities – free text to specify">Other priorities – free text to specify</option>

        </select>
      </FormGroup>
    </div>  


    
        <div className="form-group col-md-4">
      <FormGroup>
        <Label for="MLRiskScoreCausereassessClient "> Did the ML risk score cause you to reassess any initial impressions about this client?
	
 </Label>
        <select
          className="form-control"
          id="MLRiskScoreCausereassessClient?"
          name="MLRiskScoreCausereassessClient"
          onChange={handlePayload}
          value={payload?.MLRiskScoreCausereassessClient}
        >


          <option value="">Select</option>
          <option value="Yes, significantly">Yes, significantly</option>
          <option value="Yes, slightly">Yes, slightly</option>
          <option value="No change">No change</option>
          <option value="Caused doubt">	Caused doubt</option>

        </select>
      </FormGroup>
    </div>  
      

        
        <div className="form-group col-md-4">
      <FormGroup>
        <Label for="MlModelPrediction ">After the test result, how would you rate the ML model’s prediction?
	
 </Label>
        <select
          className="form-control"
          id="MlModelPrediction?"
          name="MlModelPrediction"
          onChange={handlePayload}
          value={payload?.MlModelPrediction}
        >


          <option value="">Select</option>
          <option value="Highly accurate">Highly accurate</option>
          <option value="Mostly accurate">Mostly accurate </option>
          <option value="Somewhat accurate">Somewhat accurate</option>
          <option value="Inaccurate">	Inaccurate</option>

        </select>
      </FormGroup>
    </div>  



    <div className="form-group col-md-4">
      <FormGroup>
        <Label for="MlRiskScoreContributeToDecision ">For this client, did the ML model’s risk score contribute to a more informed testing decision?
	
 </Label>
        <select
          className="form-control"
          id="MlRiskScoreContributeToDecision?"
          name="MlRiskScoreContributeToDecision"
          onChange={handlePayload}
          value={payload?.MlRiskScoreContributeToDecision}
        >


          <option value="">Select</option>
          <option value="Yes, significantly">Yes, significantly</option>
          <option value="Yes, slightly ">Yes, slightly </option>
          <option value="	No change">	No change</option>
          <option value="	Caused doubt">		Caused doubt</option>

        </select>
      </FormGroup>
    </div> 
 


<div className="form-group col-md-4">
      <FormGroup>
        <Label for="agreeWithMLModelRiskScore">Based on your clinical judgment, did you agree with the ML model’s risk score for this client?
	
 </Label>
        <select
          className="form-control"
          id="agreeWithMLModelRiskScore?"
          name="agreeWithMLModelRiskScore"
          onChange={handlePayload}
          value={payload?.agreeWithMLModelRiskScore}
        >


          <option value="">Select</option>
          <option value="	Yes">Yes </option>
          <option value="No">No </option>
          <option value="Somewhat">Somewhat</option>

        </select>
      </FormGroup>
    </div> 

<div className="form-group col-md-4">
      <FormGroup>
        <Label for="confidentUsingMlRiskAssessment">How confident are you in using the AI/ML risk assessment for this patient? 
	
 </Label>
        <select
          className="form-control"
          id="confidentUsingMlRiskAssessment?"
          name="confidentUsingMlRiskAssessment"
          onChange={handlePayload}
          value={payload?.confidentUsingMlRiskAssessment}
        >


          <option value="">Select</option>
          <option value="Very confident">Very confident</option>
          <option value="Somewhat confident">Somewhat confident</option>
          <option value="Not confident">Not confident</option>
          <option value="	Not confident">Not confident</option>

        </select>
      </FormGroup>
    </div> 
     {/*  */}
            <br />

            <div className="row">
              <div className="form-group mb-3 col-md-6 mt-5">
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
   </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default HTSml;
