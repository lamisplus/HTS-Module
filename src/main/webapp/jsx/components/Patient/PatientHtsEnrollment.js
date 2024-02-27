import React, { useCallback, useEffect, useState } from "react";
import { Button } from "semantic-ui-react";
import { Card, CardBody } from "reactstrap";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link } from "react-router-dom";
//import {TiArrowBack} from 'react-icons/ti'
//import {token, url as baseUrl } from "../../../api";
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
  console.log("con out",props)
  const classes = useStyles();
  const [activeItem, setactiveItem] = useState("basic");
  const [completed, setCompleted] = useState([]);
  const [hideOtherMenu, setHideOtherMenu] = useState(true);
  const [patientObj, setPatientObj] = useState(props.activePage.activeObject);
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
    //setCompleted({...completed, ...completedMenu})
  };

  const LoadViewPage = (row, actionType) => {
    props.setActivePage({
      ...props.activePage,
      activePage: "home",
      activeObject: row,
      actionType: actionType,
    });
  };

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
                <Button
                  variant="contained"
                  color="primary"
                  className=" float-end"
                  //startIcon={<FaUserPlus size="10"/>}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={LoadViewPage}
                >
                  <span style={{ textTransform: "capitalize" }}>Back</span>
                </Button>
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
                      {completed.includes("risk") && (
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
                      {completed.includes("basic") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>
                  {props.patientAge >= 15 && (
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
                        {completed.includes("pre-test-counsel") && (
                          <Icon name="check" color="green" />
                        )}
                      </span>
                    </Menu.Item>
                  )}
                  <Menu.Item
                    name="inbox"
                    active={activeItem === "hiv-test"}
                    onClick={() => handleItemClick("hiv-test")}
                    style={{
                      backgroundColor: activeItem === "hiv-test" ? "#000" : "",
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
                      {completed.includes("post-test") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>

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
                      {completed.includes("recency-testing") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>

                  <Menu.Item
                    name="spam"
                    active={activeItem === "indexing"}
                    onClick={() => handleItemClick("indexing")}
                    style={{
                      backgroundColor: activeItem === "indexing" ? "#000" : "",
                    }}
                    //disabled={activeItem !== 'indexing' ? true : false}
                  >
                    {/* <Label>4</Label> */}
                    <span style={{ color: "#fff" }}>
                      Index Notification Services - Elicitation
                      {completed.includes("indexing") && (
                        <Icon name="check" color="green" />
                      )}
                    </span>
                  </Menu.Item>
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
                    setActivePage={props.setActivePage}
                    patientAge={props.patientAge}
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
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UserRegistration;
