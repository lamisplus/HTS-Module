import React, {useState, Fragment } from "react";

import { Row, Col, Card, } from "react-bootstrap";
import AddIndexContact from './AddIndexContact';
import IndexContactList from './IndexContactList'
import { useHistory, } from "react-router-dom";
//import Button from '@material-ui/core/Button';
import {Label as LabelRibbon, Button} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';


const PartnerNotificationServices = (props) => {
    const history = useHistory();
    const [activePage, setActivePage]= useState('list')
    const handleIClickPage =(activeItem)=>{
        setActivePage(activeItem)
    }
    const handleDone =()=>{
        history.push('/');
    }
    const handleItemClick =(page, completedMenu)=>{
        if(props.completed.includes(completedMenu)) {
        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
        props.handleItemClick(page)
    }

    return (
        <Fragment>

            <Row>
                <Col md={12}>
                    {activePage==='list' &&
                        (
                            <IndexContactList activePage={activePage} setActivePage={setActivePage} handleIClickPage={handleIClickPage} patientObj={props.patientObj}/>
                        )
                    }
                    {activePage==='add' && (
                        <AddIndexContact activePage={activePage} setActivePage={setActivePage} handleIClickPage={handleIClickPage} patientObj={props.patientObj}/>
                    )}
                    <br />
                    <div className="row">
                        <div className="form-group mb-3 col-md-12">
                            <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('recency-testing','recency-testing')}/>
                            <Button content='Done' icon='list' labelPosition='left' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={()=>handleDone()}/>

                        </div>
                    </div>
                </Col>

            </Row>
        </Fragment>
    );
};

export default PartnerNotificationServices;
