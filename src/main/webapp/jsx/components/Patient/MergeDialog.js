import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { token } from "./../../../api";
import { toast } from "react-toastify";
import Moment from "moment";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: "800px",
    maxHeight: "600px",
  },
  masterRow: {
    backgroundColor: "#e8f5e9",
    fontWeight: "bold",
  },
  duplicateRow: {
    backgroundColor: "#fff3e0",
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  warningText: {
    color: "#d32f2f",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  infoText: {
    color: "#1976d2",
    marginBottom: theme.spacing(2),
  },
}));

const MergeDialog = ({ open, onClose, onMerge, duplicateGroup, mergeEndpoint, isHtsPatient }) => {
  const classes = useStyles();
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (duplicateGroup && duplicateGroup.length > 0) {
      // Find the suggested master
      const suggestedMaster = duplicateGroup.find(
        (record) => record.isSuggestedMaster
      );
      if (suggestedMaster) {
        // For HTS patient merges we use htsClientId; for person duplicates we use personId
        const masterId = isHtsPatient ? suggestedMaster.htsClientId : suggestedMaster.personId;
        setSelectedMaster(masterId);
      } else {
        // Default to first record if no suggested master
        const masterFallbackId = isHtsPatient ? duplicateGroup[0].htsClientId : duplicateGroup[0].personId;
        setSelectedMaster(masterFallbackId);
      }
    }
  }, [duplicateGroup, isHtsPatient]);

  const handleMasterChange = (event) => {
    setSelectedMaster(Number(event.target.value));
  };

  const handleMerge = async () => {
    if (!selectedMaster) {
      toast.error("Please select a master record");
      return;
    }


    const idField = isHtsPatient ? 'htsClientId' : 'personId';

    const duplicateIds = duplicateGroup
      .filter((record) => record[idField] !== selectedMaster)
      .map((record) => record[idField]);

    if (duplicateIds.length === 0) {
      toast.error("No duplicate records to merge");
      return;
    }

    setLoading(true);

    try {


      const response = await axios.post(
        mergeEndpoint,
        {
          masterPersonId: selectedMaster,
          duplicatePersonIds: duplicateIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success(
          response.data.message ||
            `Successfully merged ${response.data.archivedCount} duplicate(s)`
        );
        onMerge();
      }
    } catch (error) {
      console.error("Error merging duplicates:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to merge duplicate records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!duplicateGroup || duplicateGroup.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Merge Duplicate Records
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body2" className={classes.infoText}>
          Select the master record to keep. All other records will be archived.
          {isHtsPatient && " (Records with ART commencement are prioritized)"}
        </Typography>

        <FormControl component="fieldset" style={{ width: "100%" }}>
          <RadioGroup value={selectedMaster} onChange={handleMasterChange}>
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Select Master</TableCell>
                    <TableCell>Hospital Number</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>HTS Reg Date</TableCell>
                    <TableCell>HIV Enrolled</TableCell>
                    <TableCell>On ART</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {duplicateGroup.map((record) => {
                    const currentId = isHtsPatient ? record.htsClientId : record.personId;
                    const isMaster = currentId === selectedMaster;
                    return (
                      <TableRow
                        key={currentId}
                        className={
                          isMaster ? classes.masterRow : classes.duplicateRow
                        }
                      >
                        <TableCell>
                          <FormControlLabel
                            value={currentId}
                            control={<Radio color="primary" />}
                            label=""
                          />
                        </TableCell>
                        <TableCell>{record.hospitalNumber}</TableCell>
                        <TableCell>
                          {record.firstName} {record.surname}
                          {record.otherName && ` ${record.otherName}`}
                        </TableCell>
                        <TableCell>
                          {record.dateOfBirth
                            ? Moment(record.dateOfBirth).format("DD-MM-YYYY")
                            : "N/A"}
                        </TableCell>
                        <TableCell>{record.age}</TableCell>
                        <TableCell>{record.gender}</TableCell>
                        <TableCell>{record.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          {record.dateOfRegistration
                            ? Moment(record.dateOfRegistration).format(
                                "DD-MM-YYYY"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.htsRegistrationDate
                            ? Moment(record.htsRegistrationDate).format(
                                "DD-MM-YYYY"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {record.inHivEnrollment === "Yes" ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                              ✓ Yes
                            </span>
                          ) : (
                            <span style={{ color: "gray" }}>No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.hasArtCommencement === "Yes" || record.hasArtCommencement === 1 ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                              ✓ Yes
                            </span>
                          ) : (
                            <span style={{ color: "gray" }}>No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isMaster ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                              MASTER
                            </span>
                          ) : (
                            <span style={{ color: "orange" }}>
                              Will be archived
                            </span>
                          )}
                          {record.isSuggestedMaster && !isMaster && (
                            <span
                              style={{
                                fontSize: "10px",
                                display: "block",
                                color: "#666",
                              }}
                            >
                              (Suggested Master)
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </RadioGroup>
        </FormControl>

        <Typography variant="body2" className={classes.warningText}>
          <strong>Warning:</strong> This action will archive{" "}
          {duplicateGroup.length - 1} duplicate record(s).
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleMerge}
          color="primary"
          variant="contained"
          disabled={loading || !selectedMaster}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Merging..." : "Confirm Merge"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeDialog;

MergeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMerge: PropTypes.func.isRequired,
  duplicateGroup: PropTypes.arrayOf(
    PropTypes.shape({
      personId: PropTypes.number,
      htsClientId: PropTypes.number,
      isSuggestedMaster: PropTypes.bool,
    })
  ).isRequired,
  mergeEndpoint: PropTypes.string,
  isHtsPatient: PropTypes.bool,
};
