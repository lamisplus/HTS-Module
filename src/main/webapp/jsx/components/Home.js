import React, {useState, Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Row, Col, Card,  Tab, Tabs, } from "react-bootstrap";
import Dashboard from './Patient/PatientList'
import VisualisationHome from './Visualisation/Index'
import { FaUserPlus } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = () => {
    const [key, setKey] = useState('home');


  return (
    <Fragment>  
      <div className="row page-titles mx-0" style={{marginTop:"0px", marginBottom:"-10px"}}>
			<ol className="breadcrumb">
				<li className="breadcrumb-item active"><h4>HTS</h4></li>
			</ol>  
		  </div>
        <Link to={"register-patient"}>
              <Button
                  variant="contained"
                  color="primary"
                  className="mt-2 mr-3 mb-0 float-end"
                  startIcon={<FaUserPlus size="10"/>}
                  style={{backgroundColor:'#014d88',}}
              >
                  <span style={{ textTransform: "capitalize" }}>New Patient</span>
              </Button>
        </Link>            
        <br/><br/> <br/>      
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
                  
                  <Tab eventKey="home" title="Patients">                   
                  <Dashboard />
                  </Tab> 
                  {/* <Tab eventKey="visualization" title="Data Visualisation ">                   
                  <VisualisationHome />
                  </Tab>                     */}
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
