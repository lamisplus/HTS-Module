import React, { useState, Fragment, lazy, Suspense } from "react";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import Dashboard from "./Patient/PatientList";
import LoadingSpinner from "../../reuseables/Loading";
import { useEffect } from "react";
import { getListOfPermission } from "../../utility";
const HTSList = lazy(() => import("./Patient/HTSList"));
const HIVSTPatient = lazy(() => import("./Patient/HIVST/HIVSTPatient"));
const CheckedInPatients = lazy(() => import("./Patient/CheckedInPatients"));

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = () => {
  const [key, setKey] = useState("checkedin");

  useEffect(() => {

    const permissionsHtsForm = JSON.parse(localStorage.getItem("currentUser_Permission")) || []

    const lowerCaseArrayPermissions = permissionsHtsForm?.map(str => str.toLowerCase())
    console.log("lowerCaseArrayPermissions", lowerCaseArrayPermissions)
    const htsApprovedForms = getListOfPermission(lowerCaseArrayPermissions)
    localStorage.setItem("hts_permissions_forms", JSON.stringify(htsApprovedForms))
  }, [])

  return (
    <Fragment>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>HTS</h4>
          </li>
        </ol>
      </div>

      <br />
      <br /> <br />
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                >
                  <Tab eventKey="checkedin" title="Checked-In Patients">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "checkedin" && <CheckedInPatients />}
                    </Suspense>
                  </Tab>

                  {/*<Tab eventKey="home" title="Patients">*/}
                  {/*  <Suspense fallback={<LoadingSpinner />}>*/}
                  {/*    {key === "home" && <Dashboard />}*/}
                  {/*  </Suspense>*/}
                  {/*</Tab>*/}



                  <Tab eventKey="hts" title="HTS Patients">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "hts" && <HTSList />}
                    </Suspense>
                  </Tab>

                  <Tab eventKey="hivst" title="HIVST Patients">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "hivst" && <HIVSTPatient />}
                    </Suspense>
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
