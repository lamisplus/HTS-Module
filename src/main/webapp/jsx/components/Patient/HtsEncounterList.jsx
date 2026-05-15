import React, { forwardRef, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { Label } from "semantic-ui-react";
import { MdDashboard } from "react-icons/md";
import AddBox          from "@material-ui/icons/AddBox";
import ArrowUpward     from "@material-ui/icons/ArrowUpward";
import Check           from "@material-ui/icons/Check";
import ChevronLeft     from "@material-ui/icons/ChevronLeft";
import ChevronRight    from "@material-ui/icons/ChevronRight";
import Clear           from "@material-ui/icons/Clear";
import DeleteOutline   from "@material-ui/icons/DeleteOutline";
import Edit            from "@material-ui/icons/Edit";
import FilterList      from "@material-ui/icons/FilterList";
import FirstPage       from "@material-ui/icons/FirstPage";
import LastPage        from "@material-ui/icons/LastPage";
import Remove          from "@material-ui/icons/Remove";
import SaveAlt         from "@material-ui/icons/SaveAlt";
import Search          from "@material-ui/icons/Search";
import ViewColumn      from "@material-ui/icons/ViewColumn";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import { getHtsPatients } from "../../services/getHtsPatients.service";

// ── Table icons ───────────────────────────────────────────────────────────────
const tableIcons = {
  Add:          forwardRef((p, r) => <AddBox {...p} ref={r} />),
  Check:        forwardRef((p, r) => <Check {...p} ref={r} />),
  Clear:        forwardRef((p, r) => <Clear {...p} ref={r} />),
  Delete:       forwardRef((p, r) => <DeleteOutline {...p} ref={r} />),
  DetailPanel:  forwardRef((p, r) => <ChevronRight {...p} ref={r} />),
  Edit:         forwardRef((p, r) => <Edit {...p} ref={r} />),
  Export:       forwardRef((p, r) => <SaveAlt {...p} ref={r} />),
  Filter:       forwardRef((p, r) => <FilterList {...p} ref={r} />),
  FirstPage:    forwardRef((p, r) => <FirstPage {...p} ref={r} />),
  LastPage:     forwardRef((p, r) => <LastPage {...p} ref={r} />),
  NextPage:     forwardRef((p, r) => <ChevronRight {...p} ref={r} />),
  PreviousPage: forwardRef((p, r) => <ChevronLeft {...p} ref={r} />),
  ResetSearch:  forwardRef((p, r) => <Clear {...p} ref={r} />),
  Search:       forwardRef((p, r) => <Search {...p} ref={r} />),
  SortArrow:    forwardRef((p, r) => <ArrowUpward {...p} ref={r} />),
  ThirdStateCheck: forwardRef((p, r) => <Remove {...p} ref={r} />),
  ViewColumn:   forwardRef((p, r) => <ViewColumn {...p} ref={r} />),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract phone number from nested contactPoint JSONB */
const extractPhone = (person) => {
  const arr = person?.contactPoint?.contactPoint ?? [];
  const entry = arr.find((cp) => cp?.type === "phone") ?? arr[0];
  return entry?.value ?? "—";
};

/** Extract hospital number from nested identifier JSONB */
const extractHospitalNumber = (person) => {
  const arr = person?.identifier?.identifier ?? [];
  const entry = arr.find((id) => id?.type === "HospitalNumber") ?? arr[0];
  return entry?.value ?? "—";
};

/** Compute age from dateOfBirth string */
const computeAge = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : "—";
};

// ── Component ─────────────────────────────────────────────────────────────────
const HTSEncounterList = () => {
  const history  = useHistory();
  const [showPII, setShowPII] = useState(false);

  // ── Server-side data fetcher for MaterialTable ────────────────────────────
  const fetchData = (query) =>
    new Promise((resolve, reject) => {
      const search = query.search?.trim() || "*";

      getHtsPatients(search, query.page, query.pageSize)
        .then((data) => {
          const records = data?.records ?? [];

          resolve({
            data: records.map((row) => {
              const p = row.person ?? {};

              // Build the route state object that matches exactly what the
              // existing HTSEncounterList pushes, so PatientDetail /
              // PatientHistory / PatientCardDetail keep working unchanged.
              //
              // The new API returns one row per patient with:
              //   row.personId, row.person (full PersonResponseDto),
              //   row.clientCode, row.htsCount, row.ictCount, etc.
              //
              // We shape _raw to look like the old HtsEncounterResponse so
              // that all consumers that read patientObj.person.id,
              // patientObj.personId, patientObj.clientCode etc. still work.
              const _raw = {
                // Fields read directly by PatientDetail / PatientHistory
                id:         row.id,
                uuid:       row.uuid,
                personId:   row.personId,
                person:     row.person,       // full PersonResponseDto
                clientCode: row.clientCode,
                dateOfVisit: row.dateOfVisit,
                setting:    row.setting,
                observation: row.observation, // most-recent encounter observation
                facilityId: row.facilityId,
                htsCount:   row.htsCount,
                ictCount:   row.ictCount,
                // data alias — some older consumers read .data instead of .observation
                data: row.observation,
              };

              return {
                // ── Display columns ───────────────────────────────────────
                fullName: [p.firstName, p.otherName, p.surname]
                  .filter(Boolean).join(" "),
                hospitalNumber: extractHospitalNumber(p),
                phoneNumber:    extractPhone(p),
                sex:            p.sex ?? p.gender?.display ?? "—",
                age:            computeAge(row.observation?.dateOfBirth ?? p.dateOfBirth),
                htsCount:       row.htsCount ?? 0,
                ictCount:       row.ictCount ?? 0,
                // ── Raw record for route state ─────────────────────────
                _raw,
              };
            }),
            page:       query.page,
            totalCount: data?.totalRecords ?? 0,
          });
        })
        .catch((err) => {
          console.error("Failed to load HTS patients:", err);
          reject(err);
        });
    });

  // ── Navigate to patient dashboard ─────────────────────────────────────────
  const goToDashboard = (rowData) => {
    history.push("/patient-history", {
      patientObject: rowData._raw,
      patientObj:    rowData._raw,
      clientCode:    rowData._raw.clientCode,
    });
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Patient Name",
      field: "fullName",
      hidden: !showPII,
      filtering: false,
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{row.fullName || "—"}</span>
      ),
    },
    {
      title: "Hospital No.",
      field: "hospitalNumber",
      filtering: false,
    },
    {
      title: "Phone Number",
      field: "phoneNumber",
      hidden: !showPII,
      filtering: false,
    },
    {
      title: "Sex",
      field: "sex",
      filtering: false,
    },
    {
      title: "Age",
      field: "age",
      filtering: false,
    },
    {
      title: "HTS Count",
      field: "htsCount",
      filtering: false,
      render: (row) => (
        <Label color="blue" size="mini">{row.htsCount}</Label>
      ),
    },
    {
      title: "ICT Count",
      field: "ictCount",
      filtering: false,
      render: (row) => (
        <Label color={row.ictCount > 0 ? "teal" : "grey"} size="mini">
          {row.ictCount}
        </Label>
      ),
    },
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="HTS Patients"
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

export default HTSEncounterList;