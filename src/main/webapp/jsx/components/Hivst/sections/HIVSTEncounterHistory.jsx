import React, { forwardRef, useEffect, useState } from "react";
import MaterialTable from "material-table";
import { toast } from "react-toastify";
import { Dropdown, Button, Menu, Icon, Label } from "semantic-ui-react";
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
import {
  getHivstEncountersForPatient,
  archiveHivstEncounter,
} from "../../../services/hivst.service";
import HIVSTEncounterForm from "./HIVSTEncounterForm";

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

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "32px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const modalTitleStyle = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#24292f",
  margin: 0,
};

const modalBodyStyle = {
  fontSize: "14px",
  color: "#57606a",
  margin: 0,
  lineHeight: 1.6,
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "8px",
};

const DeleteConfirmModal = ({ record, onConfirm, onCancel, deleting }) => {
  if (!record) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#fde8e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="trash alternate" style={{ color: "#d32f2f", margin: 0 }} />
          </div>
          <p style={modalTitleStyle}>Delete HIVST Encounter</p>
        </div>

        <p style={modalBodyStyle}>
          Are you sure you want to delete the HIVST encounter for client{" "}
          <strong>{record.clientCode}</strong> visited on{" "}
          <strong>{record.dateOfVisit}</strong>? This action cannot be undone.
        </p>

        <div style={modalFooterStyle}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "1px solid #d0d7de",
              backgroundColor: "#fff",
              color: "#24292f",
              fontSize: "14px",
              fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#d32f2f",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {deleting && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Generic "SOME_CODESET_VALUE" -> "Value" formatter. Optionally strips a
// known codeset prefix first (e.g. "HIVST_KIT_USER_SELF" -> "Self").
const humanizeCode = (code, stripPrefix) => {
  if (!code || typeof code !== "string") return "N/A";
  let str = code;
  if (stripPrefix && str.startsWith(stripPrefix)) {
    str = str.slice(stripPrefix.length).replace(/^_+/, "");
  }
  if (!str) return "N/A";
  return str
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
};

const formatYesNo = (code) => {
  if (!code) return "N/A";
  if (code.endsWith("_YES")) return <Label color="green" size="mini">Yes</Label>;
  if (code.endsWith("_NO")) return <Label color="red" size="mini">No</Label>;
  return code;
};

// ─── View modes ─────────────────────────────────────────────────────────────
// Self-contained: no dependency on an external activePage router. The
// component swaps between the table and <HIVSTEncounterForm/> internally.
const VIEW = { LIST: "LIST", FORM: "FORM" };

const HIVSTEncounterHistory = (props) => {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState({ mode: VIEW.LIST });

  const patientId = props.patientObj?.personId ?? props.patientObj?.id ?? null;

  useEffect(() => {
    if (patientId) fetchEncounters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, props.refreshKey]);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const data = await getHivstEncountersForPatient(patientId);
      setEncounters(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load HIVST encounter history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await archiveHivstEncounter(pendingDelete.id);
      toast.success(`HIVST encounter for client ${pendingDelete.clientCode} deleted successfully.`);
      setPendingDelete(null);
      fetchEncounters();
      props?.onEncounterMutated?.();
    } catch {
      toast.error("Failed to delete encounter. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const openForm = (row, formMode) => {
    setView({ mode: VIEW.FORM, formMode, encounterId: row?.id ?? row?.encounterId });
  };

  const backToList = () => {
    setView({ mode: VIEW.LIST });
    fetchEncounters();
  };

  const handleFormSuccess = () => {
    props?.onEncounterMutated?.();
    backToList();
  };

  if (view.mode === VIEW.FORM) {
    return (
      <HIVSTEncounterForm
        patientObj={props.patientObj}
        existingEncounterId={view.encounterId}
        readOnly={view.formMode === "view"}
        onBack={backToList}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <>
      <DeleteConfirmModal
        record={pendingDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
        deleting={deleting}
      />

      <MaterialTable
        icons={tableIcons}
        title="HIVST History"
        isLoading={loading}
        columns={[
          { title: "Date of Visit", field: "dateOfVisit", filtering: false },
          { title: "Client Code", field: "clientCode", filtering: false },
          {
            title: "Setting",
            field: "setting",
            filtering: false,
            render: (rowData) => humanizeCode(rowData.setting, "HTS_ENTRY_POINT"),
          },
          {
            title: "HIVST Kits Provided",
            field: "hivTestKitsProvided",
            filtering: false,
            render: (rowData) => formatYesNo(rowData.hivTestKitsProvided),
          },
          {
            title: "Category of Client",
            field: "categoryOfClients",
            filtering: false,
            render: (rowData) => humanizeCode(rowData.categoryOfClients, "HIVST_KIT_USER"),
          },
          { title: "No. of Kits", field: "numberOfHivstKitDistributed", filtering: false },
          { title: "Completed By", field: "completedBy", filtering: false },
          { title: "Designation", field: "designation", filtering: false },
          {
            title: "Actions",
            field: "actions",
            filtering: false,
            sorting: false,
            render: (rowData) => (
              <Menu.Menu position="right">
                <Menu.Item>
                  <Button
                    style={{ backgroundColor: "rgb(153,46,98)" }}
                    primary
                    onClick={(e) => e.preventDefault()}
                  >
                    <Dropdown item text="Action">
                      <Dropdown.Menu style={{ marginTop: "10px" }}>
                        <Dropdown.Item onClick={() => openForm(rowData._raw, "view")}>
                          <Icon name="eye" /> View
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => openForm(rowData._raw, "edit")}>
                          <Icon name="edit" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setPendingDelete(rowData._raw)}>
                          <Icon name="delete" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Button>
                </Menu.Item>
              </Menu.Menu>
            ),
          },
        ]}
        data={(encounters || []).map((record) => {
          const obs = record.observation || {};
          return {
            id: record.id ?? record.encounterId,
            dateOfVisit: record.dateOfVisit ?? "",
            clientCode: record.clientCode ?? "",
            setting: record.setting ?? "",
            hivTestKitsProvided: obs.hivTestKitsProvided ?? "",
            categoryOfClients: obs.categoryOfClients ?? "",
            numberOfHivstKitDistributed: obs.numberOfHivstKitDistributed ?? "",
            completedBy: obs.completedBy ?? "",
            designation: obs.designation ?? "",
            _raw: record,
          };
        })}
        actions={[
          {
            icon: () => <AddBox />,
            tooltip: "New HIVST Encounter",
            isFreeAction: true,
            onClick: () => setView({ mode: VIEW.FORM, formMode: "create", encounterId: undefined }),
          },
        ]}
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
          pageSize: 10,
          debounceInterval: 400,
        }}
      />
    </>
  );
};

export default HIVSTEncounterHistory;