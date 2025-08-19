import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import { url as baseUrl, token } from "./../../../../../api";
//import { token as token } from "./../../../api";
import { forwardRef } from "react";
import { useHistory } from "react-router-dom";

import "semantic-ui-css/semantic.min.css";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { makeStyles } from "@material-ui/core/styles";
//import { useHistory } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import "@reach/menu-button/styles.css";
import { Dropdown, Button, Menu, Icon } from "semantic-ui-react";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const PNSList = (props) => {
  let history = useHistory();
  const [indexClientList, setIndexClientList] = useState([]);
  const [recordSelected, setRecordSelected] = useState({});

  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  //const [patientObj, setpatientObj] = useState([])
  const patientId =
    props.patientObj && props.patientObj.id ? props.patientObj.id : null;
  
  useEffect(() => {
    patients();
  }, []);
  ///GET LIST OF Patients
  async function patients() {
    axios
      .get(
        `${baseUrl}hts-personal-notification-service/${props.patientObj.id}/hts-client`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
    
        setIndexClientList(response.data);
      })
      .catch((error) => {});
  }
  const addNewPns = (e) => {
    e.preventDefault();
    props.handleItemClick("pns");
  };
  const LoadViewPage = (row, actionType) => {
    props.handleItemClick("view-pns");
    props.setRow({ row: row, action: actionType });
  };
  const LoadModal = (row) => {
    toggle();
    setRecordSelected(row);
  };

  const enrollEllicitedPatient = (row, actionType) => {
   
    let obj = {
      uuid: row.uuid,
      type: "partner",
      clientCode: props?.patientObj?.clientCode,
    };
    localStorage.setItem("index", JSON.stringify(obj));
    history.push("/register-patient");
  };
  const LoadDeletePage = (row) => {
    // setSaving(true);
    //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
    axios
      .delete(
        `${baseUrl}hts-personal-notification-service/${recordSelected.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        toast.success("Record Deleted Successfully");
        toggle();
        patients();
        // setSaving(false);
      })
      .catch((error) => {
        // setSaving(false);
        if (error.response && error.response.data) {
          let errorMessage =
            error.response.data.apierror &&
            error.response.data.apierror.message !== ""
              ? error.response.data.apierror.message
              : "Something went wrong, please try again";
          toast.error(errorMessage);
        } else {
          toast.error("Something went wrong. Please try again...");
        }
      });
  };
  return (
    <>
      <div>
        <Button
          variant="contained"
          color="primary"
          className=" float-end  mr-2 mt-2"
          onClick={(e) => addNewPns(e)}
          //startIcon={<FaUserPlus size="10"/>}
        >
          <span style={{ textTransform: "capitalize" }}>Add New PNS </span>
        </Button>
        <br />
        <br />
        <br />
        <br />
        <MaterialTable
          icons={tableIcons}
          title="List of  client contact"
          columns={[
            { title: "Partner Name", field: "date" },
            { title: "Partner ID", field: "age" },
            //   { title: "Phone Number", field: "phone" },
            { title: "Partner Address", field: "address" },
            { title: "Actions", field: "actions", filtering: false },
          ]}
          isLoading={props.loading}
          data={indexClientList
            .filter((b) => b.firstName !== "")
            .map((row) => ({
              date: row.htsClientInformation.partnerName,
              age: row.partnerId,
              // phone: row.phoneNumber,
              address: row.htsClientInformation.partnerAddress,
              actions: (
                <div>
                  <Menu.Menu position="right">
                    <Menu.Item>
                      <Button
                        style={{ backgroundColor: "rgb(153,46,98)" }}
                        primary
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Dropdown
                          item
                          text="Action"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <Dropdown.Menu style={{ marginTop: "10px" }}>
                            {row?.isHtsClient === "No"  && 
                         <Dropdown.Item
                            onClick={() =>
                              enrollEllicitedPatient(row, "enroll")
                            }
                          >
                            {" "}
                            <Icon name="save" />
                            Enroll
                          </Dropdown.Item>}
                           
                           
                            <Dropdown.Item
                              onClick={(e) => LoadViewPage(row, "view")}
                            >
                              {" "}
                              <Icon name="eye" />
                              View
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => LoadViewPage(row, "update")}
                            >
                              <Icon name="edit" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => LoadModal(row)}>
                              <Icon name="delete" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </Button>
                    </Menu.Item>
                  </Menu.Menu>
                </div>
              ),
            }))}
          options={{
            headerStyle: {
              //backgroundColor: "#9F9FA5",
              color: "#000",
            },
            searchFieldStyle: {
              width: "200%",
              margingLeft: "250px",
            },
            filtering: false,
            exportButton: false,
            //   searchFieldAlignment: "left",
            pageSizeOptions: [10, 20, 100],
            pageSize: 10,
            debounceInterval: 400,
          }}
        />
      </div>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Are you Sure you want to delete{" "}
            {/* <b>{row && record.activityName}</b> */}
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => LoadDeletePage(recordSelected)}
            style={{ backgroundColor: "red", color: "#fff" }}
            // disabled={saving}
          >
            Yes
            {/* {saving === false ? "Yes" : "Deleting..."} */}
          </Button>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
            // disabled={saving}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PNSList;
