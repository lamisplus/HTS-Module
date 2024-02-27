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

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = (props) => {
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientId =
    props.patientObj && props.patientObj.personId
      ? props.patientObj.personId
      : null;
  const [key, setKey] = useState("home");
  const [lastVisitCount, setLastVisitCount] = useState(null);
  //Calculate last date of visit
  const calculateLastVisitDate = (visitDate) => {
    const monthDifference = moment(
      new Date(moment(new Date()).format("YYYY-MM-DD"))
    ).diff(new Date(visitDate), "months", true);
    //console.log(monthDifference)
    return monthDifference;
  };
  useEffect(() => {
    patients();
    patientsCurrentHts();
    if (props.activePage.activePage === "home") {
      setKey("home");
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
        //console.log(response.data)
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
        setLastVisitCount(
          Math.round(calculateLastVisitDate(response.data.dateVisit))
        );
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
                      activePage={props.activePage}
                      setActivePage={props.setActivePage}
                      clientCode={props.clientCode}
                      patientAge={props.patientAge}
                      patients={patients}
                      patientList={patientList}
                      loading={loading}
                    />
                  </Tab>
                  {lastVisitCount !== null &&
                    lastVisitCount >= 3 && ( //check if the last test is more than 3months
                      <Tab eventKey="new" title="NEW HTS">
                        <ContineousRegistrationTesting
                          patientObj={props.patientObj}
                          activePage={props.activePage}
                          setActivePage={props.setActivePage}
                          clientCode={props.clientCode}
                          patientAge={props.patientAge}
                          patients={patients}
                        />
                      </Tab>
                    )}
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
