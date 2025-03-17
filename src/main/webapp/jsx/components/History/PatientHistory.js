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
  const [lastVistAndModality, setLastVistAndModality] = useState("");
  const [lastVisitModalityAndCheckedIn, setLastVisitModalityAndCheckedIn] =
    useState(lastVistAndModality || props.checkedInPatient ? true : false);

  //Calculate last date of visit
  const calculateLastVisitDate = (visitDate) => {
    const monthDifference = moment(
      new Date(moment(new Date()).format("YYYY-MM-DD"))
    ).diff(new Date(visitDate), "months", true);
    return monthDifference;
  };




const getRetestingStatus= (lastRecord)=>{
  let hivResult = lastRecord?.hivTestResult? lastRecord?.hivTestResult: lastRecord?.hivTestResult2
  let weekRange = 40 + 52;

// does the patient has HTS record

  if(lastRecord?.id){
      //is the record negative
    if(hivResult){
     let hasHivNegative = hivResult.toLowerCase() === "negative"? true : false;

        if(hasHivNegative){
     //is the patient on ANC table  and get the lmp 
     async  function getLmpFromANC(){
      await  axios
        .get(`${baseUrl}hts/get-anc-lmp?personUuid=${props.patientObj.personUuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if(response.data.result ){
          let lmpDate = moment(response.data.result).format("YYYY-MM-DD")
          // let EDD =moment(response.data.result).add(40, 'weeks').format("YYYY-MM-DD")

          // get retesting range date 
          let retestingRangeDate = moment(response.data.result).add(40 + 52, 'weeks').format("YYYY-MM-DD")
          let today = moment()

          let r =moment(retestingRangeDate)



              if( r.diff(today, 'days')> 0){

                setNewHTSType("RETESTING");

              }else{
                setNewHTSType("NEW HTS");

              }

          }else{
            setNewHTSType("NEW HTS");

          }

          //  return response.data
    
          setLMP(response.data)
        })
        .catch((error) => {
          return "";
        });
    }
      
    
    getLmpFromANC()
 


        }else{
          setNewHTSType("NEW HTS");

        }

    }else{
       setNewHTSType("NEW HTS");
    }
  }else{
    setNewHTSType("NEW HTS");
  }




 




}


  useEffect(() => {
// 
    patients();
    patientsCurrentHts();
    if (props.activePage.activePage === "home") {
      setKey("home");
    }
    if (props.activePage.activePage === "NEW HTS") {
      setKey("new");
    }
  }, [props.patientObj, props.activePage]);
  ///GET LIST OF Patients

  async function patients() {
    setLoading(true);
    axios
      .get(`${baseUrl}hts/persons/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setLoading(false);
        setPatientList(response.data.htsClientDtoList);
      })
      .catch((error) => {
        setLoading(false);
      });
  }
  async function patientsCurrentHts() {
 
    setLoading(true);
    axios
      .get(`${baseUrl}hts/persons/${patientId}/current-hts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //set the last date of visit after the response
        setPatientInfo(response.data);
        setLastVisitCount(
          Math.round(calculateLastVisitDate(response.data.dateVisit))
        );
        setCheckModality(
          getCheckModalityForHTS(
            response.data.riskStratificationResponseDto?.testingSetting
          )
        );

        // new adjustment-- for patient with pmtct modality, they should skip the 3 month
        let condition =
          Math.round(calculateLastVisitDate(response.data.dateVisit)) >= 3 ||
          getCheckModalityForHTS(
            response.data.riskStratificationResponseDto?.testingSetting
          ) === "show"
            ? true
            : false;

        setLastVistAndModality(condition);
        setLastVisitModalityAndCheckedIn(
          condition || props.checkedInPatient ? true : false
        );

        //get the last HTS 

      getRetestingStatus(response.data);

        setLastHTS(response.data)
      })
      .catch((error) => {
        //setLoading(false)
      });
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
                  onSelect={(k) => setKey(k)}
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
                  {/* lastVistAndModality */}

                  {lastVisitModalityAndCheckedIn && (
                    <Tab eventKey="new" title={newHTSType}>
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
                  {/* uncomment E001 */}
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
