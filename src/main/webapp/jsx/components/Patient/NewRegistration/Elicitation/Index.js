import React, {useState, Fragment } from "react";

import { Row, Col, Card, } from "react-bootstrap";
import AddIndexContact from './AddIndexContact';
import IndexContactList from './IndexContactList'
import { FaUserPlus } from "react-icons/fa";
import { Link } from 'react-router-dom';
//import Button from '@material-ui/core/Button';
import {Label as LabelRibbon, Button} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';


const Elicitation = (props) => {
    //console.log(props.patientObj)
    const [activePage, setActivePage]= useState('list')
    const handleIClickPage =(activeItem)=>{
        setActivePage(activeItem)
    }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
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
                <div className="form-group mb-3 col-md-6">
                {/* <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('hiv-test', 'hiv-test')}/>
                 */}
                </div>
                </div>
        </Col>
        
      </Row>
    </Fragment>
  );
};

export default Elicitation;
