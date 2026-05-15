import React, { useState, useEffect } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import axios from "axios";
import { token, url as baseUrl } from "./../../../api";
import { forwardRef } from "react";
import { Link } from "react-router-dom";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Card, CardContent } from "@material-ui/core";
import MergeDialog from "./MergeDialog";
import Moment from "moment";

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

const useStyles = makeStyles((theme) => ({
  card: {
    margin: 0,
    boxShadow: "none",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

const DuplicateHTSPatientList = (props) => {
  const classes = useStyles();
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [tableKey, setTableKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const groupDuplicates = (data) => {
    const groups = {};
    data.forEach((record) => {
      const htsIds = record.duplicateHtsIds
        ? record.duplicateHtsIds.split(',').map(id => parseInt(id.trim())).sort()
        : [record.htsClientId];
      const groupKey = htsIds.join("-");
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });
    return groups;
  };

  const handleMergeClick = (group) => {
    setSelectedGroup(group);
    setMergeDialogOpen(true);
  };

  const handleMergeSuccess = () => {
    setMergeDialogOpen(false);
    setSelectedGroup([]);
    // Force table refresh by updating key
    setTableKey((prev) => prev + 1);
  };

  const handleMergeCancel = () => {
    setMergeDialogOpen(false);
    setSelectedGroup([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}hts/duplicates/hts-patients?searchValue=*`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const records = response.data || [];

        const groups = groupDuplicates(records);


        const transformedData = [];
        Object.values(groups).forEach((group) => {
          // Add group members
          group.forEach((record, index) => {
            transformedData.push({
              ...record,
              name: `${record.firstName} ${record.surname}`,
              isGroupAction: index === 0, // Only first row shows merge button
              group: group,
            });
          });
        });


        setData(transformedData);
      } catch (error) {
        console.error("Error fetching HTS patient duplicates:", error);
        toast.error("Failed to fetch duplicate HTS patient records");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tableKey]);

  return (
    <div>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              <Link to={"/"}>HTS /</Link> Duplicate HTS Patient Records 
            </h4>
          </li>
        </ol>
      </div>
      <Card className={classes.card}>
        <CardContent>
          <MaterialTable
            key={tableKey}
            icons={tableIcons}
            title=""
            columns={[
              {
                title: "Hospital Number",
                field: "hospitalNumber",
                filtering: false,
              },
              {
                title: "Patient Name",
                field: "name",
                filtering: false,
              },
              {
                title: "Date of Birth",
                field: "dateOfBirth",
                filtering: false,
                render: (rowData) =>
                  rowData.dateOfBirth
                    ? Moment(rowData.dateOfBirth).format("DD-MM-YYYY")
                    : "",
              },
              { title: "Age", field: "age", filtering: false },
              { title: "Gender", field: "gender", filtering: false },
              { title: "Phone Number", field: "phoneNumber", filtering: false },
              {
                title: "On ART",
                field: "hasArtCommencement",
                filtering: false,
                render: (rowData) =>
                  rowData.hasArtCommencement === 'Yes' ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Yes
                    </span>
                  ) : (
                    <span style={{ color: "gray" }}>No</span>
                  ),
              },
              {
                title: "Duplicate Count",
                field: "duplicateCount",
                filtering: false,
              },
              {
                title: "Suggested",
                field: "isSuggestedMaster",
                filtering: false,
                render: (rowData) =>
                  rowData.isSuggestedMaster ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Master
                    </span>
                  ) : (
                    <span style={{ color: "gray" }}>Duplicate</span>
                  ),
              },
              {
                title: "Action",
                field: "actions",
                filtering: false,
                render: (rowData) => {
                  if (rowData.isGroupAction) {
                    return (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleMergeClick(rowData.group)}
                        style={{ backgroundColor: "#014d88" }}
                      >
                        Merge Group
                      </Button>
                    );
                  }
                  return null;
                },
              },
            ]}
            isLoading={isLoading}
            data={data}
            options={{
              headerStyle: {
                backgroundColor: "#014d88",
                color: "#fff",
              },
              searchFieldStyle: {
                width: "200%",
              },
              filtering: false,
              exportButton: true,
              searchFieldAlignment: "left",
              search: true,
              paging: true,
              pageSizeOptions: [10, 20, 50, 100],
              pageSize: 20,
              rowStyle: (rowData) => ({
                fontWeight: rowData.isSuggestedMaster ? "bold" : "normal",
              }),
            }}
            components={{
              Toolbar: (props) => (
                <div>
                  <MTableToolbar {...props} />
                  <div style={{ padding: "0px 10px" }}>
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      <strong>Note:</strong> This shows HTS patients with duplicate records.
                      Records marked as "Master" are suggested to be kept (prioritizing patients on ART).
                      Click "Merge Group" to archive duplicates.
                    </p>
                  </div>
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>

      <MergeDialog
        open={mergeDialogOpen}
        onClose={handleMergeCancel}
        onMerge={handleMergeSuccess}
        duplicateGroup={selectedGroup}
        mergeEndpoint={`${baseUrl}hts/duplicates/hts-patients/merge`}
        isHtsPatient={true}
      />
    </div>
  );
};

export default DuplicateHTSPatientList;
