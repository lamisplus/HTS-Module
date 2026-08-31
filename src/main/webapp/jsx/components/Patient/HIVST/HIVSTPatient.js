import React, { forwardRef, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { Label } from "semantic-ui-react";
import { MdDashboard } from "react-icons/md";
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
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import { token, url as baseUrl } from "../../../../api";

// ── Table icons (same set used across the app's MaterialTable instances) ────
const tableIcons = {
  Add: forwardRef((p, r) => <AddBox {...p} ref={r} />),
  Check: forwardRef((p, r) => <Check {...p} ref={r} />),
  Clear: forwardRef((p, r) => <Clear {...p} ref={r} />),
  Delete: forwardRef((p, r) => <DeleteOutline {...p} ref={r} />),
  DetailPanel: forwardRef((p, r) => <ChevronRight {...p} ref={r} />),
  Edit: forwardRef((p, r) => <Edit {...p} ref={r} />),
  Export: forwardRef((p, r) => <SaveAlt {...p} ref={r} />),
  Filter: forwardRef((p, r) => <FilterList {...p} ref={r} />),
  FirstPage: forwardRef((p, r) => <FirstPage {...p} ref={r} />),
  LastPage: forwardRef((p, r) => <LastPage {...p} ref={r} />),
  NextPage: forwardRef((p, r) => <ChevronRight {...p} ref={r} />),
  PreviousPage: forwardRef((p, r) => <ChevronLeft {...p} ref={r} />),
  ResetSearch: forwardRef((p, r) => <Clear {...p} ref={r} />),
  Search: forwardRef((p, r) => <Search {...p} ref={r} />),
  SortArrow: forwardRef((p, r) => <ArrowUpward {...p} ref={r} />),
  ThirdStateCheck: forwardRef((p, r) => <Remove {...p} ref={r} />),
  ViewColumn: forwardRef((p, r) => <ViewColumn {...p} ref={r} />),
};

/**
 * Patient summary list backed by GET /api/v1/hivst-encounter/patients
 * (HivstEncounterController.getPatientSummaries -> HivstPatientSummaryDto).
 * That endpoint only returns patients with at least one non-archived HIVST
 * encounter at the current facility where kits distributed > 0 (see the
 * EXISTS filter added to HivstEncounterRepository.findHivstPatientSummaries).
 *
 * Response envelope: { records: [...], totalRecords: N } - confirmed against
 * both the legacy HIVSTPatient.js and HtsEncounterList.jsx, which agree on
 * this shape for PaginationUtil.generatePagination() output.
 */
const HIVSTPatient = () => {
  const history = useHistory();
  const [showPII, setShowPII] = useState(false);

  const fetchData = (query) =>
    new Promise((resolve, reject) => {
      const search = query.search?.trim() || "*";

      axios
        .get(`${baseUrl}hivst-encounter/patients`, {
          params: { search, page: query.page, size: query.pageSize },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const records = response?.data?.records ?? [];

          resolve({
            data: records.map((row) => {
              // Shaped to match what PatientHistory / PatientDetail expect
              // elsewhere (personId/id, firstName/surname/otherName flat,
              // clientCode, etc.) - HivstPatientSummaryDto is already flat,
              // no nested `person` object like HTS's response has.
              const _raw = {
                id: row.patientId,
                personId: row.patientId,
                firstName: row.firstName,
                surname: row.surname,
                otherName: row.otherName,
                hospitalNumber: row.hospitalNumber,
                age: row.age,
                gender: row.sex,
                clientCode: row.latestClientCode,
                hivstCount: row.encounterCount,
                resultCount: row.resultCount,
              };

              return {
                fullName: [row.firstName, row.otherName, row.surname]
                  .filter(Boolean)
                  .join(" "),
                hospitalNumber: row.hospitalNumber ?? "-",
                phoneNumber: row.phoneNumber ?? "-",
                sex: row.sex ?? "-",
                age: row.age ?? "-",
                encounterCount: row.encounterCount ?? 0,
                resultCount: row.resultCount ?? 0,
                clientCode: row.latestClientCode ?? "",
                _raw,
              };
            }),
            page: query.page,
            totalCount: response?.data?.totalRecords ?? 0,
          });
        })
        .catch((err) => {
          console.error("Failed to load HIVST patients:", err);
          reject(err);
        });
    });

  const goToDashboard = (rowData) => {
    history.push("/patient-history", {
      patientObject: rowData._raw,
      patientObj: rowData._raw,
      clientCode: rowData._raw.clientCode,
      // Lands directly on the HIVST History tab instead of the default HTS
      // history tab, since this list is specifically about HIVST records.
      activePage: "HIVST HISTORY",
    });
  };

  const columns = [
    {
      title: "Patient Name",
      field: "fullName",
      hidden: !showPII,
      filtering: false,
      render: (row) => <span style={{ fontWeight: 500 }}>{row.fullName || "-"}</span>,
    },
    { title: "Hospital No.", field: "hospitalNumber", filtering: false },
    { title: "Phone Number", field: "phoneNumber", hidden: !showPII, filtering: false },
    { title: "Sex", field: "sex", filtering: false },
    { title: "Age", field: "age", filtering: false },
    {
      title: "HIVST Count",
      field: "encounterCount",
      filtering: false,
      render: (row) => (
        <Label color="blue" size="mini">
          {row.encounterCount}
        </Label>
      ),
    },
    {
      title: "Result Count",
      field: "resultCount",
      filtering: false,
      render: (row) => (
        <Label color={row.resultCount > 0 ? "teal" : "grey"} size="mini">
          {row.resultCount}
        </Label>
      ),
    },
    { title: "Client Code", field: "clientCode", filtering: false },
    {
      title: "Actions",
      field: "actions",
      filtering: false,
      sorting: false,
      render: (rowData) => (
        <ButtonGroup
          variant="contained"
          aria-label="patient dashboard"
          style={{ height: "30px", width: "215px" }}
          size="large"
        >
          <Button
            size="small"
            style={{ backgroundColor: "rgb(153, 46, 98)" }}
            onClick={() => goToDashboard(rowData)}
          >
            <MdDashboard color="#fff" />
          </Button>
          <Button
            style={{ backgroundColor: "rgb(153, 46, 98)" }}
            onClick={() => goToDashboard(rowData)}
          >
            <span style={{ fontSize: "12px", color: "#fff", fontWeight: "bolder" }}>
              Patient Dashboard
            </span>
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="HIVST Patients"
        columns={columns}
        data={fetchData}
        options={{
          headerStyle: { backgroundColor: "#014d88", color: "#fff" },
          searchFieldStyle: { width: "200%", marginLeft: "250px" },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 20,
          debounceInterval: 500,
        }}
        components={{
          Toolbar: (props) => (
            <div>
              <div className="form-check custom-checkbox float-left mt-4 ml-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showPII"
                  checked={showPII}
                  onChange={(e) => setShowPII(e.target.checked)}
                  style={{ border: "1px solid #014D88", borderRadius: "0.25rem" }}
                />
                <label className="form-check-label" htmlFor="showPII">
                  <b style={{ color: "#014d88", fontWeight: "bold" }}>SHOW PII</b>
                </label>
              </div>
              <MTableToolbar {...props} />
            </div>
          ),
        }}
      />
    </div>
  );
};

export default HIVSTPatient;