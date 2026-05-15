import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input, Form } from "reactstrap";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { token, url as baseUrl } from "../../../../api";
import "react-phone-input-2/lib/style.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import "react-phone-input-2/lib/style.css";
import { Button } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import { Label as LabelRibbon, Message } from "semantic-ui-react";
import PhoneInput from "react-phone-input-2";
import ServicesProvided from "./ServicesProvided";
import RefferralUnit from "./RefferalUnit";
import Cookies from "js-cookie";
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
    width: 300,
  },
  button: {
    margin: theme.spacing(1),
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
  error: {
    color: "#f85032",
    fontSize: "12.8px",
  },
  success: {
    color: "green",
    fontSize: "12.8px",
    fontWeight: "bold",
  },
}));

const ClientRefferalForm = (props) => {
  const classes = useStyles();
  const [content, setContent] = useState({
    showReferringUnit: false,
    showServiceProviderUnit: false,
  });
  const patientObj = props.patientObj;
  const [kP, setKP] = useState([]);
  const [errors, setErrors] = useState({});
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [saving, setSaving] = useState(false);
  let temp = { ...errors };
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const [setting, setSetting] = useState([]);
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [genders, setGenders] = useState([]);
  const [targetGroupValue, setTargetGroupValue] = useState(null);


  const [contentDropDown, setContentDropDown] = useState("");
 

  const handleContentChange = (e) => {
    setContentDropDown(e.target.value);
    if (e.target.value === "showReferringUnit") {
      setContent({
        showReferringUnit: true,
        showServiceProviderUnit: false,
      });
    }

    if (e.target.value === "showServiceProviderUnit") {
      setContent({
        showReferringUnit: false,
        showServiceProviderUnit: true,
      });
    }
  };

  return (
    <>
      <div>
        <div className="form-group  col-md-8">
          <FormGroup>
            <Label>
              Referral Type <span style={{ color: "red" }}> *</span>
            </Label>
            <select
              className="form-control"
              name="contentDropDown"
              id="contentDropDown"
              onChange={handleContentChange}
              style={{
                border: "1px solid #014D88",
                borderRadius: "0.2rem",
              }}
            >
              <option value={""}>Select Refarral form type</option>
              <option value={"showReferringUnit"}>Referral form</option>
              <option value={"showServiceProviderUnit"}>
                Service Provider form
              </option>
            </select>
          </FormGroup>
        </div>
      </div>
      <Card className={classes.root}>
        {content.showReferringUnit
          && <RefferralUnit
            patientObj={patientObj}
            // formInfo={formInfo}
            // row={props.row}
            handleClicked={props.handleClicked}
          />}
        {content.showServiceProviderUnit && (
          <CardBody>
            <ServicesProvided
              patientObj={patientObj}
            // formInfo={props.formInfo}
            // row={props.row}
            />
          </CardBody>
        )}
        {/* recieving facility  */}
      </Card>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Are you Sure of the Age entered?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};


export default ClientRefferalForm;
