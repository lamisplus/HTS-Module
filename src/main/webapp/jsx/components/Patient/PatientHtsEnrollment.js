import React, { useEffect, useState } from "react";
import { Button } from "semantic-ui-react";
import { Card, CardBody } from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { useHistory } from "react-router-dom";
import { getCheckModality, getPreviousForm, getCurentForm} from "../../../utility";
import "react-phone-input-2/lib/style.css";
import { Icon, Menu, Sticky } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import BasicInfo from "./NewRegistrationEnrollement/BasicInfo";
import PreTest from "./NewRegistrationEnrollement/PreTest";
import HivTestResult from "./NewRegistrationEnrollement/HivTestResult";
import IndexingContactTracing from "./NewRegistrationEnrollement/Elicitation/Index";
import Others from "./NewRegistrationEnrollement/Others";
import PostTest from "./NewRegistrationEnrollement/PostTest";
import RecencyTesting from "./NewRegistrationEnrollement/RecencyTesting";
import RiskStratification from "./NewRegistrationEnrollement/RiskStratification";
import PnsForm from "./NewRegistration/PartnerNotificationServices/PnsForm";
import PNSHistory from "./NewRegistration/PartnerNotificationServices/PNSHistory";
import ViewPNSForm from "./NewRegistration/PartnerNotificationServices/ViewPnsForm";
import ViewFamilyIndexTestingForm from "./NewRegistration/PartnerNotificationServices/ViewFamilyIndexForm";
import ViewClientReferral from "./NewRegistrationEnrollement/ClientReferral/Referrall_view_update";
import ClientReferralHistory from "./NewRegistrationEnrollement/ClientReferral/ClientReferralHistory";
import RefferralUnit from "./NewRegistration/RefferalUnit";
import FamilyIndexHistory from "./NewRegistration/PartnerNotificationServices/FamilyIndexhIstory";
import FamilyIndexTestingForm from "./NewRegistration/FamilyIndexTestingForm";
import { usePermissions } from "../../../hooks/usePermissions";
import { useMemo } from "react";
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
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const locationState = location.state;
  const [activeItem, setactiveItem] = useState("basic");
  const [completed, setCompleted] = useState([]);
  const [_, setHideOtherMenu] = useState(true);
  const [patientObj, setPatientObj] = useState(props.activePage.activeObject);
  const [extra, setExtra] = useState({
    risk: "",
    index: "",
    pre: "",
    post: "",
    recency: "",
    elicitation: "",
    familyIndexTesting: "",
    pns: "",
  });
  const [showBackButton, setShowBackButton] = useState(true);
  const [modalityCheck, setModalityCheck] = useState("");
  const [selectedRow, setSelectedRow] = useState({});
  const [basicInfo, setBasicInfo] = useState({});
  const [organizationInfo, setOrganizationInfo] = useState({});
  const [row, setRow] = useState({});
  const [action, setAction] = useState("");
  const handleItemClick = (activeItem) => {
    setactiveItem(activeItem);
  };

  useEffect(() => {
    setModalityCheck(
      getCheckModality(patientObj?.riskStratificationResponseDto?.testingSetting)
    );
  }, [patientObj]);

  const { hasPermission } = usePermissions();

  const permissions = useMemo(
    () => ({
      pnsForm: hasPermission("nigeria_pns_form"),
      requestAndResultForm: hasPermission("request_and_result_form"),
      refferalForm: hasPermission("referral_form")
    }),
    [hasPermission]
  );
  // 

 

  const fetchPrevForm=(e)=>{

    console.log("activeItem", activeItem)
    if( activeItem === "risk"){
      history.push("/");

    }else{
      e.preventDefault()

      console.log("entered", activeItem)

    let currentForm =   getCurentForm(activeItem)

      let age = calculate_age(
        basicInfo?.personResponseDto?.dateOfBirth
          ? basicInfo?.personResponseDto?.dateOfBirth
          : patientObj?.personResponseDto?.dateOfBirth
      );
      let checkModality = patientObj?.riskStratificationResponseDto?.testingSetting? patientObj.riskStratificationResponseDto.testingSetting: "";
      let isPMTCTModality =getCheckModality(checkModality)
   



      let hivStatus = patientObj?.hivTestResult;
    let answer =  getPreviousForm(currentForm, age, isPMTCTModality, hivStatus);
    if (answer[0]  && answer[1]) {
      if(answer[0] === "fit"){
        handleItemClick("fit-history");

      }else if(answer[0] === "pns"){

        handleItemClick("pns-history");

      }else{
        handleItemClick(answer[0]);

      }
    }else{
    history.push("/");

    }
}
}

  // 
  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar />
      <Card>
        <CardBody>
          <form>
            <div className="row">
              <h3>
                HIV COUNSELLING AND TESTING -{" "}
                {patientObj && patientObj.dateVisit ? patientObj.dateVisit : ""}
                {showBackButton && <div>
                  {/* <Link to={"/"}> */}
                  <Button
                    variant="contained"
                    color="primary"
                    className=" float-end"
                    //startIcon={<FaUserPlus size="10"/>}
                    onClick={fetchPrevForm}
                    style={{ backgroundColor: "#014d88" }}
                  >
                    <span style={{ textTransform: "capitalize" }}>Back</span>
                  </Button>
                  {/* </Link> */}
                </div>}

              </h3>
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
                      {completed?.includes("risk") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>
                  <Menu.Item
                    name="inbox"
                    active={activeItem === "basic"}
                    onClick={() => handleItemClick("basic")}
                    style={{
                      backgroundColor: activeItem === "basic" ? "#000" : "",
                    }}
                  >
                    <span style={{ color: "#fff" }}>
                      {" "}
                      Basic Information
                      {completed?.includes("basic") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>

                  {props.patientAge >= 15 && modalityCheck == "fill" && (
                    <Menu.Item
                      name="spam"
                      active={activeItem === "pre-test-counsel"}
                      onClick={() => handleItemClick("pre-test-counsel")}
                      style={{
                        backgroundColor:
                          activeItem === "pre-test-counsel" ? "#000" : "",
                      }}
                    //disabled={activeItem !== 'pre-test-counsel' ? true : false}
                    >
                      {/* <Label>2</Label> */}
                      <span style={{ color: "#fff" }}>
                        Pre Test Counseling
                        {completed?.includes("pre-test-counsel") ? (
                          <Icon name="check" color="green" />
                        ) : null}
                      </span>
                    </Menu.Item>
                  )}
                  {permissions?.requestAndResultForm && (
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
                        {completed?.includes("hiv-test") && (
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
                      backgroundColor: activeItem === "post-test" ? "#000" : "",
                    }}
                  //disabled={activeItem !== 'post-test' ? true : false}
                  >
                    {/* <Label>4</Label> */}
                    <span style={{ color: "#fff" }}>
                      Post Test Counseling
                      {completed?.includes("post-test") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>

                  {patientObj.hivTestResult &&
                    patientObj.hivTestResult.toLowerCase() === "positive" &&
                    patientObj.riskStratificationResponseDto?.age >= 15 && (
                      <Menu.Item
                        name="spam"
                        active={activeItem === "recency-testing"}
                        onClick={() => handleItemClick("recency-testing")}
                        style={{
                          backgroundColor:
                            activeItem === "recency-testing" ? "#000" : "",
                        }}
                      //disabled={activeItem !== 'recency-testing' ? true : false}
                      >
                        {/* <Label>4</Label> */}
                        <span style={{ color: "#fff" }}>
                          HIV Recency Testing
                          {completed?.includes("recency-testing") && (
                            <Icon name="check" color="green" />
                          )}
                        </span>
                      </Menu.Item>
                    )}


                  {permissions.pnsForm &&
                    patientObj.hivTestResult &&
                    patientObj.hivTestResult.toLowerCase() === "positive" && (
                      <Menu.Item
                        name="inbox"
                        active={activeItem === "fit-history"}
                        onClick={() => handleItemClick("fit-history")}
                        style={{
                          backgroundColor:
                            activeItem === "fit-history" ? "#000" : "",
                        }}
                      >
                        <span style={{ color: "#fff" }}>
                          {" "}
                          Family Index Testing form
                          {completed?.includes("fit") && (
                            <Icon name="check" color="green" />
                          )}
                        </span>
                      </Menu.Item>
                    )}

                  {patientObj.hivTestResult &&
                    patientObj.hivTestResult.toLowerCase() === "positive" && (
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
                      </Menu.Item>
                    )}
                  {permissions?.refferalForm && (
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
                        {completed?.includes("refferal") && (
                          <Icon name="check" color="green" />
                        )}
                      </span>
                    </Menu.Item>
                  )}
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
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setHideOtherMenu={setHideOtherMenu}
                    setExtra={setExtra}
                    extra={extra}
                    activePage={props.activePage}
                    patientObject={locationState.patientObject}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                    setOrganizationInfo={setOrganizationInfo}
                  />
                )}
                
                {activeItem === "basic" && (
                  <BasicInfo
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                    setBasicInfo={setBasicInfo}
                  />
                )}
                {activeItem === "pre-test-counsel" && (
                  <PreTest
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "hiv-test" && (
                  <HivTestResult
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "post-test" && (
                  <PostTest
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "indexing" && (
                  <IndexingContactTracing
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "recency-testing" && (
                  <RecencyTesting
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
                  />
                )}
                {activeItem === "others" && (
                  <Others
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    activePage={props.activePage}
                    setActivePage={props.setActivePage}
                  />
                )}
                {activeItem === "pns-history" && (
                  <PNSHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
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
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    history={true}
                  />
                )}
                {activeItem === "view-pns" && (
                  <ViewPNSForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    row={row}
                  />
                )}
                {activeItem === "view-fit" && (
                  <ViewFamilyIndexTestingForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    action={action}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    row={row}
                    setRow={setRow}
                    selectedRow={selectedRow}
                  />
                )}
                {activeItem === "fit-history" && (
                  <FamilyIndexHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    selectedRow={selectedRow}
                    setSelectedRow={setSelectedRow}
                    // row={row}
                    setAction={setAction}
                  />
                )}
                {activeItem === "fit" && (
                  <FamilyIndexTestingForm
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    history={true}
                  />
                )}
                {activeItem === "view-referral" && (
                  <ViewClientReferral
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                    row={row}
                  />
                )}
                {activeItem === "refferal-history" && (
                  <ClientReferralHistory
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
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
                {activeItem === "client-referral" && (
                  <RefferralUnit
                    handleItemClick={handleItemClick}
                    setCompleted={setCompleted}
                    completed={completed}
                    setPatientObj={setPatientObj}
                    patientObj={patientObj}
                    setExtra={setExtra}
                    extra={extra}
                    basicInfo={basicInfo}
                    organizationInfo={organizationInfo}
                    addNewForm={false}
                  />
                )}
              </div>
            </div>{" "}
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UserRegistration;
