import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import { token, url as baseUrl } from "../../../../api";
import { toast } from "react-toastify";
import { forwardRef } from "react";
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
import { useHistory } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import "@reach/menu-button/styles.css";
import { Dropdown, Button, Menu, Icon } from "semantic-ui-react";

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

const HIVSTPatientHistory = (props) => {
  const [hivstHistory, setHivstHistory] = useState([]);
  let history = useHistory();

  useEffect(() => {
    //patients()
    FetchHivstHistory();
  }, [props.patientObj]);

  const LoadViewPage = (row, actionType) => {
    props.setActivePage({
      ...props.activePage,
      activePage: "hivst_view",
      activeObject: row,
      actionType: actionType,
    });
  };

  const FetchHivstHistory = () => {
    axios
      .get(`${baseUrl}hivst?patientId=${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //set the last date of visit after the response
        setHivstHistory(response.data);
      })
      .catch((error) => {
        //setLoading(false)
      });
  };

  const handleHTSDelete = (row) => {
    axios
      .delete(`${baseUrl}hivst/${props.patientObj.hivstId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        toast.success(`HIVST patient deleted successfully`);
        history.push("/");
      })
      .catch((err) => {
        console.err(err);
      });
  };

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="HIV Self Testing History "
        columns={[
          { title: "Date of Visit", field: "dateOfVisit" },
          { title: "Service Delivery Point", field: "serviceDeliveryPoint" },
          {
            title: "Number of Test Kits Received",
            field: "numberOfHivstKitsReceived",
          },
          { title: "User Type", field: "userType" },
          {
            title: "Type of HIVST Kit Received",
            field: "typeOfHivstKitReceived",
            filtering: false,
          },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        isLoading={props.loading}
        data={hivstHistory.map((row) => ({
          // id: row.id,
          dateOfVisit: row.dateOfVisit,
          serviceDeliveryPoint: row.serviceDeliveryPoint,
          numberOfHivstKitsReceived: row.numberOfHivstKitsReceived,
          userType: row.userType,
          typeOfHivstKitReceived: row.typeOfHivstKitReceived,

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
                    <Dropdown item text="Action">
                      <Dropdown.Menu style={{ marginTop: "10px" }}>
                        <Dropdown.Item
                          onClick={() => LoadViewPage(row, "view")}
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
                        <Dropdown.Item onClick={() => handleHTSDelete(row)}>
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
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

export default HIVSTPatientHistory;
