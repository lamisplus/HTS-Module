import React from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./../src/main/webapp/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./main/webapp/jsx/components/Home";
import RegisterPatient from "./main/webapp/jsx/components/Patient/RegisterPatient";
import PatientDetail from "./main/webapp/jsx/components/Patient/PatientDetail";
import HIVSTPatient from "./main/webapp/jsx/components/Patient/HIVST/HIVSTPatient";
import DuplicateHTSPatientList from "./main/webapp/jsx/components/Patient/DuplicateHTSPatientList";
import CheckedInPatientsAlert from "./main/webapp/jsx/components/Globals/CheckinPatientsAlert";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./main/webapp/utils/queryClient";
import { useRoles } from "./main/webapp/hooks/useRoles";
import { useMemo } from "react";
import NewPatientHtsForm from "./main/webapp/jsx/components/NewToolForms/NewPatientHtsForm";
import HtsIctOrchestrator from "./main/webapp/jsx/components/IctForm/HtsIctOrchestrator";
import { useHistory } from "react-router-dom";


export default function App() {
  const { hasRole } = useRoles();
  const isRDE = hasRole("RDE");
  const history = useHistory();


  const permissions = useMemo(
    () => ({
      canSeeCheckedInPatientsAlert: !isRDE, // POC users see this
    }),
    [isRDE]
  );

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        {/* {permissions.canSeeCheckedInPatientsAlert && (
          <CheckedInPatientsAlert />
        )} */}
        <Switch>
          <Route path="/patient-history">
            <PatientDetail />
          </Route>
          <Route path="/register-patient">
            <HtsIctOrchestrator onDone={() => history.push("/")} isOnArt={false}/>
          </Route>
          <Route path="/register-hivst-patient">
            <HIVSTPatient />
          </Route>
          <Route path="/hts-duplicate-patients">
            <DuplicateHTSPatientList />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}
