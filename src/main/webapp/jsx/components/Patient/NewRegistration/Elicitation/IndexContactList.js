import React, { useEffect, useState } from 'react'
import MaterialTable from 'material-table';
import axios from "axios";
import { url as baseUrl, token } from "./../../../../../api";
//import { token as token } from "./../../../api";
import { forwardRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/dist/css/react-widgets.css';
import { makeStyles } from '@material-ui/core/styles'
//import { useHistory } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import "@reach/menu-button/styles.css";
import { Dropdown,Button, Menu, Icon } from 'semantic-ui-react'
import moment from "moment";

const tableIcons = {
Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    cardBottom: {
        marginBottom: 20
    },
    Select: {
        height: 45,
        width: 350
    },
    button: {
        margin: theme.spacing(1)
    },

    root: {
        '& > *': {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: 'none'
    },
    error: {
        color: "#f85032",
        fontSize: "11px",
    },
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    }, 
}))



const PatientnHistory = (props) => {

    const [indexClientList, setIndexClientList] = useState([])
    //const [patientObj, setpatientObj] = useState([])
    const patientId = props.patientObj && props.patientObj.id ? props.patientObj.id: null
    //const [key, setKey] = useState('home');
    //console.log(props)
    useEffect(() => {
        patients()
      }, []);
    ///GET LIST OF Patients
    async function patients() {
        axios
            .get(`${baseUrl}hts/${props.patientObj.id}/index-elicitation`,
            { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                console.log(response.data)
                setIndexClientList(response.data);
            })
            .catch((error) => {    
            });        
    }
    const handleItemClickPage =(page)=>{
        props.handleIClickPage(page)
    }
    const handleIEditIndex =(page, activePage)=> {
        console.log(page)
        console.log(activePage)
        //props.setActivePage({...props.activePage, activePage:"activePage", activeObject:row, actionType:actionType})
        //props.handleIClickPage(page)
    }

    const calculate_age = dob => {
        var today = new Date();
        var dateParts = dob.split("-");
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age_now--;
                }
            if (age_now === 0) {
                    return m + " month(s)";
                }
                return age_now + " year(s)";
      };


  return (
    <div>     
        <Button
            variant="contained"
            color="primary"
            className=" float-end  mr-2 mt-2"
            onClick={()=>handleItemClickPage('add')}
            //startIcon={<FaUserPlus size="10"/>}
        >
            <span style={{ textTransform: "capitalize" }}>New Index Client </span>
        </Button>
        <br/><br/><br/><br/>
            <MaterialTable
            icons={tableIcons}
              title="List of  client contact"
              columns={[
              { title: "Name", field: "name" },
              { title: "Age", field: "age" },
              { title: "Phone Number", field: "phone" },  
              {title: "Adress",field: "address",},   
             // { title: "Actions", field: "actions", filtering: false },
              ]}
              data={ indexClientList.map((row) => ({
                name: row.firstName + " " + row.lastName,
                age:calculate_age(moment(row.dob).format("DD-MM-YYYY")),
                phone:row.phoneNumber, 
                address:row.address,  
                actions:(
                        <>
                        {/* <Menu.Menu position='right'  >
                            <Menu.Item >
                                <Button style={{backgroundColor:'rgb(153,46,98)'}} primary>
                                <Dropdown item text='Action'>

                                <Dropdown.Menu style={{ marginTop:"10px", }}>
                                
                                <Dropdown.Item  
                                //onClick={()=>handleIEditIndex(row, 'update')}
                                >
                                    <Icon name='edit' />Edit</Dropdown.Item>
                                <Dropdown.Item  
                                //onClick={()=>LoadDeletePage(row, 'delete')}
                                > <Icon name='trash' /> Delete</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                                </Button>
                            </Menu.Item>
                        </Menu.Menu> */}
                        </>
                        )
                    }))}
            
                        options={{
                          headerStyle: {
                              //backgroundColor: "#9F9FA5",
                              color: "#000",
                          },
                          searchFieldStyle: {
                              width : '200%',
                              margingLeft: '250px',
                          },
                          filtering: false,
                          exportButton: false,
                          searchFieldAlignment: 'left',
                          pageSizeOptions:[10,20,100],
                          pageSize:10,
                          debounceInterval: 400
                      }}
            />

    </div>
  );
}

export default PatientnHistory;


