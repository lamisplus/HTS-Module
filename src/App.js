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
import CheckedInPatientsAlert from "./main/webapp/jsx/components/Globals/CheckinPatientsAlert";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./main/webapp/utils/queryClient";
import { useRoles } from "./main/webapp/hooks/useRoles";
import { useMemo } from "react";

export default function App() {
  const { hasRole } = useRoles();
  const isRDE = hasRole("RDE");

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
        {permissions.canSeeCheckedInPatientsAlert && (
          <CheckedInPatientsAlert />
        )}
        <Switch>
          <Route path="/patient-history">
            <PatientDetail />
          </Route>
          <Route path="/register-patient">
            <RegisterPatient />
          </Route>
          <Route path="/register-hivst-patient">
            <HIVSTPatient />
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
