import React, { useCallback, useEffect, useState } from "react";
import { Button } from "semantic-ui-react";
import { Card, CardBody } from "reactstrap";
import FamilyIndexHistory from "./NewRegistration/PartnerNotificationServices/FamilyIndexhIstory";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import FamilyIndexTestingForm from "./NewRegistration/FamilyIndexTestingForm";
import "react-phone-input-2/lib/style.css";
import { Icon, Menu, Sticky } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import BasicInfo from "./ContinuesHTSEnrollment/BasicInfo";
import PreTest from "./ContinuesHTSEnrollment/PreTest";
import HivTestResult from "./ContinuesHTSEnrollment/HivTestResult";
import IndexingContactTracing from "./ContinuesHTSEnrollment/Elicitation/Index";
import Others from "./ContinuesHTSEnrollment/Others";
import PostTest from "./ContinuesHTSEnrollment/PostTest";
import RecencyTesting from "./ContinuesHTSEnrollment/RecencyTesting";
import RiskStratification from "./ContinuesHTSEnrollment/RiskStratification";
import PNSHistory from "./NewRegistration/PartnerNotificationServices/PNSHistory";
import PnsForm from "./NewRegistration/PartnerNotificationServices/PnsForm";
import ViewPNSForm from "./NewRegistration/PartnerNotificationServices/ViewPnsForm";
import ReferralUnit from "./ContinuesHTSEnrollment/ClientReferral/ReferralUnit";
import RefferralUnit from "./NewRegistration/RefferalUnit";
import ClientReferralHistory from "./NewRegistrationEnrollement/ClientReferral/ClientReferralHistory";
import ViewClientReferral from "./NewRegistrationEnrollement/ClientReferral/Referrall_view_update";
import { set } from "js-cookie";
import { getCheckModality, getCurentForm } from "../../../utility";
import { getPreviousForm } from "../../../utility";
import { calculate_age } from "../utils";

const useStyles = makeStyles((theme) => ({
  error: {
    color: "#f85032",
    fontSize: "12.8px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const UserRegistration = (props) => {

  const history = useHistory();

  const location = useLocation();
  const locationState = location.state;
  // const [saving, setSaving] = useState(false);
  const [activeItem, setactiveItem] = useState("risk");
  const [completed, setCompleted] = useState([]);
  const [showBackButton, setShowBackButton] = useState(true);
  const [basicInfo, setBasicInfo] = useState({});
  const [hideOtherMenu, setHideOtherMenu] = useState(true);
  const [organizationInfo, setOrganizationInfo] = useState({});
  const [row, setRow] = useState({});
  const [modalityCheck, setModalityCheck] = useState("");
  const [selectedRow, setSelectedRow] = useState({});

  const [permissions, setPermission] = useState(
    JSON.parse(localStorage.getItem("stringifiedPermmision"))
  );
  const [action, setAction] = useState("");

  const [patientObj2, setPatientObj2] = useState(
    {
      breastFeeding: "",
      capturedBy: "",
      cd4: {},
      clientCode: "",
      riskStratificationCode: "",
      confirmatoryTest: {},
      dateVisit: "",
      extra: {},
      firstTimeVisit: "",
      hepatitisTesting: {},
      hivTestResult: "",
      id: "",
      indexClient: "",
      indexClientCode: "",
      indexElicitation: [
        {
          address: "",
          altPhoneNumber: "",
          archived: 0,
          currentlyLiveWithPartner: true,
          datePartnerCameForTesting: "",
          dob: "",
          extra: {},
          facilityId: 0,
          firstName: "",
          hangOutSpots: "",
          htsClient: {
            archived: 0,
            breastFeeding: 0,
            capturedBy: "",
            cd4: {},
            clientCode: "",
            confirmatoryTest: {},
            dateVisit: "",
            extra: {},
            facilityId: 0,
            firstTimeVisit: true,
            hepatitisTesting: {},
            hivTestResult: "",
            id: 0,
            indexClient: true,
            indexClientCode: "",
            indexNotificationServicesElicitation: {},
            knowledgeAssessment: {},
            numChildren: 0,
            numWives: 0,
            others: {},
            person: {
              active: "",
              address: {},
              archived: 0,
              contact: {},
              contactPoint: {},
              createdDate: "",
              dateOfBirth: "",
              dateOfRegistration: "",
              deceased: true,
              deceasedDateTime: "",
              education: {},
              employmentStatus: {},
              emrId: "",
              facilityId: 0,
              firstName: "string",
              gender: {},
              hospitalNumber: "",
              id: "",
              identifier: {},
              isDateOfBirthEstimated: true,
              lastModifiedDate: "",
              maritalStatus: {},
              new: true,
              ninNumber: "",
              organization: {},
              otherName: "",
              sex: "",
              surname: "",
              uuid: "",
            },
            personUuid: "",
            postTestCounselingKnowledgeAssessment: {},
            pregnant: "",
            previouslyTested: true,
            recency: {},
            referredFrom: "",
            relationWithIndexClient: "",
            riskAssessment: {},
            sexPartnerRiskAssessment: {},
            stiScreening: {},
            syphilisTesting: {},
            targetGroup: 0,
            tbScreening: {},
            test1: {},
            testingSetting: "",
            tieBreakerTest: {},
            typeCounseling: "",
            uuid: "",
          },
          htsClientUuid: "",
          id: "",
          isDateOfBirthEstimated: true,
          lastName: "",
          middleName: "",
          notificationMethod: "",
          partnerTestedPositive: "",
          phoneNumber: "",
          physicalHurt: "",
          relationshipToIndexClient: "",
          sex: "",
          sexuallyUncomfortable: "",
          threatenToHurt: "",
          uuid: "",
        },
      ],
      indexNotificationServicesElicitation: {},
      knowledgeAssessment: {},
      numChildren: "",
      numWives: "",
      others: {},
      personId: "",
      personResponseDto: {
        active: true,

        address: {
          address: [
            {
              city: "",
              line: [""],
              stateId: "",
              district: "",
              countryId: 1,
              postalCode: "",
              organisationUnitId: 0,
            },
          ],
        },
        biometricStatus: true,
        checkInDate: "",
        contact: {},
        contactPoint: {
          contactPoint: [
            {
              type: "phone",
              value: "",
            },
          ],
        },
        dateOfBirth: "",
        dateOfRegistration: "",
        deceased: true,
        deceasedDateTime: "",
        education: {},
        employmentStatus: {},
        emrId: "",
        encounterDate: "",
        facilityId: "",
        firstName: "",
        gender: {},
        id: "",
        identifier: {},
        isDateOfBirthEstimated: true,
        maritalStatus: {},
        ninNumber: "",
        organization: {},
        otherName: "",
        sex: "",
        surname: "",
        visitId: "",
      },
      postTestCounselingKnowledgeAssessment: {},
      pregnant: "",
      previouslyTested: "",
      recency: {},
      referredFrom: "",
      relationWithIndexClient: "",
      riskAssessment: {},
      sexPartnerRiskAssessment: {},
      stiScreening: {},
      syphilisTesting: {},
      targetGroup: "",
      tbScreening: {},
      test1: {},
      testingSetting: "",
      tieBreakerTest: {},
      typeCounseling: "",
      riskStratificationResponseDto: null,
    });

  const [extra, setExtra] = useState({
    risk: "",
    index: "",
    pre: "",
    post: "",
    recency: "",
    elicitation: "",
  });
  const handleItemClick = (activeItem) => {
    setactiveItem(activeItem);

  };


  const clearInfo = () => {
    setCompleted([])
    setPatientObj2(
      {
        breastFeeding: "",
        capturedBy: "",
        cd4: {},
        clientCode: "",
        riskStratificationCode: "",
        confirmatoryTest: {},
        dateVisit: "",
        extra: {},
        firstTimeVisit: "",
        hepatitisTesting: {},
        hivTestResult: "",
        id: "",
        indexClient: "",
        indexClientCode: "",
        indexElicitation: [
          {
            address: "",
            altPhoneNumber: "",
            archived: 0,
            currentlyLiveWithPartner: true,
            datePartnerCameForTesting: "",
            dob: "",
            extra: {},
            facilityId: 0,
            firstName: "",
            hangOutSpots: "",
            htsClient: {
              archived: 0,
              breastFeeding: 0,
              capturedBy: "",
              cd4: {},
              clientCode: "",
              confirmatoryTest: {},
              dateVisit: "",
              extra: {},
              facilityId: 0,
              firstTimeVisit: true,
              hepatitisTesting: {},
              hivTestResult: "",
              id: 0,
              indexClient: true,
              indexClientCode: "",
              indexNotificationServicesElicitation: {},
              knowledgeAssessment: {},
              numChildren: 0,
              numWives: 0,
              others: {},
              person: {
                active: "",
                address: {},
                archived: 0,
                contact: {},
                contactPoint: {},
                createdDate: "",
                dateOfBirth: "",
                dateOfRegistration: "",
                deceased: true,
                deceasedDateTime: "",
                education: {},
                employmentStatus: {},
                emrId: "",
                facilityId: 0,
                firstName: "string",
                gender: {},
                hospitalNumber: "",
                id: "",
                identifier: {},
                isDateOfBirthEstimated: true,
                lastModifiedDate: "",
                maritalStatus: {},
                new: true,
                ninNumber: "",
                organization: {},
                otherName: "",
                sex: "",
                surname: "",
                uuid: "",
              },
              personUuid: "",
              postTestCounselingKnowledgeAssessment: {},
              pregnant: "",
              previouslyTested: true,
              recency: {},
              referredFrom: "",
              relationWithIndexClient: "",
              riskAssessment: {},
              sexPartnerRiskAssessment: {},
              stiScreening: {},
              syphilisTesting: {},
              targetGroup: 0,
              tbScreening: {},
              test1: {},
              testingSetting: "",
              tieBreakerTest: {},
              typeCounseling: "",
              uuid: "",
            },
            htsClientUuid: "",
            id: "",
            isDateOfBirthEstimated: true,
            lastName: "",
            middleName: "",
            notificationMethod: "",
            partnerTestedPositive: "",
            phoneNumber: "",
            physicalHurt: "",
            relationshipToIndexClient: "",
            sex: "",
            sexuallyUncomfortable: "",
            threatenToHurt: "",
            uuid: "",
          },
        ],
        indexNotificationServicesElicitation: {},
        knowledgeAssessment: {},
        numChildren: "",
        numWives: "",
        others: {},
        personId: "",
        personResponseDto: {
          active: true,

          address: {
            address: [
              {
                city: "",
                line: [""],
                stateId: "",
                district: "",
                countryId: 1,
                postalCode: "",
                organisationUnitId: 0,
              },
            ],
          },
          biometricStatus: true,
          checkInDate: "",
          contact: {},
          contactPoint: {
            contactPoint: [
              {
                type: "phone",
                value: "",
              },
            ],
          },
          dateOfBirth: "",
          dateOfRegistration: "",
          deceased: true,
          deceasedDateTime: "",
          education: {},
          employmentStatus: {},
          emrId: "",
          encounterDate: "",
          facilityId: "",
          firstName: "",
          gender: {},
          id: "",
          identifier: {},
          isDateOfBirthEstimated: true,
          maritalStatus: {},
          ninNumber: "",
          organization: {},
          otherName: "",
          sex: "",
          surname: "",
          visitId: "",
        },
        postTestCounselingKnowledgeAssessment: {},
        pregnant: "",
        previouslyTested: "",
        recency: {},
        referredFrom: "",
        relationWithIndexClient: "",
        riskAssessment: {},
        sexPartnerRiskAssessment: {},
        stiScreening: {},
        syphilisTesting: {},
        targetGroup: "",
        tbScreening: {},
        test1: {},
        testingSetting: "",
        tieBreakerTest: {},
        typeCounseling: "",
        riskStratificationResponseDto: null,
      }
    )
    // setPatientObj2(0)
    setHideOtherMenu(true)
    setExtra({
      risk: "",
      index: "",
      pre: "",
      post: "",
      recency: "",
      elicitation: "",
    })
    setOrganizationInfo({})
  }




  const getPrevForm = (e) => {
    if (activeItem === "risk") {
      history.push("/");

    } else {
      e.preventDefault()
      let currentForm = getCurentForm(activeItem)

      let age = calculate_age(
        basicInfo?.personResponseDto?.dateOfBirth
          ? basicInfo?.personResponseDto?.dateOfBirth
          : patientObj2?.personResponseDto?.dateOfBirth
      );

      let hivStatus = patientObj2?.hivTestResult;

      let checkModality = patientObj2?.riskStratificationResponseDto?.testingSetting ? patientObj2.riskStratificationResponseDto.testingSetting : "";
      let isPMTCTModality = getCheckModality(checkModality)

      let answer = getPreviousForm(currentForm, age, isPMTCTModality, hivStatus);
      if (answer[0] && answer[1]) {
        if (answer[0] === "fit") {
          handleItemClick("fit-history");

        } else if (answer[0] === "pns") {

          handleItemClick("pns-history");

        } else {
          handleItemClick(answer[0]);

        }
      } else {
        history.push("/");

      }
    }
  }




  useEffect(() => {
    setModalityCheck(
      getCheckModality(patientObj2?.riskStratificationResponseDto?.testingSetting)
    );
  }, [patientObj2]);





  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar />

      <Card>
        <CardBody>
          <form>
            <div className="row">
              <h3>
                HIV COUNSELLING AND TESTING
                {showBackButton && <div>
                  {/* <Link to={"/"}> */}
                  <Button
                    variant="contained"
                    color="blue"
                    className=" float-end"
                    //startIcon={<FaUserPlus size="10"/>}
                    onClick={getPrevForm}
                    style={{ backgroundColor: "#014d88" }}
                  >
                    <span style={{ textTransform: "capitalize" }}>Back</span>
                  </Button>
                  {/* </Link> */}
                </div>}



              </h3>{" "}
              <br />
              <br />
              <div className="col-md-3 col-sm-3 col-lg-3">
                <Menu
                  size="large"
                  vertical
                  style={{ backgroundColor: "#014D88" }}
                >
                  <Menu.Item
                    name="inbox"
                    active={activeItem === "risk"}
                    onClick={() => handleItemClick("risk")}
                    style={{
                      backgroundColor: activeItem === "risk" ? "#000" : "",
                    }}
                  >
                    <span style={{ color: "#fff" }}>
                      {" "}
                      Risk Stratification
                      {completed.includes("risk") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>
                  {hideOtherMenu === false && (
                    <>
                      <Menu.Item
                        name="inbox"
                        active={activeItem === "basic"}
                        onClick={() => handleItemClick("basic")}
                        style={{
                          backgroundColor: activeItem === "basic" ? "#000" : "",
                        }}
                        disabled={activeItem !== "basic" ? true : false}
                      >
                        <span style={{ color: "#fff" }}>
                          {" "}
                          Basic Information
                          {completed.includes("basic") && (
                            <Icon name="check" color="green" />
                          )}
                        </span>
                      </Menu.Item>
                      {patientObj2.riskStratificationResponseDto?.age >= 15 &&
                        modalityCheck == "fill" && (
                          <Menu.Item
                            name="spam"
                            active={activeItem === "pre-test-counsel"}
                            onClick={() => handleItemClick("pre-test-counsel")}
                            style={{
                              backgroundColor:
                                activeItem === "pre-test-counsel" ? "#000" : "",
                            }}
                            disabled={
                              activeItem !== "pre-test-counsel" ? true : false
                            }

                          >
                            {/* <Label>2</Label> */}
                           
                            <span style={{ color: "#fff" }}>
                              Pre Test Counseling
                              {/* {completed?.includes("pre-test-counsel") && (
                                <Icon name="check" color="green" />
                              )} */}
                              <Icon name="check" color="green" />
                            </span>
                          </Menu.Item>
                        )}



                      {permissions.includes("Request_and_Result_Form") && (
                        <Menu.Item
                          name="inbox"
                          active={activeItem === "hiv-test"}
                          onClick={() => handleItemClick("hiv-test")}
                          style={{
                            backgroundColor:
                              activeItem === "hiv-test" ? "#000" : "",
                          }}
                        //disabled={activeItem !== 'hiv-test' ? true : false}
                        >
                          <span style={{ color: "#fff" }}>
                            Request {"&"} Result Form
                            {completed.includes("hiv-test") && (
                              <Icon name="check" color="green" />
                            )}
                          </span>

                          {/* <Label color='teal'>3</Label> */}
                        </Menu.Item>
                      )}
                      <Menu.Item
                        name="spam"
                        active={activeItem === "post-test"}
                        onClick={() => handleItemClick("post-test")}
                        style={{
                          backgroundColor:
                            activeItem === "post-test" ? "#000" : "",
                        }}
                        disabled={activeItem !== "post-test" ? true : false}
                      >
                        {/* <Label>4</Label> */}
                        <span style={{ color: "#fff" }}>
                          Post Test Counseling
                          {completed.includes("post-test") && (
                            <Icon name="check" color="green" />
                          )}
                        </span>
                      </Menu.Item>

                      {patientObj2?.hivTestResult &&
                        patientObj2?.hivTestResult === "Positive" &&
                        patientObj2.riskStratificationResponseDto?.age >= 15 &&
                        permissions.includes("Request_and_Result_Form") && (
                          <Menu.Item
                            name="spam"
                            active={activeItem === "recency-testing"}
                            onClick={() => {
                              handleItemClick("recency-testing");
                            }}
                            style={{
                              backgroundColor:
                                activeItem === "recency-testing" ? "#000" : "",
                            }}
                            disabled={
                              activeItem !== "recency-testing" ? true : false
                            }
                          >
                            {/* <Label>4</Label> */}
                            <span style={{ color: "#fff" }}>
                              HIV Recency Testing
                              {completed.includes("recency-testing") && (
                                <Icon name="check" color="green" />
                              )}
                            </span>
                          </Menu.Item>
                        )}

                      {patientObj2?.hivTestResult &&
                        patientObj2?.hivTestResult === "Positive" && (
                          <Menu.Item
                            name="spam"
                            active={activeItem === "fit"}
                            onClick={() => handleItemClick("fit")}
                            style={{
                              backgroundColor:
                                activeItem === "fit" ? "#000" : "",
                            }}

                          >
                            <span style={{ color: "#fff" }}>
                              Family Index Testing form
                              {completed.includes("fit") && (
                                <Icon name="check" color="green" />
                              )}
                            </span>
                          </Menu.Item>
                        )}
                      {permissions.includes("Nigeria_PNS_Form") &&
                        patientObj2?.hivTestResult &&
                        patientObj2?.hivTestResult === "Positive" && (
                          <Menu.Item
                            name="inbox"
                            active={activeItem === "pns-history"}
                            onClick={() => handleItemClick("pns-history")}
                            style={{
                              backgroundColor:
                                activeItem === "pns-history" ? "#000" : "",
                            }}
                          >
                            <span style={{ color: "#fff" }}>
                              {" "}
                              Partner Notification Services
                              {completed.includes("pns") && (
                                <Icon name="check" color="green" />
                              )}
                            </span>
                          </Menu.Item>)}


                      {permissions.includes("Referral_Form") && (
                        <Menu.Item
                          name="inbox"
                          active={activeItem === "refferal-history"}
                          onClick={() => handleItemClick("refferal-history")}
                          style={{
                            backgroundColor:
                              activeItem === "refferal-history" ? "#000" : "",
                          }}
                        >
                          <span style={{ color: "#fff" }}>
                            {" "}
                            Client Referral Service
                            {completed.includes("refferal") && (
                              <Icon name="check" color="green" />
                            )}
                          </span>
                        </Menu.Item>
                      )}
                    </>)}
                </Menu>
              </div>
              <div
                className="col-md-9 col-sm-9 col-lg-9 "
                style={{
                  backgroundColor: "#fff",
                  margingLeft: "-50px",
                  paddingLeft: "-20px",
                }}
              >
                {activeItem === "risk" && (
                  <RiskStratification
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setHideOtherMenu={setHideOtherMenu}
                    patientAge={props.patientAge}
                    setExtra={setExtra}
                    extra={extra}
                    patientObject={locationState.patientObject}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    setOrganizationInfo={setOrganizationInfo}
                    personInfo={props.personInfo}
                    newHTSType={props.newHTSType}
                  />
                )}

                {activeItem === "basic" && (
                  <BasicInfo
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                    sex={locationState.patientObject.gender}
                    setExtra={setExtra}
                    extra={extra}
                    patientList={props.patientList}
                    patientObject={locationState.patientObject}
                    setBasicInfo={setBasicInfo}
                    checkedInPatient={props.checkedInPatient}
                  />
                )}



                {activeItem === "pre-test-counsel" && (
                  <PreTest
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "hiv-test" && (
                  <HivTestResult
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "post-test" && (
                  <PostTest
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                    patientsHistory={props.patients}
                  />
                )}
                {activeItem === "indexing" && (
                  <IndexingContactTracing
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "recency-testing" && (
                  <RecencyTesting
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "others" && (
                  <Others
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    clientCode={props.clientCode}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "pns-history" && (
                  <PNSHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    setRow={setRow}
                  />
                )}

                {activeItem === "pns" && (
                  <PnsForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                  // addNewForm={false}
                  />
                )}

                {activeItem === "view-pns" && (
                  <ViewPNSForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    row={row}
                  />
                )}
                {activeItem === "fit" && (
                  <FamilyIndexTestingForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    history={true}
                  />
                )}



                {activeItem === "fit-history" && (
                  <FamilyIndexHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={true}
                    nextButton={true}
                    selectedRow={selectedRow}
                    setSelectedRow={setSelectedRow}
                    clearInfo={clearInfo}
                    // row={row}
                    setAction={setAction}
                  />
                )}

                {activeItem === "client-referral" && (
                  <RefferralUnit
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                  />
                )}
                {activeItem === "refferal-history" && (
                  <ClientReferralHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    setRow={setRow}
                    status={"existing"}

                  />
                )}
                {activeItem === "view-referral" && (
                  <ViewClientReferral
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj2}
                    patientObj={patientObj2}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    row={row}
                  />
                )}
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UserRegistration;
