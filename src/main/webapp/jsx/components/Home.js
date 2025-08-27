import React, { useState, Fragment, lazy, Suspense } from "react";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import LoadingSpinner from "../../reuseables/Loading";
import { useEffect } from "react";
import { getListOfPermission } from "../../utility";
import { useRoles } from "../../hooks/useRoles";
import { usePermissions } from "../../hooks/usePermissions";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";
import { url as baseUrl } from "./../../api";
import { token as token } from "./../../api";
import { getAcount } from "../../utility";

const PatientList = lazy(() => import("./Patient/PatientList"));
const HTSList = lazy(() => import("./Patient/HTSList"));
const HIVSTPatient = lazy(() => import("./Patient/HIVST/HIVSTPatient"));
const CheckedInPatients = lazy(() => import("./Patient/CheckedInPatients"));



const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = () => {
  const { loading } = usePermissions();
  const { hasRole, loading: rolesLoading } = useRoles();
  const [key, setKey] = useState("patients");
  const [, setActiveTab] = useState("patients");

  const handleTabSelect = (k) => {
    setKey(k);
    setActiveTab(k);
  };

  const isRDE = hasRole("RDE");

  useEffect(() => {
    const permissionsHtsForm = JSON.parse(localStorage.getItem("currentUser_Permission")) || []
    const lowerCaseArrayPermissions = permissionsHtsForm?.map(str => str.toLowerCase())
    const htsApprovedForms = getListOfPermission(lowerCaseArrayPermissions)
    localStorage.setItem("hts_permissions_forms", JSON.stringify(htsApprovedForms))
  }, [])


  const getPermissions = async () => {
    await axios
      .get(`${baseUrl}account`, {

        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {

        let staticPermission = [
          "admin_read",
          "admin_delete",
          "all_permission",
          "admin_write"
        ]

        localStorage.setItem("permissions", staticPermission);
        localStorage.setItem("FacId", response.data.currentOrganisationUnitId);

        let generatedPermission = getListOfPermission(
          staticPermission
        );

        localStorage.setItem(
          "generatedPermission",
          JSON.stringify(generatedPermission)
        );
        let stringifiedPermmision = generatedPermission.map((each, index) => {
          return each.name;
        });

        localStorage.setItem(
          "stringifiedPermmision",
          JSON.stringify(stringifiedPermmision)
        );
      })
      .catch((error) => { });
  };


  const getFacilityAccount = () => {
    getAcount()
      .then((response) => {
      })
      .catch(() => { });
  };


  useEffect(() => {
    getPermissions();
    getFacilityAccount()
    const permissions = localStorage.getItem("permissions")?.split(",");
    let obj = {
      uuid: "",
      type: "",
      clientCode: "",
    };
    localStorage.setItem("index", JSON.stringify(obj));
  }, []);




  useEffect(() => {
    if (!rolesLoading) {
      const defaultTab = isRDE ? "patients" : "checkedin";
      setKey(defaultTab);
      setActiveTab(defaultTab);
    }
  }, [rolesLoading, isRDE]);
  

  const permissions = useMemo(
    () => ({
      canSeeCheckedInPatients: !isRDE, // POC users see this
      canSeeFindPatients: isRDE, // RDE users see this
    }),
    [isRDE]
  );

  if (rolesLoading || loading) {
    return <LoadingSpinner />;
  }

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
      {/* {permissions.canSeeFindPatients && ( */}
        <Link to={"register-patient"}>
          <Button
            variant="contained"
            color="primary"
            className="mt-2 mr-3 mb-0 float-end"
            startIcon={<FaUserPlus size="10" />}
            style={{ backgroundColor: "#014d88" }}
          >
            <span style={{ textTransform: "capitalize" }}>New Patient</span>
          </Button>
        </Link>
      {/* )} */}
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
                  onSelect={handleTabSelect}
                  className="mb-3"
                >
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="patients" title="Patients">
                      <Suspense fallback={<LoadingSpinner />}>
                        {key === "patients" && <PatientList />}
                      </Suspense>
                    </Tab>
                   )}

                  {permissions.canSeeCheckedInPatients && (
                    <Tab eventKey="checkedin" title="Checked-In Patients">
                      <Suspense fallback={<LoadingSpinner />}>
                        {key === "checkedin" && <CheckedInPatients />}
                      </Suspense>
                    </Tab>
                  )}

                  {/* {permissions.canSeeFindPatients && ( */}
                    <Tab eventKey="hts" title="HTS Patients">
                      <Suspense fallback={<LoadingSpinner />}>
                        {key === "hts" && <HTSList />}
                      </Suspense>
                    </Tab>
                    {/* )} */}

                  {/* {permissions.canSeeFindPatients && ( */}
                    <Tab eventKey="hivst" title="HIVST Patients">
                      <Suspense fallback={<LoadingSpinner />}>
                        {key === "hivst" && <HIVSTPatient />}
                      </Suspense>
                    </Tab>
                    {/* )} */}
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