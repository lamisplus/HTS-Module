import { useEffect, useState, useRef, useMemo, memo } from "react";
import { url as baseUrl, token, wsUrl } from "./../../../api";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "react-router-dom";
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
import { Card, CardBody } from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { TiArrowForward } from "react-icons/ti";
import { MdDashboard } from "react-icons/md";
import "@reach/menu-button/styles.css";
import { Label } from "semantic-ui-react";
import { usePermissions } from "../../../hooks/usePermissions";
import { useCheckedInPatientData } from "../../../hooks/useCheckedInPatientData";
import CustomTable from "../../../reuseables/CustomTable";
import { calculate_age } from "../../components/utils";
import SockJsClient from "react-stomp";
import { Box, Typography, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLocalStorage } from "../Globals/useLocalStorage";

const FloatingAlert = ({ message, type = 'info', onClose }) => {
  const closeIconBackground = {
    info: '#014d88', // Blue
    success: '#4CAF50', // Green
    warning: '#FFC107', // Yellow
    error: '#F44336', // Red
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        color: '#000',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        fontFamily: "Roboto",
        gap: '16px',
        maxWidth: '400px',
        border: `1px solid ${closeIconBackground[type] || '#2196F3'}`,
      }}
    >
      <Typography variant="body1" sx={{ flex: 1 }}>
        {message}
      </Typography>
      <IconButton
        size="small"
        sx={{
          backgroundColor: closeIconBackground[type] || '#2196F3',
          color: '#fff',
          '&:hover': {
            backgroundColor: closeIconBackground[type] || '#1976D2',
          },
        }}
        onClick={onClose}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};



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

const CheckedInPatients = (props) => {
  const { hasPermission } = usePermissions();
  const [showPPI, setShowPPI] = useState(true);
  const { fetchPatients } = useCheckedInPatientData(baseUrl, token);
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [numberOfExceedingPatients, setNumberOfExceedingPatients] = useState(0);
  const [alertThresholdMinutes, setAlertThresholdMinutes] = useState(15);
  const hiddenButtonRef = useRef(null); // 
  const audioRefs = useRef({
    waiting: new Audio(`${process.env.PUBLIC_URL}/notification.mp3`),
  });

  const permissions = useMemo(
    () => ({
      canSeeEnrollButton: hasPermission("hts_register"),
    }),
    [hasPermission]
  );

  const handleCheckBox = (e) => {
    setShowPPI(!e.target.checked);
  };

  const getData = async (query) => {
    try {
      const data = await fetchPatients(query);
      const reversedData = [...(data || [])].reverse();

      // Sync localStorage with API response
      const now = new Date();
      const storedPatients = JSON.parse(localStorage.getItem("patientsQueue")) || {};
      const updatedPatients = {};

      reversedData.forEach((patient) => {
        if (!storedPatients[patient.id]) {
          // Add new patients with a timestamp
          updatedPatients[patient.id] = { ...patient, timestamp: now };
        } else {
          updatedPatients[patient.id] = storedPatients[patient.id];
        }
      });

      // Remove patients no longer in the queue
      Object.keys(storedPatients).forEach((id) => {
        if (!updatedPatients[id]) {
          delete storedPatients[id];
        }
      });

      localStorage.setItem("patientsQueue", JSON.stringify(updatedPatients));
      return {
        data: reversedData,
        page: query?.page || 0,
        totalCount: reversedData.length || 0,
      };
    } catch (error) {
      return {
        data: [],
        page: 0,
        totalCount: 0,
      };
    }
  };

  const getHospitalNumber = (identifier) => {
    const identifiers = identifier;
    const hospitalNumber = identifiers.identifier.find(
      (obj) => obj?.type == "HospitalNumber"
    );
    return hospitalNumber ? hospitalNumber.value : "";
  };


  const columns = useMemo(
    () => [
      {
        title: "Patient Name",
        field: "fullname",
        hidden: showPPI,
        render: (rowData) => (
          <p>
            {`${rowData?.firstName} ${rowData?.surname || rowData?.lastName}`}
          </p>
        ),
      },
      {
        title: "Hospital Number",
        field: "hospitalNumber",
        render: (rowData) => (
          <p>
            {rowData?.hospitalNumber || getHospitalNumber?.(rowData?.identifier) || ""}
          </p>
        ),
      },
      { title: "Sex", field: "sex" },
      {
        title: "Age", field: "age",
        render: (rowData) => (
          <p>
            {
              rowData?.dateOfBirth === 0 ||
                rowData?.dateOfBirth === undefined ||
                rowData?.dateOfBirth === null ||
                rowData?.dateOfBirth === ""
                ? 0
                : calculate_age(rowData?.dateOfBirth)
            }
          </p>
        )
      },

      {
        title: "Biometrics",
        field: "biometricStatus",
        render: (rowData) =>
          rowData.biometricStatus === true ? (
            <Label color="green" size="mini">
              Biometric Captured
            </Label>
          ) : (
            <Label color="red" size="mini">
              No Biometric
            </Label>
          ),
      },
      {
        title: "ART Status",
        field: "currentStatus",
        render: (rowData) => (
          <Label color="blue" size="mini">
            {rowData?.currentStatus || "Not Enrolled"}
          </Label>
        ),
      },
      {
        title: "Actions",
        field: "actions",
        render: (rowData) => {
          const isOnHts = rowData?.isOnHts;

          return (
            <div>
              {permissions.canSeeEnrollButton &&
                
                  <Link
                    to={{
                      pathname: "/patient-history",
                      state: {
                        patientObject: rowData,
                        patientObj: rowData,
                        clientCode: rowData?.clientCode,
                        activepage: isOnHts ? "home" : "NEW HTS",
                        checkedInPatient: true
                      },

                    }}
                  >
                    <ButtonGroup
                      variant="contained"
                      aria-label="split button"
                      style={{
                        backgroundColor: "rgb(153, 46, 98)",
                        height: "30px",
                        width: "215px",
                      }}
                      size="large"
                    >
                      <Button
                        color="primary"
                        size="small"
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        style={{
                          backgroundColor: "rgb(153, 46, 98)",
                        }}
                      >
                        {isOnHts ? <MdDashboard /> : <TiArrowForward />}
                      </Button>
                      <Button
                        style={{
                          backgroundColor: "rgb(153, 46, 98)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            fontWeight: "bolder",
                          }}
                        >
                          {isOnHts ? "Patient Dashboard" : "Enroll Patient"}
                        </span>
                      </Button>
                    </ButtonGroup>
                  </Link>
                }
            </div>
          );
        },
      },
    ],
    [showPPI, permissions.canSeeEnrollButton]
  );

  const playSound = (soundKey) => {
    if (JSON.parse(localStorage.getItem("enableAppSound"))) {
      const audio = audioRefs.current[soundKey];
      if (audio) {
        audio.play().catch((err) => {
          console.warn('Audio playback failed:', err);
        });
      }
    }
  };

  // Check for patients exceeding the alert threshold
  useEffect(() => {
    const interval = setInterval(() => {
      const storedPatients = JSON.parse(localStorage.getItem("patientsQueue")) || {};
      const now = new Date();
      const exceedingPatients = Object.values(storedPatients).filter((patient) => {
        const timestamp = new Date(patient.timestamp);
        const minutesInQueue = (now - timestamp) / (1000 * 60);
        return minutesInQueue > alertThresholdMinutes;
      });
      setNumberOfExceedingPatients(exceedingPatients.length)
      if (exceedingPatients.length > 0) {
        setShowCustomAlert(true)

        if (JSON.parse(localStorage.getItem("enableAppSound"))) {
          playSound("waiting")
        }
      }
    }, 60000); // Check every 60 seconds

    return () => {
      clearInterval(interval)
      localStorage.removeItem("patientsQueue")
    };
  }, []);

  useEffect(() => {

    // Simulate a user interaction by programmatically clicking the hidden button
    if (hiddenButtonRef.current) {
      hiddenButtonRef.current.click();
    }

    // Preload sounds when enabled
    if (JSON.parse(localStorage.getItem("enableAppSound"))) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.load();
      });
    }
  }, []);




  const onMessageReceived = (msg) => {
    if (msg && msg?.toLowerCase()?.includes("check") && msg?.toLowerCase()?.includes("hts")) {
      setTableRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div>
      <SockJsClient
        url={wsUrl}
        topics={["/topic/checking-in-out-process"]}
        onMessage={onMessageReceived}
        debug={true}
      />
      <Card>
        <CardBody>
          <CustomTable
            key={tableRefreshTrigger}
            title="HTS Checked In Patients"
            columns={columns}
            data={getData}
            icons={tableIcons}
            showPPI={showPPI}
            onPPIChange={handleCheckBox}
          />
        </CardBody>
      </Card>

      <Slide
        in={showCustomAlert}
        direction="up"
        mountOnEnter
        unmountOnExit
        timeout={{ enter: 500, exit: 400 }} // Adjust animation duration
      >
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '40%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
          }}
        >
          <FloatingAlert
            message={`${numberOfExceedingPatients} patient${numberOfExceedingPatients > 1 ? "s" : ""} have been waiting longer than expected in the queue.`}
            type="info" // Can be 'info', 'success', 'warning', 'error'
            onClose={() => setShowCustomAlert(false)}
          />
        </Box>
      </Slide>


      <button
        ref={hiddenButtonRef}
        style={{ display: 'none' }}
        onClick={() => playSound("connected")}
      >
        Hidden Play Button
      </button>
    </div>
  );
};

export default memo(CheckedInPatients);

