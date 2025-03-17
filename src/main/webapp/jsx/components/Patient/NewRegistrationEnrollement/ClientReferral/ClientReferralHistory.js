import React, {Fragment, useState} from "react";
import {Col, Row} from "react-bootstrap";
import PNSList from "../../NewRegistration/PartnerNotificationServices/PNSlist";
import AddIndexContact from "../../ContinuesHTSEnrollment/Elicitation/AddIndexContact";
import {Button} from "semantic-ui-react";
import { useHistory } from "react-router-dom";

import ClientRerralList from "./ClientRerralList";

const ClientReferralHistory = (props) => {
    let history = useHistory();

    const [activePage, setActivePage] = useState("list");
    const handleIClickPage = (activeItem) => {
        setActivePage(activeItem);
    };
    const handleItemClick = (page, completedMenu) => {
        props.handleItemClick(page);
        if (props.completed.includes(completedMenu)) {
        } else {
            props.setCompleted([...props.completed, completedMenu]);
        }
    };
    const handleDone = (row, actionType) => {
        if(props === "existing"){
         props.setActivePage({
            ...props.activePage,
            activePage: "home",
            activeObject: row,
            actionType: actionType,
        });
        }else{
            
        history.push("/");
        }
   
    };

    return (
        <Fragment>
            <Row>
                <Col md={12}>
                    {activePage === "list" && (
                        <ClientRerralList
                            activePage={activePage}
                            setActivePage={setActivePage}
                            handleIClickPage={handleIClickPage}
                            patientObj={props.patientObj}
                            handleItemClick={handleItemClick}
                            setRow={props.setRow}
                        />
                    )}
                    {activePage === "add" && (
                        <AddIndexContact
                            activePage={activePage}
                            setActivePage={setActivePage}
                            handleIClickPage={handleIClickPage}
                            patientObj={props.patientObj}
                        />
                    )}
                    <br />
                    <div className="row">
                        <div className="form-group mb-3 col-md-12">
                            <Button
                                content="Back"
                                icon="left arrow"
                                labelPosition="left"
                                style={{ backgroundColor: "#992E62", color: "#fff" }}
                                onClick={() =>
                                    handleItemClick("recency-testing", "recency-testing")
                                }
                            />
                            <Button
                                content="Done"
                                icon="list"
                                labelPosition="left"
                                style={{ backgroundColor: "#014d88", color: "#fff" }}
                                onClick={() => handleDone()}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </Fragment>
    );
};

export default ClientReferralHistory;
