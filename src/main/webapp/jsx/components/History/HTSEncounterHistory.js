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
import axios from "axios";
import { url as baseUrl, token } from "./../../../api";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import { getHtsEcounterForAPatient } from "../../services/getHtsEcounterForAPatient";

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
          <p style={modalTitleStyle}>Delete Encounter</p>
        </div>

        <p style={modalBodyStyle}>
          Are you sure you want to delete the HTS encounter for client{" "}
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

const HTSEncounterHistory = (props) => {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const patientId =
    props.patientObj?.personId ?? props.patientObj?.id ?? null;

  useEffect(() => {
    if (patientId) fetchEncounters();
  }, [patientId]);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const data = await getHtsEcounterForAPatient(patientId);
      setEncounters(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load HTS encounter history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${baseUrl}hts-encounter/${pendingDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(
        `Encounter for client ${pendingDelete.clientCode} deleted successfully.`
      );
      setPendingDelete(null);
      fetchEncounters();
    } catch {
      toast.error("Failed to delete encounter. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAction = (row, actionType) => {
    props.setActivePage({
      ...props.activePage,
      activePage: actionType,
      activeObject: row,
      actionType,
    });
  };

  const resolveHivTestLabel = (result) => {
    if (!result) return <Label size="mini">N/A</Label>;
    const lower = result.toLowerCase();
    const color =
      lower === "positive" ? "red" : lower === "negative" ? "green" : "grey";
    return (
      <Label color={color} size="mini">
        {result}
      </Label>
    );
  };

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
        title="HTS History"
        isLoading={loading}
        columns={[
          { title: "Date of Visit", field: "dateOfVisit", filtering: false },
          { title: "Client Code", field: "clientCode", filtering: false },
          { title: "Setting", field: "setting", filtering: false },
          { title: "Modality", field: "modality", filtering: false },
          {
            title: "Initial HIV Test",
            field: "initialHivTest",
            filtering: false,
            render: (rowData) => resolveHivTestLabel(rowData.initialHivTest),
          },
          {
            title: "Syphilis Result",
            field: "syphilisTestResult",
            filtering: false,
          },
          
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
                        <Dropdown.Item
                          onClick={() => handleAction(rowData._raw, "view")}
                        >
                          <Icon name="eye" /> View
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleAction(rowData._raw, "update")}
                        >
                          <Icon name="edit" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setPendingDelete(rowData._raw)}
                        >
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
        data={encounters.map?.((record) => ({
          dateOfVisit: record.dateOfVisit ?? "",
          clientCode: record.clientCode ?? "",
          setting: record.setting ?? "",
          modality: record.data?.modality ?? "",
          initialHivTest: record.data?.initialHivTest ?? "",
          syphilisTestResult: record.data?.syphilisTestResult ?? "",
          _raw: record,
        }))}
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

export default HTSEncounterHistory;