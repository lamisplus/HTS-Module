import React, { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { url as baseUrl } from "./../../../api";
import { token as token } from "./../../../api";
//import { makeStyles } from "@material-ui/core/styles";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import History from "./History";
import ContineousRegistrationTesting from "./../Patient/ContineousRegistrationTesting";
//import CheckedInPatients from './Patient/CheckedInPatients'
import * as moment from "moment";
import ExistenceClientHIVSTRegistration from "../Patient/HIVST/ExistenceClientHIVSTRegistration";
import HIVSTPatientHistory from "../Patient/HIVST/HIVSTPatientHistory";
import { getCheckModalityForHTS } from "../../../utility";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};



const Home = (props) => {

  // State definitions
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHTSType, setNewHTSType] = useState("NEW HTS");
  const [LMP, setLMP] = useState("");

  const patientId =
    props.patientObj && props.patientObj.personId
      ? props.patientObj.personId
      : props.patientObj.id
      ? props.patientObj.id
        : "";
  
  console.log("patientId", patientId);

  const [key, setKey] = useState(
    props.activePage === "NEW HTS" ? "new" : "home"
  );

  const [lastHts, setLastHTS] = useState({});
  const [patientInfo, setPatientInfo] = useState(null);
  const [permissions, setPermission] = useState(
    JSON.parse(localStorage.getItem("stringifiedPermmision"))
  );
  const [lastVisitCount, setLastVisitCount] = useState(null);
  const [checkModality, setCheckModality] = useState("");
  const [lastVistAndModality, setLastVistAndModality] = useState(false);
  const [lastVisitModalityAndCheckedIn, setLastVisitModalityAndCheckedIn] = useState(false);



  const calculateLastVisitDate = (visitDate) => {
    if (!visitDate) return 0;
    
    const monthDifference = moment(
      new Date(moment(new Date()).format("YYYY-MM-DD"))
    ).diff(new Date(visitDate), "months", true);
    
  
    
    return monthDifference;
  };

  // Main function to determine retesting status
  const determineRetestingStatus = async (lastRecord) => {

    let htsType = "NEW HTS";

   
    let hivResult = lastRecord?.hivTestResult || lastRecord?.hivTestResult2;


    if (lastRecord?.id && hivResult && hivResult.toLowerCase() === "negative") {
     
      
      try {
     
        const response = await axios.get(
          `${baseUrl}hts/get-anc-lmp?personUuid=${props.patientObj.personUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // If LMP data exists, calculate retesting date range
        if (response.data.result) {
          let lmpDate = moment(response.data.result);
          let retestingRangeDate = moment(lmpDate).add(40 + 52, "weeks");
          let today = moment();

          // If today is within the retesting range (today is before the end date)
          if (retestingRangeDate.diff(today, "days") > 0) {
            htsType = "RETESTING";
          } 
        } 
        // Set LMP data
        setLMP(response.data);
      } catch (error) {
        console.error("Error fetching ANC LMP data:", error);
      }
    } else {
      console.log(
        "Patient either has no record, no HIV result, or result isn't negative. Keeping type as NEW HTS"
      );
    }

    setNewHTSType(htsType);

    return htsType;
  };

  useEffect(() => {
    patients();
    patientsCurrentHts();
    
    if (props.activePage.activePage === "home") {
      setKey("home");
    }
    if (props.activePage.activePage === "NEW HTS") {
      setKey("new");
    }
  }, [props.patientObj, props.activePage]);

  // Get list of patients
  async function patients() {
    console.log("Fetching patient list for ID:", patientId);
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${baseUrl}hts/persons/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientList(response.data.htsClientDtoList);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    } finally {
      setLoading(false);
    }
  }


  async function patientsCurrentHts() {

    setLoading(true);
    
    try {
      const response = await axios.get(
        `${baseUrl}hts/persons/${patientId}/current-hts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Set patient info
      setPatientInfo(response.data);
      
      // Calculate visit metrics
      const visitCount = Math.round(calculateLastVisitDate(response.data.dateVisit));
      setLastVisitCount(visitCount);
      
      
      // Check modality
      const modality = getCheckModalityForHTS(
        response.data.riskStratificationResponseDto?.testingSetting
      );
      setCheckModality(modality);


      // Calculate condition for showing tabs
      const condition =
        visitCount >= 3 || modality === "show"
          ? true
          : false;
      
 
      setLastVistAndModality(condition);
      
      const finalCondition = condition || props.checkedInPatient;
      console.log("Final condition with checked-in status:", finalCondition);
      setLastVisitModalityAndCheckedIn(finalCondition);

      await determineRetestingStatus(response.data);
      
      setLastHTS(response.data);
      
    } catch (error) {
      console.error("Error fetching current HTS:", error);
    } finally {
      setLoading(false);
    }
  }



  return (
    <Fragment>
      <br />
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              {/* <!-- Nav tabs --> */}
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => {
                    console.log("Tab selected:", k);
                    setKey(k);
                  }}
                  className="mb-3"
                >
                  <Tab eventKey="home" title="HTS HISTORY">
                    <History
                      patientObj={props.patientObj}
                      setPatientObj={props.setPatientObj}
                      activePage={props.activePage}
                      setActivePage={props.setActivePage}
                      clientCode={props.clientCode}
                      patientAge={props.patientAge}
                      patients={patients}
                      patientList={patientList}
                      loading={loading}
                    />
                  </Tab>
                  
                  {lastVisitModalityAndCheckedIn && (
                    <Tab 
                      eventKey="new" 
                      title={newHTSType}
                      tabClassName={newHTSType === "RETESTING" ? "retesting-tab" : ""}
                    >
                      <ContineousRegistrationTesting
                        patientObj={patientInfo}
                        activePage={props.activePage}
                        setActivePage={props.setActivePage}
                        patientInfo={props.patientInfo}
                        clientCode={props.clientCode}
                        patientAge={props.patientAge}
                        patients={patients}
                        patientList={patientList}
                        checkedInPatient={props.checkedInPatient}
                        personInfo={props.personInfo}
                        newHTSType={newHTSType}
                      />
                    </Tab>
                  )}
                  
                  <Tab eventKey="hivst-history" title="HIVST HISTORY">
                    <HIVSTPatientHistory
                      patientObj={props.patientObj}
                      setPatientObj={props.setPatientObj}
                      activePage={props.activePage}
                      setActivePage={props.setActivePage}
                      clientCode={props.clientCode}
                      patientAge={props.patientAge}
                      patients={patients}
                      patientList={patientList}
                      loading={loading}
                    />
                  </Tab>
                  
                  <Tab eventKey="new-hivst" title="NEW HIVST">
                    <ExistenceClientHIVSTRegistration
                      patientObj={props.patientObj}
                      activePage={props.activePage}
                      setActivePage={props.setActivePage}
                      clientCode={props.clientCode}
                      patientAge={props.patientAge}
                      patients={patients}
                    />
                  </Tab>
                </Tabs>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Home;
