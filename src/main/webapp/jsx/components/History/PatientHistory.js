// PatientHistory.js
import React, { useState, Suspense, Fragment, useEffect, useMemo, lazy } from "react";
import axios from "axios";
import { url as baseUrl, url } from "./../../../api";
import { token as token } from "./../../../api";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import * as moment from "moment";
import { getCheckModalityForHTS } from "../../../utility";
import LoadingSpinner from "../../../reuseables/Loading";
import { usePermissions } from "../../../hooks/usePermissions";
import { useRoles } from "../../../hooks/useRoles";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";
import { toast } from "react-toastify";
import { useHtsEligibility } from "../NewToolForms/hooks/useHtsEligibility";
import IctForm from "../IctForm/IctForm";

const NewEncounterHtsIctOrchestrator = lazy(() =>
  import("../NewToolForms/NewEncounterHtsIctOrchestrator")
);
const ExistingPatientHtsForm = lazy(() =>
  import("../NewToolForms/ExistingPatientHtsForm")
);
const NewEncounterHtsForm = lazy(() =>
  import("../NewToolForms/NewEncounterHtsForm")
);
const HTSEncounterHistory = lazy(() => import("./HTSEncounterHistory"));
const ICTEncounterHistory = lazy(() => import("./ICTEncounterHistory"));
const PatientVisits = lazy(() => import("../Patient/PatientVisits"));
const ContineousRegistrationTesting = lazy(() =>
  import("./../Patient/ContineousRegistrationTesting")
);
const History = lazy(() => import("./History"));
const HIVSTPatientHistory = lazy(() =>
  import("../Patient/HIVST/HIVSTPatientHistory")
);
const ExistenceClientHIVSTRegistration = lazy(() =>
  import("../Patient/HIVST/ExistenceClientHIVSTRegistration")
);
const NewIctForExistingPatient = lazy(() =>
  import("../NewToolForms/NewIctForExistingPatient")
);

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = (props) => {
  const [patientList, setPatientList] = useState([]);
  const [patientEncounterList, setPatientEncounterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHTSType, setNewHTSType] = useState("NEW HTS");
  const [LMP, setLMP] = useState("");
  const { hasPermission, hasAnyPermission } = usePermissions();

  const patientId = props.patientObj?.personId ?? props.patientObj?.id ?? "";

  const [key, setKey] = useState(
    props.activePage === "NEW HTS" ? "new" : "home"
  );

  const [lastHts, setLastHTS] = useState({});
  const [patientInfo, setPatientInfo] = useState(null);
  const [lastVisitCount, setLastVisitCount] = useState(null);
  const [checkModality, setCheckModality] = useState("");
  const [lastVistAndModality, setLastVistAndModality] = useState(false);
  const [lastVisitModalityAndCheckedIn, setLastVisitModalityAndCheckedIn] =
    useState(false);

  const { hasRole } = useRoles();
  const isRDE = hasRole("RDE");

  const isEligibleForNewIct = useMemo(() => {
    return patientInfo?.confirmatoryHivTest?.toLowerCase() === "positive";
  }, [patientInfo]);

  const calculateLastVisitDate = (visitDate) => {
    if (!visitDate) return 0;
    const monthDifference = moment(
      new Date(moment(new Date()).format("YYYY-MM-DD"))
    ).diff(new Date(visitDate), "months", true);
    return monthDifference;
  };

  const determineRetestingStatus = async (lastRecord) => {
    let htsType = "NEW HTS";
    let hivResult = lastRecord?.hivTestResult || lastRecord?.hivTestResult2;

    if (lastRecord?.id && hivResult && hivResult.toLowerCase() === "negative") {
      try {
        const response = await axios.get(
          `${baseUrl}hts/get-anc-lmp?personUuid=${props.patientObj.personUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.result) {
          let lmpDate = moment(response.data.result);
          let retestingRangeDate = moment(lmpDate).add(40 + 52, "weeks");
          let today = moment();
          if (retestingRangeDate.diff(today, "days") > 0) {
            htsType = "RETESTING";
          }
        }
        setLMP(response.data);
      } catch (error) {
        // Silent catch
      }
    } else {
      setLastVisitModalityAndCheckedIn(true);
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
  }, []);

  async function patients() {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}hts/persons/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatientList(response.data.htsClientDtoList);
    } catch (error) {
      // Handle error silently
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

      setPatientInfo(response.data);
      const visitCount = Math.round(
        calculateLastVisitDate(response.data.dateVisit)
      );
      setLastVisitCount(visitCount);

      const modality = getCheckModalityForHTS(
        response.data.riskStratificationResponseDto?.testingSetting
      );
      setCheckModality(modality);

      const condition = visitCount >= 3 || modality === "show" ? true : false;
      setLastVistAndModality(condition);

      const finalCondition = condition || Boolean(props?.checkedInPatient);
      setLastVisitModalityAndCheckedIn(finalCondition);

      await determineRetestingStatus(response.data);
      setLastHTS(response.data);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  const permissions = useMemo(
    () => ({
      canSeePatientVisit:
        !isRDE && hasAnyPermission("view_patient", "all_permissions"),
    }),
    [hasAnyPermission, props?.patientObj]
  );

  return (
    <Fragment>
      <br />
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => {
                    setKey(k);
                  }}
                  className="mb-3"
                >
                  <Tab eventKey="home" title="HTS HISTORY">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "home" && (
                        <HTSEncounterHistory
                          patientObj={props.patientObj}
                          activePage={props.activePage}
                          setActivePage={props.setActivePage}
                          clientCode={props.clientCode}
                          patientAge={props.patientAge}
                        />
                      )}
                    </Suspense>
                  </Tab>

                  <Tab eventKey="ict-history" title="ICT HISTORY">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "ict-history" && (
                        <ICTEncounterHistory
                          patientObj={props.patientObj}
                          activePage={props.activePage}
                          setActivePage={props.setActivePage}
                        />
                      )}
                    </Suspense>
                  </Tab>

                  {props?.clientEligibility?.isPatientEligibleForHts && (
                    <Tab
                      eventKey="new-hts-encounter-existing-patient"
                      title="NEW HTS"
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        {key === "new-hts-encounter-existing-patient" && (

                          <NewEncounterHtsIctOrchestrator
                            person={props?.patientObj}   // full object: { personId, personResponseDto, ... }
                            onDone={() => setKey("home")}
                            isOnArt={false}
                          />
                        )}
                      </Suspense>
                    </Tab>
                  )}

                  <Tab eventKey="new-ict-encounter-existing-patient" title="NEW ICT">
                    <Suspense fallback={<LoadingSpinner />}>
                      {key === "new-ict-encounter-existing-patient" && (
                        <NewIctForExistingPatient
                          patientId={patientId}
                          onDone={() => {
                            setKey("ict-history");
                          }}
                          isOnArt={false}
                        />
                      )}
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