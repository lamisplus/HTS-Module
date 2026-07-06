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

// ========================
// CODE SET MAPPINGS
// ========================

// --- HIV test result mapping ---
const HIV_RESULT_MAP = {
  // STI_HIV_RESULT
  "STI_HIV_RESULT_POSITIVE": { display: "Positive", color: "red" },
  "STI_HIV_RESULT_NEGATIVE": { display: "Negative", color: "green" },

  "Positive": { display: "Positive", color: "red" },
  "Negative": { display: "Negative", color: "red" },

  "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE": { display: "Positive", color: "red" },
  "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE": { display: "Negative", color: "green" },
  // HIV_TEST_RESULT
  "HIV_TEST_RESULT_POSITIVE": { display: "Positive", color: "red" },
  "HIV_TEST_RESULT_NEGATIVE": { display: "Negative", color: "green" },
  "HIV_TEST_RESULT_EARLY_DETECT": { display: "Early detect", color: "grey" },
  "HIV_TEST_RESULT_NOT_DONE": { display: "Not done", color: "grey" },
  // TEST_RESULT_COMMON
  "TEST_RESULT_COMMON_POSITIVE": { display: "Positive", color: "red" },
  "TEST_RESULT_COMMON_NEGATIVE": { display: "Negative", color: "green" },
  "TEST_RESULT_COMMON_INDETERMINATE": { display: "Indeterminate", color: "grey" },
};

// --- Syphilis result mapping ---
const SYPHILIS_RESULT_MAP = {
  "SYPHILIS_RESULT_POSITIVE": { display: "Positive", color: "red" },
  "SYPHILIS_RESULT_NEGATIVE": { display: "Negative", color: "green" },
  "SYPHILIS_RESULT_NOT_DONE": { display: "Not Done", color: "grey" },
  "SYPHILIS_RESULT_OTHERS": { display: "Others", color: "grey" },
};

// --- Setting mapping (combining all possible testing setting codes) ---
// Based on the provided JSON:
// COMMUNITY_HTS_TEST_SETTING, FACILITY_HTS_TEST_SETTING, ENROLLMENT_SETTING,
// HTS_ENTRY_POINT, and TEST_SETTING (empty).
const SETTING_MAP = {
  // COMMUNITY_HTS_TEST_SETTING
  "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING": "Congregational setting",
  "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE": "Antigen Reactive",
  "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE": "Antigen + Antibody Reactive",
  "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE": "Antibody Reactive",
  "COMMUNITY_HTS_TEST_SETTING_CT": "CT",
  "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT": "Early Detect",
  "TYPE_OF_HIV_TEST_RAPID_ANTIBODY": "Rapid Antibody",
  "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES": "Delivery homes",
  "COMMUNITY_HTS_TEST_SETTING_INDEX": "Index",
  "COMMUNITY_HTS_TEST_SETTING_OTHERS": "Others",
  "COMMUNITY_HTS_TEST_SETTING_OUTREACH": "Outreach",
  "COMMUNITY_HTS_TEST_SETTING_OVC": "OVC",
  "COMMUNITY_HTS_TEST_SETTING_SNS": "SNS",
  "COMMUNITY_HTS_TEST_SETTING_STANDALONE_HTS": "Standalone HTS",
  "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX": "TBA Orthodox",
  "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW": "TBA rt-HCW",
  // FACILITY_HTS_TEST_SETTING
  "FACILITY_HTS_TEST_SETTING_ANC": "ANC",
  "FACILITY_HTS_TEST_SETTING_BLOOD_BANK": "Blood Bank",
  "FACILITY_HTS_TEST_SETTING_CT": "CT",
  "FACILITY_HTS_TEST_SETTING_EMERGENCY": "Emergency",
  "FACILITY_HTS_TEST_SETTING_INDEX": "Index",
  "FACILITY_HTS_TEST_SETTING_L&D": "L&D",
  "FACILITY_HTS_TEST_SETTING_MALNUTRITION": "Malnutrition",
  "FACILITY_HTS_TEST_SETTING_OTHERS": "Others",
  "FACILITY_HTS_TEST_SETTING_PEDIATRIC": "Pediatric",
  "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING": "Post Natal Ward/Breastfeeding",
  "FACILITY_HTS_TEST_SETTING_PREP_TESTING": "PrEP Testing",
  "FACILITY_HTS_TEST_SETTING_RETESTING": "Retesting",
  "FACILITY_HTS_TEST_SETTING_SNS": "SNS",
  "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY": "Spoke health facility",
  "FACILITY_HTS_TEST_SETTING_STANDALONE_HTS": "Standalone HTS",
  "FACILITY_HTS_TEST_SETTING_STI": "STI",
  "FACILITY_HTS_TEST_SETTING_TB": "TB",
  "FACILITY_HTS_TEST_SETTING_WARD_INPATIENT": "Ward/Inpatient",
  // ENROLLMENT_SETTING
  "ENROLLMENT_SETTING_COMMUNITY": "Community",
  "ENROLLMENT_SETTING_FACILITY": "Facility",
  // HTS_ENTRY_POINT
  "HTS_ENTRY_POINT_COMMUNITY": "Community",

  "HTS_ENTRY_POINT_FACILITY": "Facility",
  "HTS_ENTRY_POINT_OTHERS": "Others",

  "YES_NO_YES": "Yes",
  "YES_NO_NO": "No",
};

/**
 * Convert a result code to { display, color }
 * @param {string} code - Raw code from API
 * @param {object} customMap - Specific mapping object for this result type
 * @returns {{ display: string, color: string }}
 */
const mapResultCode = (code, customMap) => {
  if (!code || typeof code !== "string") {
    return { display: "N/A", color: "grey" };
  }
  if (customMap && customMap[code]) {
    return customMap[code];
  }
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes("positive") || lowerCode.includes("reactive")) {
    return { display: code, color: "red" };
  }
  if (lowerCode.includes("negative") || lowerCode.includes("non-reactive")) {
    return { display: code, color: "green" };
  }
  if (lowerCode.includes("suspected")) {
    return { display: code, color: "orange" };
  }
  return { display: code, color: "grey" };
};

const formatHivResult = (rawCode) => {
  const { display, color } = mapResultCode(rawCode, HIV_RESULT_MAP);
  return <Label color={color} size="mini">{display}</Label>;
};

const formatPmtct = (rawCode) => {
  if (rawCode?.pmtctHts === true) {
    return <span>TRUE</span>
  }
  return <span>FALSE</span>;
};


const formatSyphilisResult = (rawCode) => {
  const { display, color } = mapResultCode(rawCode, SYPHILIS_RESULT_MAP);
  return <Label color={color} size="mini">{display}</Label>;
};

// Format setting: return display text or fallback to original code
const formatSetting = (rawSetting) => {
  if (!rawSetting || typeof rawSetting !== "string") return "N/A";
  return SETTING_MAP[rawSetting] || rawSetting;
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
  }, [patientId, props.refreshKey]);


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
      toast.success(`Encounter for client ${pendingDelete.clientCode} deleted successfully.`);
      setPendingDelete(null);
      fetchEncounters();
      props?.onEncounterMutated?.();
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
          {
            title: "Setting",
            field: "setting",
            filtering: false,
            render: (rowData) => formatSetting(rowData.setting),
          },
          {
            title: "Type of HIV Test Done",
            field: "typeOfHivTestDone",
            filtering: false,
            render: (rowData) => formatSetting(rowData?.typeOfHivTestDone),
          },
          {
            title: "HIV Early Detect Result",
            field: "hivEarlyDetectResult",
            filtering: false,
            render: (rowData) => formatSetting(rowData?.hivEarlyDetectResult),
          },
          {
            title: "Initial HIV Test",
            field: "initialHivTest",
            filtering: false,
            render: (rowData) => formatHivResult(rowData?.initialHivTest),
          },
          {
            title: "Confirmatory HIV Test",
            field: "confirmatoryHivTest",
            filtering: false,
            render: (rowData) => formatHivResult(rowData?.confirmatoryHivTest),
          },
          {
            title: "Final HIV Test",
            field: "finalHivTestResult",
            filtering: false,
            render: (rowData) => formatHivResult(rowData?.finalHivTestResult),
          },
          {
            title: "PMTCT-HTS record",
            field: "pmtctHts",
            filtering: false,
            render: (rowData) => formatPmtct(rowData),
          },
          {
            title: "Suspected Acute Infection",
            field: "suspectedAcuteInfection",
            filtering: false,
            render: (rowData) => formatSetting(rowData?.suspectedAcuteInfection),
          },
          {
            title: "Syphilis Result",
            field: "syphilisTestResult",
            filtering: false,
            render: (rowData) => formatSyphilisResult(rowData.syphilisTestResult),
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
          initialHivTest: record.observation?.initialHivTest ?? "",
          confirmatoryHivTest: record.observation?.confirmatoryHivTest ?? "",
          finalHivTestResult: record.observation?.finalHivTestResult ?? "",
          syphilisTestResult: record.observation?.syphilisTestResult ?? "",
          suspectedAcuteInfection: record.observation?.suspectedAcuteInfection ?? "",
          hivEarlyDetectResult: record.observation?.hivEarlyDetectResult ?? "",
          typeOfHivTestDone: record.observation?.typeOfHivTestDone ?? "",
          pmtctHts: record?.pmtctHts ?? "",
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