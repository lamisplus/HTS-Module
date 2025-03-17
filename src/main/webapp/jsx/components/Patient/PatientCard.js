import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
//import classNames from 'classnames';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
//import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
// import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
//import Chip from '@material-ui/core/Chip';
//import Divider from '@material-ui/core/Divider';
import { Link } from "react-router-dom";
import ButtonMui from "@material-ui/core/Button";
import "semantic-ui-css/semantic.min.css";
import { Col, Row } from "reactstrap";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import axios from "axios";
import { url as baseUrl, token } from "./../../../api";
import Typography from "@material-ui/core/Typography";
import { Label, Sticky } from "semantic-ui-react";
import { calculate_age } from "../utils";
//Dtate Picker package
Moment.locale("en");
momentLocalizer();

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "20.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

function PatientCard(props) {
  const { classes } = props;
  //const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
  const patientObjs = props.patientObj ? props.patientObj : {};
  //const permissions= props.permissions ? props.permissions : [];
  const [patientObj, setPatientObj] = useState(null);
  const [hivStatus, setHivStatus] = useState("false");
  const [htscount, setHtscount] = useState(0);
  const [htsResult, setHtsResult] = useState("");
  const [htsResult2, setHtsResult2] = useState("");

  useEffect(() => {
    PatientCurrentObject();
  }, []);

  ///GET LIST OF Patients
  async function PatientCurrentObject() {
    axios
      .get(
        `${baseUrl}hts/persons/${
          patientObjs.personId ? patientObjs.personId : patientObjs.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setPatientObj(response.data);

        props.setPersonInfo(response.data)
        setHtscount(response.data.htsCount);
        setHtsResult(
          response.data.htsClientDtoList[
            response.data.htsClientDtoList.length - 1
          ].hivTestResult
        );
        setHtsResult2(
          response.data.htsClientDtoList[
            response.data.htsClientDtoList.length - 1
          ].hivTestResult2
        );
      })
      .catch((error) => {});
  }

  const getHospitalNumber = (identifier) => {
    const identifiers = identifier;
    const hospitalNumber = identifiers?.identifier?.find(
      (obj) => obj.type == "HospitalNumber"
    );
    return hospitalNumber ? hospitalNumber.value : "";
  };
  const getPhoneNumber = (identifier) => {
    const identifiers = identifier;
    const phoneNumber = identifiers?.contactPoint?.find(
      (obj) => obj.type == "phone"
    );
    return phoneNumber ? phoneNumber.value : "";
  };
  const getAddress = (identifier) => {
    const identifiers = identifier;
    const address = identifiers?.address?.find((obj) => obj.city);
    const houseAddress =
      address && address.line[0] !== null ? address.line[0] : "";
    const landMark =
      address && address.city && address.city !== null ? address.city : "";
    return address ? houseAddress + " " + landMark : "";
  };

  return (
    <Sticky>
      <div className={classes.root}>
        <ExpansionPanel>
          <ExpansionPanelSummary>
            <Row>
              <Col md={12}>
                <Row className={"mt-1"}>
                  {patientObj && patientObj !== null ? (
                    <>
                      <Col md={12} className={classes.root2}>
                        <b
                          style={{
                            fontSize: "25px",
                            color: "rgb(153, 46, 98)",
                          }}
                        >
                          {patientObj.personResponseDto.firstName +
                            " " +
                            patientObj.personResponseDto.surname}
                        </b>
                        <Link to={"/"}>
                          <ButtonMui
                            variant="contained"
                            color="primary"
                            className="float-end ms-2 mr-2 mt-2"
                            //startIcon={<FaUserPlus size="10"/>}
                            style={{
                              backgroundColor: "rgb(153, 46, 98)",
                              color: "#fff",
                              height: "35px",
                            }}
                          >
                            <span style={{ textTransform: "capitalize" }}>
                              Back
                            </span>
                          </ButtonMui>
                        </Link>
                      </Col>
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Patient ID :
                          <b style={{ color: "#0B72AA" }}>
                            {getHospitalNumber(
                              patientObj.personResponseDto.identifier
                            )}
                          </b>
                        </span>
                      </Col>

                      <Col md={4} className={classes.root2}>
                        <span>
                          Date Of Birth :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {patientObj.personResponseDto.dateOfBirth}
                          </b>
                        </span>
                      </Col>
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Age :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {calculate_age(
                              moment(
                                patientObj.personResponseDto.dateOfBirth
                              ).format("YYYY-MM-DD")
                            )}
                          </b>
                        </span>
                      </Col>
                      <Col md={4}>
                        <span>
                          {" "}
                          Gender :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {patientObj.personResponseDto &&
                            patientObj.personResponseDto.sex !== null
                              ? patientObj.personResponseDto.sex
                              : ""}
                          </b>
                        </span>
                      </Col>
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Phone Number :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {getPhoneNumber(
                              patientObj.personResponseDto.contactPoint
                            )}
                          </b>
                        </span>
                      </Col>
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Address :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {getAddress(patientObj.personResponseDto.address)}{" "}
                          </b>
                        </span>
                      </Col>
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Client Code :{" "}
                          <b style={{ color: "#0B72AA" }}>
                            {patientObj && patientObj?.clientCode
                              ? patientObj?.clientCode
                              : ""}{" "}
                          </b>
                        </span>
                      </Col>
                      <Col md={12}>
                        <div>
                          <Typography variant="caption">
                            {htscount < 1 ? (
                              <Label color="blue" size={"mini"}>
                                STATUS : Not Tested
                              </Label>
                            ) : patientObj &&
                              (htsResult === "Positive" ||
                                htsResult === "Positive") ? (
                              <Label color={"red"} size={"mini"}>
                                STATUS : Positive
                              </Label>
                            ) : (
                              <Label color="teal" size={"mini"}>
                                STATUS : Negative
                              </Label>
                            )}
                          </Typography>
                        </div>
                      </Col>
                    </>
                  ) : (
                    <p>Loading Please wait...</p>
                  )}
                </Row>
              </Col>
            </Row>
          </ExpansionPanelSummary>
        </ExpansionPanel>
      </div>
    </Sticky>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
