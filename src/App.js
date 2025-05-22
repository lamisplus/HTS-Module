import React from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./../src/main/webapp/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./main/webapp/jsx/components/Home";
import PatientDetail from "./main/webapp/jsx/components/Patient/PatientDetail";
import HIVSTPatient from "./main/webapp/jsx/components/Patient/HIVST/HIVSTPatient";
import CheckedInPatientsAlert from "./main/webapp/jsx/components/Globals/CheckinPatientsAlert";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./main/webapp/utils/queryClient";


export default function App() {
 
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <CheckedInPatientsAlert />
        <Switch>
          <Route path="/patient-history">
            <PatientDetail />
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
