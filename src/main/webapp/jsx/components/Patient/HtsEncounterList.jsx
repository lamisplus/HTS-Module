import React, { forwardRef, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { Link } from "react-router-dom";
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
import { getAllHtsEncounter } from "../../services/getAllHtsEncounter";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const deduplicateByPerson = (records) => {
  const map = new Map();

  records.forEach((record) => {
    const key = record.personId;
    if (!map.has(key)) {
      map.set(key, { ...record, htsCount: 1 });
    } else {
      map.get(key).htsCount += 1;
    }
  });

  return Array.from(map.values());
};

const HTSEncounterList = () => {
  const [showPII, setShowPII] = useState(false);

  const handleCheckBox = (e) => {
    setShowPII(e.target.checked);
  };

  const fetchData = (query) =>
    new Promise((resolve, reject) => {
      const search = query.search || "*";
      getAllHtsEncounter(search, query.page, query.pageSize)
        .then((data) => {
          const records = data?.records ?? [];
          const deduplicated = deduplicateByPerson(
            records.filter((r) => r.clientCode !== null)
          );

          resolve({
            data: deduplicated.map((row) => ({
              name: `${row.person?.firstName ?? ""} ${row.person?.surname ?? ""}`.trim(),
              clientCode: row.clientCode,
              sex: row.person?.sex ?? row.data?.sex ?? "",
              age: row.data?.age ?? "",
              dateOfVisit: row.dateOfVisit ?? "",
              setting: row.setting ?? "",
              // modality: row.data?.modality ?? "",
              initialHivTest: row.data?.initialHivTest ?? "",
              htsCount: row.htsCount,
              _raw: row,
            })),
            page: query.page,
            totalCount: data?.totalRecords ?? 0,
          });
        })
        .catch((err) => {
          console.error("Failed to load HTS encounters:", err);
          reject(err);
        });
    });

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="HTS Encounters"
        columns={[
          {
            title: "Patient Name",
            field: "name",
            hidden: !showPII,
            filtering: false,
          },
          {
            title: "Client Code",
            field: "clientCode",
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
            title: "Date of Visit",
            field: "dateOfVisit",
            filtering: false,
          },
          {
            title: "Setting",
            field: "setting",
            filtering: false,
          },
          // {
          //   title: "Modality",
          //   field: "modality",
          //   filtering: false,
          // },
          {
            title: "Initial HIV Test",
            field: "initialHivTest",
            filtering: false,
            render: (rowData) => {
              const val = rowData.initialHivTest;
              if (!val) return "";
              const color =
                val.toLowerCase() === "positive"
                  ? "red"
                  : val.toLowerCase() === "negative"
                  ? "green"
                  : "grey";
              return (
                <Label color={color} size="mini">
                  {val}
                </Label>
              );
            },
          },
          {
            title: "HTS Count",
            field: "htsCount",
            filtering: false,
            render: (rowData) => (
              <Label color="blue" size="mini">
                {rowData.htsCount}
              </Label>
            ),
          },
          {
            title: "Actions",
            field: "actions",
            filtering: false,
            sorting: false,
            render: (rowData) => (
              <Link
                to={{
                  pathname: "/patient-history",
                  state: {
                    patientObject: rowData._raw,
                    patientObj: rowData._raw,
                    clientCode: rowData.clientCode,
                  },
                }}
              >
                <ButtonGroup
                  variant="contained"
                  aria-label="patient dashboard"
                  style={{
                    backgroundColor: "rgb(153, 46, 98)",
                    height: "30px",
                    width: "215px",
                  }}
                  size="large"
                >
                  <Button
                    size="small"
                    style={{ backgroundColor: "rgb(153, 46, 98)" }}
                  >
                    <MdDashboard color="#fff" />
                  </Button>
                  <Button style={{ backgroundColor: "rgb(153, 46, 98)" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: "bolder",
                      }}
                    >
                      Patient Dashboard
                    </span>
                  </Button>
                </ButtonGroup>
              </Link>
            ),
          },
        ]}
        data={fetchData}
        options={{
          headerStyle: {
            backgroundColor: "#014d88",
            color: "#fff",
          },
          searchFieldStyle: {
            width: "200%",
            marginLeft: "250px",
          },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 20,
          debounceInterval: 400,
        }}
        components={{
          Toolbar: (props) => (
            <div>
              <div className="form-check custom-checkbox float-left mt-4 ml-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showPII"
                  name="showPII"
                  checked={showPII}
                  onChange={handleCheckBox}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                />
                <label className="form-check-label" htmlFor="showPII">
                  <b style={{ color: "#014d88", fontWeight: "bold" }}>
                    SHOW PII
                  </b>
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