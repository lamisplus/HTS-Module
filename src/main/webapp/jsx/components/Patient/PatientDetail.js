import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import "semantic-ui-css/semantic.min.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import PatientCardDetail from "./PatientCard";
import { useHistory } from "react-router-dom";
import { Tab, Tabs } from "react-bootstrap";
import PatientHistory from "./../History/PatientHistory";
import PatientHtsEnrollment from "./PatientHtsEnrollment";
import ViewEditHivst from "../Patient/HIVST/ViewEditHivst";
import { calculate_age } from "../utils";
import moment from "moment";
import ExistingPatientHtsForm from "../NewToolForms/ExistingPatientHtsForm";
import HtsIctOrchestrator from "../IctForm/HtsIctOrchestrator";
import IctForm from "../IctForm/IctForm";
import { useHtsEligibility } from "../NewToolForms/hooks/useHtsEligibility";
import { toast } from "react-toastify";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";


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
  let history = useHistory();


  const [personInfo, setPersonInfo] = useState(null)
  const [encounters, setEncounters] = useState(null);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEncounterMutated = () => setRefreshKey((k) => k + 1);


  //fetch full patient record here
  const patientObject =
    history.location && history.location.state
      ? history.location.state.patientObject
      : {};

  const patientObj =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};


  const clientCode =
    history.location && history.location.state
      ? history.location.state.clientCode
      : "";


  const patientId = patientObj?.personId || patientObject?.personId || patientObj?.person?.id || patientObject?.person?.id

  const [activePage, setActivePage] = useState({
    activePage: "home",
    activeObject: {},
    actionType: "",
  });

  // Controls which tab PatientHistory opens on.
  // Starts from router state (e.g. "NEW HTS" from PatientList),
  // but resets to "home" after any update/view action so we never
  // bounce back to the NEW HTS tab after saving an edit.
  const [patientHistoryDefaultTab, setPatientHistoryDefaultTab] = useState(
    history?.location?.state?.activepage ?? "home"
  );

  const handleMoveToHome = () => {
    setActivePage({
      activePage: "home",
      activeObject: {},
      actionType: "",
    });
    // After returning from view/update, land on HTS History — not NEW HTS
    setPatientHistoryDefaultTab("home");
  }


  const fetchEncounters = async () => {
    setIsLoadingEncounters(true);
    try {
      const data = await getHtsEcounterForAPatient(patientId);
      setEncounters(Array.isArray(data) ? data : []);
      setPersonInfo(Array.isArray(data) ? data?.[0]?.person : null)
    } catch {
      toast.error("Failed to load HTS encounter history.");
    } finally {
      setIsLoadingEncounters(false);
    }
  };


  useEffect(() => {
    fetchEncounters();
  }, [activePage, refreshKey]);



  const patientAge = calculate_age(
    moment(patientObj.dateOfBirth).format("YYYY-MM-DD")
  );

  const { isPatientEligibleForHts, eligibilityReason, confirmatoryResult, finalHivTestResult } = useHtsEligibility(
    encounters,
    isLoadingEncounters, refreshKey
  );

  return (
    <div className={classes.root}>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              {" "}
              <Link to={"/"}>HTS /</Link> Patient Dashboard
            </h4>
          </li>
        </ol>
      </div>

      <Card>
        <CardContent>
          <PatientCardDetail
            patientObj={personInfo || patientObj || patientObject}
            clientCode={patientObject?.clientCode || patientObj?.clientCode || encounters?.[0]?.observation?.clientCode || ""}
            patientObject={personInfo || patientObject || patientObj}
            setPersonInfo={setPersonInfo}
            isLoadingEncounters={isLoadingEncounters}
            clientEligibility={{ isPatientEligibleForHts, eligibilityReason, confirmatoryResult, finalHivTestResult }}
          />

          {activePage.activePage === "home" && (
            <PatientHistory
              patientObj={patientObj}
              activePage={patientHistoryDefaultTab}
              checkedInPatient={
                history?.location?.state?.checkedInPatient
                  ? history?.location?.state?.checkedInPatient
                  : ""
              }
              setActivePage={setActivePage}
              clientCode={patientObject?.clientCode || patientObj?.clientCode || ""}
              patientAge={patientObj?.data?.age}
              clientEligibility={{ isPatientEligibleForHts, eligibilityReason, confirmatoryResult }}
              onEncounterMutated={handleEncounterMutated}
              refreshKey={refreshKey}

            />
          )}


          {activePage.actionType === "view" && (
            <ExistingPatientHtsForm
              readOnly
              initialValues={patientObj?.data}
              fullRecord={activePage?.activeObject}
              backButtonAction={handleMoveToHome}
            />
          )}


          {activePage.activePage === "update" && (
            <ExistingPatientHtsForm
              readOnly={false}
              initialValues={patientObj?.data}
              backButtonAction={handleMoveToHome}
              fullRecord={activePage?.activeObject}

            />
          )}

          {
            activePage.activePage === "ict-view" && (
              <IctForm
                initialValues={activePage.activeObject}
                onBack={handleMoveToHome}
                onSubmitSuccess={handleMoveToHome}
                existingId={activePage.activeObject?.id}
                readOnly
              />
            )}

          {
            activePage.activePage === "ict-update" && (
              <IctForm
                initialValues={activePage.activeObject}
                onBack={handleMoveToHome}
                onSubmitSuccess={handleMoveToHome}
                existingId={activePage.activeObject?.id}
              />
            )}

          {activePage.activePage === "hivst_view" && (
            <ViewEditHivst
              patientObj={patientObj}
              activePage={activePage}
              setActivePage={setActivePage}
              // clientCode={clientCode}
              clientCode={patientObject?.clientCode || patientObj?.clientCode || ""}
              patientAge={patientAge}
              patientObject={patientObject}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);