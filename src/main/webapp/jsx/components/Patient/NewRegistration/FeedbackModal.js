import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import { token, url as baseUrl } from "../../../../api";
import { Label as LabelRibbon, Button, Message } from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";

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

const styles = {
  color: "#f85032",
  fontSize: "11px",
};

const FeedbackModal = ({
  openModal,
  toggleModal,
  setOpenModal,
  predictionValue,
  clientId,
  setSavingFeedback,
}) => {
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  let temp = { ...errors };

  const [payload, setPayload] = useState({
    facilityId: 0,
    patientId: clientId,
    primaryBasisToTest: "",
    clientTestedDespiteLowRiskScore: "",
    reasonForTestingDespiteLowRiskScore: "",
    clientTestedDespiteHighRiskScore: "",
    mainReasonForTestingThisClient: "",
    optionMainReasonForTestingThisClient: "",
    mainReasonForNotTestingThisClient: "",
    optionMainReasonForNotTestingThisClient: "",
    riskScoreContributeToTheClinicalDecision: "",
  });

  const validate = () => {
    const temp = { ...errors };

    temp.primaryBasisToTest = payload.primaryBasisToTest
      ? ""
      : "This field is required.";

    temp.clientTestedDespiteLowRiskScore =
      payload.clientTestedDespiteLowRiskScore ? "" : "This field is required.";

    temp.reasonForTestingDespiteLowRiskScore =
      payload.reasonForTestingDespiteLowRiskScore
        ? ""
        : "This field is required.";

    temp.creasonForTestingDespiteLowRiskScore =
      payload.reasonForTestingDespiteLowRiskScore
        ? ""
        : "This field is required.";

    temp.clientTestedDespiteHighRiskScore =
      payload.clientTestedDespiteHighRiskScore ? "" : "This field is required.";

    temp.mainReasonForTestingThisClient = payload.mainReasonForTestingThisClient
      ? ""
      : "This field is required.";

    temp.optionMainReasonForTestingThisClient =
      payload.optionMainReasonForTestingThisClient
        ? ""
        : "This field is required.";

    temp.mainReasonForNotTestingThisClient =
      payload.mainReasonForNotTestingThisClient
        ? ""
        : "This field is required.";

    temp.optionMainReasonForNotTestingThisClient =
      payload.optionMainReasonForNotTestingThisClient
        ? ""
        : "This field is required.";

    temp.riskScoreContributeToTheClinicalDecision =
      payload.riskScoreContributeToTheClinicalDecision
        ? ""
        : "This field is required.";
    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  const handlePayload = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });

    e.preventDefault();
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "primaryBasisToTest") {
      setErrors({
        ...temp,
        clientTestedDespiteLowRiskScore: "",
        reasonForTestingDespiteLowRiskScore: "",
      });
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();

    //if (validate()) {
    setSaving(true);
    axios
      .post(`${baseUrl}feedback`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((resp) => {
        console.log("ML Feedback Submitted", resp);

        toast.success(`HTS ML Feedback Submitted Sucessfully`, {
          position: toast.POSITION.BOTTOM_CENTER,
          duration: 3000,
        });
        setSaving(false);
        setOpenModal(!openModal);
        setSavingFeedback(true);
      })
      .catch((err) => {
        toast.error(`Something went wrong. Please try again...${err}`, {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        setSaving(false);
      });
    //}
  };

  return (
    <>
      <Modal
        show={openModal}
        toggle={toggleModal}
        className="fade"
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <Card className={classes.root}>
            <CardBody>
              <h2 style={{ color: "#000" }}>HTS ML FEEDBACK QUESTIONS</h2>
              <br />
              <LabelRibbon
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              ></LabelRibbon>
              <form>
                <div className="row mt-5">
                  <div className="form-group col-md-4">
                    <FormGroup>
                      <Label for="primaryBasisToTest? ">
                        What was the primary basis for your decision to test or
                        not test this client?{" "}
                      </Label>
                      <select
                        className="form-control"
                        id="primaryBasisToTest"
                        name="primaryBasisToTest"
                        onChange={handlePayload}
                        value={payload?.primaryBasisToTest}
                      >
                        <option value="">Select</option>
                        <option value="ML risk score">ML risk score</option>
                        <option value="Clinical judgment">
                          Clinical judgment
                        </option>
                        <option value="Client history">Client history</option>
                        <option value="External factors">
                          External factors
                        </option>
                      </select>
                      {errors.primaryBasisToTest !== "" ? (
                        <span style={styles}>{errors.primaryBasisToTest}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {parseFloat(predictionValue) < 0.005575358 && (
                    <>
                      <div className="form-group col-md-4">
                        <FormGroup>
                          <Label for="clientTestedDespiteLowRiskScore ? ">
                            Was the client tested despite a low-risk score{" "}
                          </Label>
                          <select
                            className="form-control"
                            id="clientTestedDespiteLowRiskScore"
                            name="clientTestedDespiteLowRiskScore"
                            onChange={handlePayload}
                            value={payload?.clientTestedDespiteLowRiskScore}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                          {errors.clientTestedDespiteLowRiskScore !== "" ? (
                            <span className={classes.error}>
                              {errors.clientTestedDespiteLowRiskScore}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                      {payload?.clientTestedDespiteLowRiskScore === "Yes" && (
                        <div className="form-group col-md-4">
                          <FormGroup>
                            <Label for="reasonForTestingDespiteLowRiskScore">
                              What was the main reason for testing despite a
                              low-risk score?
                            </Label>
                            <select
                              className="form-control"
                              id="reasonForTestingDespiteLowRiskScore"
                              name="reasonForTestingDespiteLowRiskScore"
                              onChange={handlePayload}
                              value={
                                payload?.reasonForTestingDespiteLowRiskScore
                              }
                            >
                              <option value="">Select</option>
                              <option value="Clinical symptoms">
                                Clinical symptoms
                              </option>
                              <option value="Client’s request">
                                Client’s request
                              </option>
                              <option value="High exposure risk">
                                High exposure risk
                              </option>
                              <option value="Others – Free text to specify">
                                Others – Free text to specify
                              </option>
                            </select>
                            {errors.reasonForTestingDespiteLowRiskScore !==
                            "" ? (
                              <span className={classes.error}>
                                {errors.reasonForTestingDespiteLowRiskScore}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {payload?.clientTestedDespiteLowRiskScore === "Yes" &&
                        payload?.reasonForTestingDespiteLowRiskScore ===
                          "Others – Free text to specify" && (
                          <div className="form-group col-md-4">
                            <FormGroup>
                              <Label for="optionMainReasonForTestingThisClient ">
                                Free text to specify?{" "}
                              </Label>
                              <input
                                className="form-control"
                                type="text"
                                id="optionMainReasonForTestingThisClient?"
                                name="optionMainReasonForTestingThisClient"
                                onChange={handlePayload}
                                value={
                                  payload?.optionMainReasonForTestingThisClient
                                }
                              />

                              {errors.optionMainReasonForTestingThisClient !==
                              "" ? (
                                <span style={styles}>
                                  {errors.optionMainReasonForTestingThisClient}
                                </span>
                              ) : (
                                ""
                              )}
                            </FormGroup>
                          </div>
                        )}
                    </>
                  )}
                  {parseFloat(predictionValue) > 0.02719647 && (
                    <>
                      <div className="form-group col-md-4">
                        <FormGroup>
                          <Label for="clientTestedDespiteHighRiskScore ">
                            Was the client Tested with a high-risk score?{" "}
                          </Label>
                          <select
                            className="form-control"
                            id="clientTestedDespiteHighRiskScore"
                            name="clientTestedDespiteHighRiskScore"
                            onChange={handlePayload}
                            value={payload?.clientTestedDespiteHighRiskScore}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                          {errors.clientTestedDespiteHighRiskScore !== "" ? (
                            <span style={styles}>
                              {errors.clientTestedDespiteHighRiskScore}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                      {payload?.clientTestedDespiteHighRiskScore === "Yes" && (
                        <div className="form-group col-md-4">
                          <FormGroup>
                            <Label for="mainReasonForTestingThisClient ">
                              What was the main reason for testing this client?{" "}
                            </Label>
                            <select
                              className="form-control"
                              id=" mainReasonForTestingThisClient?"
                              name="mainReasonForTestingThisClient"
                              onChange={handlePayload}
                              value={payload?.mainReasonForTestingThisClient}
                            >
                              <option value="">Select</option>
                              <option value="Trust in the ML score">
                                Trust in the ML score
                              </option>
                              <option value="Symptoms">Symptoms</option>
                              <option value="Client Choice">
                                Client Choice
                              </option>
                              <option value="Health-care provider’s decision">
                                Health-care provider’s decision
                              </option>
                              <option value="Other priorities">
                                Other priorities
                              </option>
                            </select>
                            {errors.mainReasonForTestingThisClient !== "" ? (
                              <span style={styles}>
                                {errors.mainReasonForTestingThisClient}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {(payload?.mainReasonForTestingThisClient ===
                        "Health-care provider’s decision" ||
                        payload?.mainReasonForTestingThisClient ===
                          "Other priorities") && (
                        <div className="form-group col-md-4">
                          <FormGroup>
                            <Label for="optionMainReasonForTestingThisClient ">
                              optional main reason?{" "}
                            </Label>
                            <input
                              className="form-control"
                              type="text"
                              id="optionMainReasonForTestingThisClient?"
                              name="optionMainReasonForTestingThisClient"
                              onChange={handlePayload}
                              value={
                                payload?.optionMainReasonForTestingThisClient
                              }
                            />

                            {errors.optionMainReasonForTestingThisClient !==
                            "" ? (
                              <span style={styles}>
                                {errors.optionMainReasonForTestingThisClient}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {payload?.clientTestedDespiteHighRiskScore === "No" && (
                        <div className="form-group col-md-4">
                          <FormGroup>
                            <Label for="mainReasonForNotTestingThisClient ">
                              {" "}
                              What was the main reason for not testing this
                              client?
                            </Label>
                            <select
                              className="form-control"
                              id="mainReasonForNotTestingThisClient?"
                              name="mainReasonForNotTestingThisClient"
                              onChange={handlePayload}
                              value={payload?.mainReasonForNotTestingThisClient}
                            >
                              <option value="">Select</option>
                              <option value="Lack of trust in the ML score">
                                Lack of trust in the ML score
                              </option>
                              <option value="No noticeable symptoms">
                                No noticeable symptoms
                              </option>
                              <option value="Client refusal">
                                Client refusal
                              </option>
                              <option value="Health-care provider’s decision">
                                {" "}
                                Health-care provider’s decision
                              </option>
                            </select>
                            {errors.mainReasonForNotTestingThisClient !== "" ? (
                              <span style={styles}>
                                {errors.mainReasonForNotTestingThisClient}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                      {payload?.mainReasonForNotTestingThisClient ===
                        "Health-care provider’s decision" && (
                        <div className="form-group col-md-4">
                          <FormGroup>
                            <Label for="optionMainReasonForNotTestingThisClient ">
                              optional Reason For Not Testing?
                            </Label>
                            <input
                              className="form-control"
                              type="text"
                              id="optionMainReasonForNotTestingThisClient?"
                              name="optionMainReasonForNotTestingThisClient"
                              onChange={handlePayload}
                              value={
                                payload?.optionMainReasonForNotTestingThisClient
                              }
                            />
                            {errors.optionMainReasonForNotTestingThisClient !==
                            "" ? (
                              <span style={styles}>
                                {errors.optionMainReasonForNotTestingThisClient}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      )}
                    </>
                  )}
                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label for="riskScoreContributeToTheClinicalDecision ">
                          Did the ML model risk score contribute to the
                          clinical decision-making regarding testing for this
                          client?
                        </Label>
                        <select
                          className="form-control"
                          id="riskScoreContributeToTheClinicalDecision?"
                          name="riskScoreContributeToTheClinicalDecision"
                          onChange={handlePayload}
                          value={
                            payload?.riskScoreContributeToTheClinicalDecision
                          }
                        >
                          <option value="">Select</option>
                          <option value="Yes, significantly">
                            Yes, significantly
                          </option>
                          <option value="Yes, slightly ">Yes, slightly</option>
                          <option value="No change">No change</option>
                          <option value="Caused doubt">Caused doubt</option>
                        </select>
                        {errors.riskScoreContributeToTheClinicalDecision !==
                        "" ? (
                          <span style={styles}>
                            {errors.riskScoreContributeToTheClinicalDecision}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  <br />

                  <div className="row">
                    <div className="form-group mb-3 col-md-6 mt-5">
                      <Button
                        content="Cancel"
                        type="reset"
                        icon="cancel"
                        labelPosition="right"
                        style={{
                          backgroundColor: "rgb(153, 46, 98)",
                          color: "#fff",
                        }}
                        onClick={() => {
                          setOpenModal(!openModal);
                        }}
                        disabled={saving}
                      />
                      <Button
                        content="Save"
                        type="submit"
                        icon="save"
                        labelPosition="right"
                        style={{ backgroundColor: "#014d88", color: "#fff" }}
                        onClick={handleSubmitFeedback}
                        disabled={saving}
                      />
                      {saving && <Spinner animation="border" />}
                    </div>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FeedbackModal;
