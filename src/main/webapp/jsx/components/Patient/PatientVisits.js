import { useState, useEffect, useMemo, useCallback } from "react";
import { usePermissions } from "../../../hooks/usePermissions";
import ButtonMui from "@material-ui/core/Button";
import axios from "axios";
import { forwardRef } from "react";
import { Grid, Paper, TextField,Button } from "@mui/material";
import DualListBox from "react-dual-listbox";
import { Modal, ModalBody, ModalHeader, FormGroup } from "reactstrap";
import moment from "moment";
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
import "@reach/menu-button/styles.css";
import { Label } from "semantic-ui-react";
import CustomTable from "../../../reuseables/CustomTable";
import { token as token, url as baseUrl } from "./../../../api";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useGetCodesets } from "../../hooks/useGetCodesets.hook";

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

const PatientVisits = (props) => {
  const { patientObj } = props;
  let history = useHistory();

  
  const { hasAnyPermission } = usePermissions();
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkinDate, setCheckinDate] = useState(new Date());
  const [checkoutDate, setCheckoutDate] = useState(new Date());
  const [selectedServices, setSelectedServices] = useState({ selected: [] });
  const [services, setServices] = useState([]);
  const [patientVisits, setPatientVisits] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPPI, setShowPPI] = useState(true);
  const [pregnancyStatusPregnant, setPregnancyStatusPregnant] = useState(null);




  // Check if there is any visit not completed
const hasIncompleteVisit = patientVisits.some(visit => visit.status?.toLowerCase() !== 'pending');

// Example: disable the "Complete All" button if any visit is not completed
const isCompleteButtonDisabled = hasIncompleteVisit;

  const permissions = useMemo(
    () => ({
      view_patient: hasAnyPermission("view_patient", "all_permissions"),
    }),
    [hasAnyPermission]
  );

  const filterPregnancyCodeId = (data) => {
    const pregnancyCode = data?.filter?.(item =>
      item.code === "PREGANACY_STATUS_PREGNANT"
      )[0]?.id;
      console.log(data, pregnancyCode)

    setPregnancyStatusPregnant(pregnancyCode)
  }

  useGetCodesets({
    codesetsKeys: ["PREGANACY_STATUS"],
    patientId: props.patientInfo?.id || props?.patientInfo?.patientId,
    onSuccess: filterPregnancyCodeId
  })

  

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}patient/post-service`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const allServices = response.data;
      setAllServices(allServices); // still store all, if needed
  
      // Determine the relevant service based on patient status
      const patientStatus =  props.patientInfo?.hivTestResult?.toLowerCase();
     
      
      let matchedService = [];

      if (patientStatus === "negative" && props.patientInfo?.pregnant === ("PREGANACY_STATUS_PREGNANT" || pregnancyStatusPregnant || "Pregnant")) {
        matchedService = allServices.filter(item =>
          item.moduleServiceName.toLowerCase().includes("pmtct")
        );
      } else if (patientStatus === "positive") {
        matchedService = allServices.filter(item =>
          item.moduleServiceName.toLowerCase().includes("hiv")
        );
      }
      else if (patientStatus === "negative" ) {
        matchedService = allServices.filter(item =>
          item.moduleServiceName.toLowerCase().includes("prep")
        );
      }


      setServices(
        matchedService.map((service) => ({
          label: service.moduleServiceName,
          value: service.moduleServiceCode,
        }))
      );
  
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, token, props?.patientInfo?.hivTestResult]);
  

  const fetchPatientVisits = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}patient/visit/visit-by-patient/${patientObj?.id || patientObj?.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const htsVisits = response?.data?.filter((visit) => visit?.service?.toLowerCase() === "hts_code" || visit?.service === "HTS_code")

      setPatientVisits(htsVisits);
      const hasActiveVisit = response.data.some(
        (visit) => !visit.checkOutTime || visit.status === "PENDING"
      );
      setCheckinStatus(hasActiveVisit);
      setCheckinStatus(hasActiveVisit);
    } catch (error) {
      toast.error("Failed to fetch patient visits");
    }
  }, [patientObj.id]);

  useEffect(() => {
    fetchServices();
    fetchPatientVisits();
  }, [fetchServices, fetchPatientVisits]);


  const handleCheckin = async (e) => {
    e.preventDefault();

    await handleCheckout()

    if (!selectedServices.selected.length) {
      toast.error("Please select at least one service");
      return;
    }

    const serviceIds = selectedServices.selected
      .map((code) => {
        const service = allServices.find((s) => s.moduleServiceCode === code);
        return service ? service.id : null;
      })
      .filter((id) => id !== null);

    try {
      await axios.post(
        `${baseUrl}patient/visit/checkin`,
        {
          serviceIds,
          visitDto: {
            personId: patientObj.id,
            checkInDate: moment(checkinDate).format("YYYY-MM-DD HH:mm"),
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Check-in successful");
      setCheckinStatus(true);
      setIsCheckinModalOpen(false);
      fetchPatientVisits();
    } catch (error) {
      if (error.response?.data?.apierror) {
        const apiError = error.response.data.apierror;
        // Check if it's a service already exists error
        if (apiError.message?.includes("VisitService already exist")) {
          toast.error(
            "Could not check-in. Patient already has an active visit"
          );
        }
        // Generic error message for other API errors
        else {
          toast.error(apiError.message || "Check-in failed. Please try again.");
        }
      }

      console.error("Check-in error details:", error.response?.data);
    }
  };

  // const handleCheckout = async () => {
  //   const activeVisit = patientVisits.find(
  //     (visit) => visit.status === "PENDING"
  //   );
  //   if (!activeVisit) {
  //     toast.error("No Pending visit found");
  //     return;
  //   }

  //   try {
  //     await axios.put(
  //       `${baseUrl}patient/visit/checkout/${activeVisit.id}`,
  //       { checkOutDate: moment(checkoutDate).format("YYYY-MM-DD HH:mm") },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     toast.success("Check-out successful");
  //     setCheckinStatus(false);
  //     setIsCheckoutModalOpen(false);
  //     fetchPatientVisits();
  //   } catch (error) {
  //     toast.error("Check-out failed");
  //   }
  // };

  const handleCheckout = async () => {
    const activeVisit = patientVisits.find(
      (visit) => visit.status === "PENDING" && visit.service === "HTS_code"
    );
    if (!activeVisit) {
      toast.error("No pending HTS visit found");
      return;
    }
    if (activeVisit.service !== "HTS_code") {
      toast.error("Can only checkout HTS services");
      return;
    }
    try {
      await axios.put(
        `${baseUrl}patient/visit/checkout/${activeVisit.id}`,
        { checkOutDate: moment(checkoutDate).format("YYYY-MM-DD HH:mm") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Check-out successful")
      setCheckinStatus(false);
      setIsCheckoutModalOpen(false);
      fetchPatientVisits();
    } catch (error) {
      toast.error("Check-out failed");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Check In Date",
        field: "checkInDate",
        render: (rowData) =>
          moment(rowData.checkInDate).format("YYYY-MM-DD HH:mm"),
      },
      {
        title: "Check Out Date",
        field: "checkOutDate",
        render: (rowData) =>
          rowData.checkOutDate
            ? moment(rowData.checkOutDate).format("YYYY-MM-DD HH:mm")
            : "N/A",
      },
      { title: "Service", field: "service" },
      { title: "Status", field: "status" },
    ],
    []
  );

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">

      {patientVisits.some(
          (visit) => visit.service === "HTS_code" && visit.status === "PENDING" && props?.patientInfo?.hivTestResult !== null
        ) &&
        // (
        //   <>
        //   {permissions.view_patient && checkinStatus && (
        //     <ButtonMui
        //       variant="contained"
        //       style={{
        //         backgroundColor: "green",
        //         color: "white",
        //         marginLeft: "10px",
        //       }}
        //       onClick={() => setIsCheckoutModalOpen(true)}
        //       disabled={isCompleteButtonDisabled}
        //     >
        //       Check Out
        //     </ButtonMui>
        //   )}
        //   </>
        //   ): 
            <>
            {
            permissions.view_patient && (
              <ButtonMui
                variant="contained"
                color="primary"
                onClick={() => setIsCheckinModalOpen(true)}
              >
                Post Patient
              </ButtonMui>)
            }
            </>
      }
      </div>

      <CustomTable
        title="Patient Visits"
        columns={columns}
        data={patientVisits}
        icons={tableIcons}
        showPPI={showPPI}
        isLoading={isLoading}
        onPPIChange={(e) => setShowPPI(!e.target.checked)}
      />


      <Modal
        size="lg"
        style={{ maxWidth: "900px" }}
        isOpen={isCheckinModalOpen}
        toggle={() => setIsCheckinModalOpen(false)}
      >
        <ModalHeader toggle={() => setIsCheckinModalOpen(false)}>
          <h5
            style={{ fontWeight: "bold", fontSize: "30px", color: "#992E62" }}
          >
            Select Check-In Service
          </h5>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleCheckin}>
            <Paper
              style={{
                display: "grid",
                gridRowGap: "20px",
                padding: "20px",
                margin: "10px 10px",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormGroup style={{ width: "100%" }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Label
                        for="post-services"
                        style={{
                          color: "#014d88",
                          fontWeight: "bolder",
                          fontSize: "18px",
                        }}
                      >
                        Check-In Date *
                      </Label>
                      <DesktopDateTimePicker
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              input: { fontSize: "14px" },
                            }}
                            fullWidth
                          />
                        )}
                        value={checkinDate}
                        onChange={(newValue) => {
                          setCheckinDate(newValue);
                        }}
                        maxDate={new Date()}
                        maxTime={new Date()}
                        style={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </FormGroup>
                </Grid>
                <Grid item xs={12}>
                  <FormGroup>
                    <Label
                      for="post-services"
                      style={{
                        color: "#014d88",
                        fontWeight: "bolder",
                        fontSize: "18px",
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "bold",
                          fontSize: "30px",
                          color: "#992E62",
                        }}
                      >
                        Check-In Service *
                      </h5>
                    </Label>
                    <DualListBox
                      options={services}
                      onChange={(selected) =>
                        setSelectedServices({ ...selectedServices, selected })
                      }
                      selected={selectedServices.selected}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </form>
        </ModalBody>
      </Modal>


      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        toggle={() => setIsCheckoutModalOpen(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setIsCheckoutModalOpen(false)}>
          <h5 style={{ fontWeight: "bold", color: "#014d88" }}>Check Out</h5>
        </ModalHeader>
        <ModalBody>
          <Paper style={{ padding: "20px" }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormGroup>
                  <Label style={{ color: "#014d88", fontWeight: "bold" }}>
                    Check-out Date *
                  </Label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={moment(checkoutDate).format("YYYY-MM-DDTHH:mm")}
                    onChange={(e) => setCheckoutDate(new Date(e.target.value))}
                    max={moment().format("YYYY-MM-DDTHH:mm")}
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <ButtonMui
                  variant="contained"
                  color="primary"
                  onClick={handleCheckout}
                >
                  Confirm Check Out
                </ButtonMui>
                <ButtonMui
                  variant="contained"
                  style={{
                    backgroundColor: "#992E62",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => setIsCheckoutModalOpen(false)}
                >
                  Cancel
                </ButtonMui>
              </Grid>
            </Grid>
          </Paper>
        </ModalBody>
      </Modal>



    </div>
  );
};

export default PatientVisits;

// const PatientVisits = (props) => {
//   const { patientObj } = props;
//   const { hasAnyPermission } = usePermissions();
//   const [checkinStatus, setCheckinStatus] = useState(false);
  // const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
//   const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
//   const [checkinDate, setCheckinDate] = useState(new Date());
//   const [checkoutDate, setCheckoutDate] = useState(new Date());
//   const [selectedServices, setSelectedServices] = useState({ selected: [] });
//   const [services, setServices] = useState([]);
//   const [patientVisits, setPatientVisits] = useState([]);
//   const [allServices, setAllServices] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const permissions = useMemo(
//     () => ({
//       view_patient: hasAnyPermission("view_patient", "all_permissions"),
//     }),
//     [hasAnyPermission]
//   );

//   const fetchServices = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${baseUrl}patient/post-service`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setAllServices(response.data);
//       setServices(
//         response.data.map((service) => ({
//           label: service.moduleServiceName,
//           value: service.moduleServiceCode,
//         }))
//       );
//     } catch (error) {
//       toast.error("Failed to fetch services");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

// const fetchPatientVisits = useCallback(async () => {
//   try {
//     const response = await axios.get(
//       `${baseUrl}patient/visit/visit-by-patient/${patientObj.id}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const hivVisits = response.data.filter(
//       (visit) => visit.service === "HIV_code"
//     );


//     setPatientVisits(hivVisits);
  

//     // Update checkinStatus based on pending HIV visits
//     const hasActiveHIVVisit = hivVisits.some(
//       (visit) => visit.service === "HIV_code" && visit.status === "PENDING"
//     );
//     setCheckinStatus(hasActiveHIVVisit);
//   } catch (error) {
//     toast.error("Failed to fetch patient visits");
//   }
// }, [patientObj.id]);

//   useEffect(() => {
//     fetchServices();
//     fetchPatientVisits();
//   }, [fetchServices, fetchPatientVisits]);

  // const handleCheckin = async (e) => {
  //   e.preventDefault();

  //   if (!selectedServices.selected.length) {
  //     toast.error("Please select at least one service");
  //     return;
  //   }

  //   const serviceIds = selectedServices.selected
  //     .map((code) => {
  //       const service = allServices.find((s) => s.moduleServiceCode === code);
  //       return service ? service.id : null;
  //     })
  //     .filter((id) => id !== null);

  //   try {
  //     await axios.post(
  //       `${baseUrl}patient/visit/checkin`,
  //       {
  //         serviceIds,
  //         visitDto: {
  //           personId: patientObj.id,
  //           checkInDate: moment(checkinDate).format("YYYY-MM-DD HH:mm"),
  //         },
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     toast.success("Check-in successful");
  //     setCheckinStatus(true);
  //     setIsCheckinModalOpen(false);
  //     fetchPatientVisits();
  //   } catch (error) {
  //     if (error.response?.data?.apierror) {
  //       const apiError = error.response.data.apierror;
  //       // Check if it's a service already exists error
  //       if (apiError.message?.includes("VisitService already exist")) {
  //         toast.error(
  //           "Could not check-in. Patient already has an active visit"
  //         );
  //       }
  //       // Generic error message for other API errors
  //       else {
  //         toast.error(apiError.message || "Check-in failed. Please try again.");
  //       }
  //     }

  //     console.error("Check-in error details:", error.response?.data);
  //   }
  // };

//   const handleCheckout = async () => {
//     const activeVisit = patientVisits.find(
//       (visit) => visit.status === "PENDING" && visit.service === "HIV_code"
//     );
//     if (!activeVisit) {
//       toast.error("No pending HIV visit found");
//       return;
//     }
//     if (activeVisit.service !== "HIV_code") {
//       toast.error("Can only checkout HIV services");
//       return;
//     }
//     try {
//       await axios.put(
//         `${baseUrl}patient/visit/checkout/${activeVisit.id}`,
//         { checkOutDate: moment(checkoutDate).format("YYYY-MM-DD HH:mm") },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Check-out successful");
//       setCheckinStatus(false);
//       setIsCheckoutModalOpen(false);
//       fetchPatientVisits();
//     } catch (error) {
//       toast.error("Check-out failed");
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         title: "Check In Date",
//         field: "checkInDate",
//         render: (rowData) =>
//           moment(rowData.checkInDate).format("YYYY-MM-DD HH:mm"),
//       },
//       {
//         title: "Check Out Date",
//         field: "checkOutDate",
//         render: (rowData) =>
//           rowData.checkOutDate
//             ? moment(rowData.checkOutDate).format("YYYY-MM-DD HH:mm")
//             : "N/A",
//       },
//       { title: "Service", field: "service" },
//       { title: "Status", field: "status" },
//     ],
//     []
//   );



//   return (
//     <div>
//       <div className="d-flex justify-content-end mb-3">
        // {patientVisits.some(
        //   (visit) => visit.service === "HIV_code" && visit.status === "PENDING"
        // )
//           ? // Check Out button only for pending HIV visits
//             permissions.view_patient && (
//               <ButtonMui
//                 variant="contained"
//                 style={{
//                   backgroundColor: "green",
//                   color: "white",
//                   marginLeft: "10px",
//                 }}
//                 onClick={() => setIsCheckoutModalOpen(true)}
//               >
//                 Check Out
//               </ButtonMui>
//             )
//           : // Check In button when no pending HIV visits
//             permissions.view_patient && (
//               <ButtonMui
//                 variant="contained"
//                 color="primary"
//                 onClick={() => setIsCheckinModalOpen(true)}
//               >
//                 Check In
//               </ButtonMui>
//             )}
//       </div>

//       <CustomTable
//         title="Patient Visits"
//         columns={columns}
//         data={patientVisits} 
//         icons={tableIcons}
//         isLoading={isLoading}
//         onPPIChange={(e) => setShowPPI(!e.target.checked)}
//       />

      // <Modal
      //   size="lg"
      //   style={{ maxWidth: "900px" }}
      //   isOpen={isCheckinModalOpen}
      //   toggle={() => setIsCheckinModalOpen(false)}
      // >
      //   <ModalHeader toggle={() => setIsCheckinModalOpen(false)}>
      //     <h5
      //       style={{ fontWeight: "bold", fontSize: "30px", color: "#992E62" }}
      //     >
      //       Select Check-In Service
      //     </h5>
      //   </ModalHeader>
      //   <ModalBody>
      //     <form onSubmit={handleCheckin}>
      //       <Paper
      //         style={{
      //           display: "grid",
      //           gridRowGap: "20px",
      //           padding: "20px",
      //           margin: "10px 10px",
      //         }}
      //       >
      //         <Grid container spacing={2}>
      //           <Grid item xs={12}>
      //             <FormGroup style={{ width: "100%" }}>
      //               <LocalizationProvider dateAdapter={AdapterDateFns}>
      //                 <Label
      //                   for="post-services"
      //                   style={{
      //                     color: "#014d88",
      //                     fontWeight: "bolder",
      //                     fontSize: "18px",
      //                   }}
      //                 >
      //                   Check-In Date *
      //                 </Label>
      //                 <DesktopDateTimePicker
      //                   renderInput={(params) => (
      //                     <TextField
      //                       {...params}
      //                       sx={{
      //                         input: { fontSize: "14px" },
      //                       }}
      //                       fullWidth
      //                     />
      //                   )}
      //                   value={checkinDate}
      //                   onChange={(newValue) => {
      //                     setCheckinDate(newValue);
      //                   }}
      //                   maxDate={new Date()}
      //                   maxTime={new Date()}
      //                   style={{ width: "100%" }}
      //                 />
      //               </LocalizationProvider>
      //             </FormGroup>
      //           </Grid>
      //           <Grid item xs={12}>
      //             <FormGroup>
      //               <Label
      //                 for="post-services"
      //                 style={{
      //                   color: "#014d88",
      //                   fontWeight: "bolder",
      //                   fontSize: "18px",
      //                 }}
      //               >
      //                 <h5
      //                   style={{
      //                     fontWeight: "bold",
      //                     fontSize: "30px",
      //                     color: "#992E62",
      //                   }}
      //                 >
      //                   Check-In Service *
      //                 </h5>
      //               </Label>
      //               <DualListBox
      //                 options={services}
      //                 onChange={(selected) =>
      //                   setSelectedServices({ ...selectedServices, selected })
      //                 }
      //                 selected={selectedServices.selected}
      //               />
      //             </FormGroup>
      //           </Grid>
      //         </Grid>
      //         <Grid container spacing={2}>
      //           <Grid item xs={12}>
      //             <Button type="submit" variant="contained" color="primary">
      //               Submit
      //             </Button>
      //           </Grid>
      //         </Grid>
      //       </Paper>
      //     </form>
      //   </ModalBody>
      // </Modal>

//       {/* Checkout Modal */}
//       <Modal
//         isOpen={isCheckoutModalOpen}
//         toggle={() => setIsCheckoutModalOpen(false)}
//         size="lg"
//       >
//         <ModalHeader toggle={() => setIsCheckoutModalOpen(false)}>
//           <h5 style={{ fontWeight: "bold", color: "#014d88" }}>Check Out</h5>
//         </ModalHeader>
//         <ModalBody>
//           <Paper style={{ padding: "20px" }}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <FormGroup>
//                   <Label style={{ color: "#014d88", fontWeight: "bold" }}>
//                     Check-out Date *
//                   </Label>
//                   <input
//                     type="datetime-local"
//                     className="form-control"
//                     value={moment(checkoutDate).format("YYYY-MM-DDTHH:mm")}
//                     onChange={(e) => setCheckoutDate(new Date(e.target.value))}
//                     max={moment().format("YYYY-MM-DDTHH:mm")}
//                   />
//                 </FormGroup>
//               </Grid>

//               <Grid item xs={12}>
//                 <ButtonMui
//                   variant="contained"
//                   color="primary"
//                   onClick={handleCheckout}
//                 >
//                   Confirm Check Out
//                 </ButtonMui>
//                 <ButtonMui
//                   variant="contained"
//                   style={{
//                     backgroundColor: "#992E62",
//                     marginLeft: "10px",
//                     color: "white",
//                   }}
//                   onClick={() => setIsCheckoutModalOpen(false)}
//                 >
//                   Cancel
//                 </ButtonMui>
//               </Grid>
//             </Grid>
//           </Paper>
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default PatientVisits;
