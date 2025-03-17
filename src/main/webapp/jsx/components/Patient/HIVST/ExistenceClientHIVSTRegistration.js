import React, { useCallback, useEffect, useState } from "react";
import { Button } from "semantic-ui-react";
import { Card, CardBody } from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
// import FamilyIndexTestingForm from "./NewRegistration/FamilyIndexTestingForm";
import "react-phone-input-2/lib/style.css";
import { Icon, Menu, Sticky } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import HIVSTPatientRegistration from "./HIVSTPatientRegistration";
// import RiskStratification from "../ContinuesHTSEnrollment/RiskStratification";
// import BasicInfo from "../ContinuesHTSEnrollment/BasicInfo";
// import PreTest from "../ContinuesHTSEnrollment/PreTest";
// import HivTestResult from "../ContinuesHTSEnrollment/HivTestResult";
// import PostTest from "../ContinuesHTSEnrollment/PostTest";
// import IndexingContactTracing from "../ContinuesHTSEnrollment/Elicitation";
// import RecencyTesting from "../ContinuesHTSEnrollment/RecencyTesting";
// import Others from "../ContinuesHTSEnrollment/Others";
// import PNSHistory from "../NewRegistration/PartnerNotificationServices/PNSHistory";
// import PnsForm from "../NewRegistration/PartnerNotificationServices/PnsForm";
// import ViewPNSForm from "../NewRegistration/PartnerNotificationServices/ViewPnsForm";
// import ReferralUnit from "../ContinuesHTSEnrollment/ClientReferral/ReferralUnit";

const ExistenceClientHIVSTRegistration = (props) => {
    const location = useLocation();
    const locationState = location.state;
    const [activeItem, setactiveItem] = useState("reg");
    const [completed, setCompleted] = useState([]);
    const [hideOtherMenu, setHideOtherMenu] = useState(true);
    // const [saving, setSaving] = useState(false);
    const [patientObj2, setPatientObj2] = useState({});

    const handleItemClick = (activeItem) => {
        setactiveItem(activeItem);
        //setCompleted({...completed, ...completedMenu})
    };

    return (<>
        <ToastContainer autoClose={3000} hideProgressBar />

        <Card>
            <CardBody>
                <form>
                    <div className="row">
                        <h3> HIV SELF TEST </h3>
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
                                    active={activeItem === "reg"}
                                    onClick={() => handleItemClick("reg")}
                                    style={{
                                        backgroundColor: activeItem === "reg" ? "#000" : "",
                                    }}
                                >
                                    <span style={{ color: "#fff" }}>
                                        {" "}
                                        Patient Registration
                                        {completed.includes("reg") && (<Icon name="check" color="green" />)}
                                    </span>
                                </Menu.Item>
                            </Menu>
                        </div>
                        <div
                            className="col-md-9 col-sm-9 col-lg-9 "
                            style={{
                                backgroundColor: "#fff", margingLeft: "-50px", paddingLeft: "-20px",
                            }}
                        >
                            {activeItem === "reg" && ( <HIVSTPatientRegistration
                                handleItemClick={handleItemClick}
                                setCompleted={setCompleted}
                                completed={completed}
                                setPatientObj={setPatientObj2}
                                patientObj={patientObj2}
                                setHideOtherMenu={setHideOtherMenu}
                                // patientAge={props.patientAge}
                                // setExtra={setExtra}
                                // extra={extra}
                                patientObject={locationState.patientObject}
                            // activePage={props.activePage}
                            // setActivePage={props.setActivePage}
                            />)}
                        </div>
                    </div>
                </form>
            </CardBody>
        </Card>
    </>);

};
export default ExistenceClientHIVSTRegistration;