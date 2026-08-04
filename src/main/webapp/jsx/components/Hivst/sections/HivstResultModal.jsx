import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Label } from "semantic-ui-react";
import {
  getHivstResultByEncounter,
  createHivstResult,
  updateHivstResult,
  archiveHivstResult,
} from "../../../services/hivst.service";

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
  padding: "28px",
  width: "100%",
  maxWidth: "460px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#24292f",
  margin: 0,
};

const subtitleStyle = {
  fontSize: "13px",
  color: "#57606a",
  margin: 0,
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#24292f",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #d0d7de",
  fontSize: "14px",
  boxSizing: "border-box",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f6f8fa",
  color: "#8c959f",
  cursor: "not-allowed",
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "4px",
};

const btnGroupStyle = { display: "flex", gap: "10px" };

const centerNote = {
  padding: "30px 0",
  textAlign: "center",
  color: "#57606a",
  fontSize: "14px",
};

/**
 * @param {number} encounterId          The HIVST encounter this result belongs to.
 * @param {number} numberOfKits         numberOfHivstKitDistributed on that encounter — used for
 *                                       display + client-side validation before hitting the API.
 * @param {string} [clientCode]         For display in the modal header only.
 * @param {Function} onClose            Called to dismiss the modal without saving.
 * @param {Function} onSaved            Called after a successful create/update/delete — parent
 *                                       should close the modal and refresh its list.
 */
const HivstResultModal = ({ encounterId, numberOfKits, clientCode, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingResult, setExistingResult] = useState(null);
  const [reactiveGt15, setReactiveGt15] = useState("");
  const [reactiveLe15, setReactiveLe15] = useState("");
  const [forceEdit, setForceEdit] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // ---- Sanitisation helper (same as in HIVSTPostTestCounsellingSection) ----
  const sanitiseNumber = (value) => {
    const digitsOnly = String(value).replace(/\D/g, "");
    if (digitsOnly === "") return "";
    const num = parseInt(digitsOnly, 10);
    if (isNaN(num) || num < 0) return "0";
    return String(num);
  };

  // ---- Handlers for reactive fields ----
  const handleReactiveChange = (setter) => (e) => {
    const raw = e.target.value;
    const sanitised = sanitiseNumber(raw);
    setter(sanitised === "" ? "" : sanitised);
  };

  const handleReactivePaste = (setter) => (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const sanitised = sanitiseNumber(pasted);
    setter(sanitised === "" ? "" : sanitised);
  };

  const handleKeyDown = (e) => {
    if (["-", "e", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  // ----------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getHivstResultByEncounter(encounterId)
      .then((data) => {
        if (!isMounted) return;
        setExistingResult(data);
        setReactiveGt15(data?.reactiveGt15 != null ? String(data.reactiveGt15) : "");
        setReactiveLe15(data?.reactiveLe15 != null ? String(data.reactiveLe15) : "");
      })
      .catch(() => {
        // No result yet for this encounter (404) — stay in create mode.
        if (isMounted) setExistingResult(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [encounterId]);

  const isCreate = !existingResult;
  const effectiveReadOnly = !isCreate && !forceEdit;

  const totalReactive = (Number(reactiveGt15) || 0) + (Number(reactiveLe15) || 0);
  const kitsAvailable = numberOfKits != null ? Number(numberOfKits) : null;
  const exceedsKits = kitsAvailable != null && totalReactive > kitsAvailable;

  const handleSave = async () => {
    if (reactiveGt15 === "" || reactiveLe15 === "") {
      toast.error("Please enter both reactive counts.");
      return;
    }
    if (Number(reactiveGt15) < 0 || Number(reactiveLe15) < 0) {
      toast.error("Reactive counts cannot be negative.");
      return;
    }
    if (exceedsKits) {
      toast.error(
        `Total reactive results (${totalReactive}) cannot exceed the number of kits distributed (${kitsAvailable}).`
      );
      return;
    }

    const payload = {
      encounterId,
      reactiveGt15: Number(reactiveGt15),
      reactiveLe15: Number(reactiveLe15),
    };

    try {
      setSaving(true);
      if (isCreate) {
        await createHivstResult(payload);
        toast.success("HIVST result recorded successfully");
      } else {
        await updateHivstResult(existingResult.id, payload);
        toast.success("HIVST result updated successfully");
      }
      onSaved?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save HIVST result";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await archiveHivstResult(existingResult.id);
      toast.success("HIVST result deleted successfully");
      onSaved?.();
    } catch {
      toast.error("Failed to delete HIVST result");
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div>
          <p style={titleStyle}>
            {isCreate ? "Enter HIVST Result" : effectiveReadOnly ? "HIVST Result" : "Edit HIVST Result"}
          </p>
          {clientCode && <p style={subtitleStyle}>Client Code: {clientCode}</p>}
        </div>

        {loading ? (
          <div style={centerNote}>Loading…</div>
        ) : confirmingDelete ? (
          <>
            <p style={{ fontSize: "14px", color: "#57606a", lineHeight: 1.6, margin: 0 }}>
              Are you sure you want to delete this HIVST result? This action cannot be undone.
            </p>
            <div style={footerStyle}>
              <Button basic onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button color="red" loading={deleting} disabled={deleting} onClick={handleDelete}>
                Yes, Delete
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label color={kitsAvailable ? "blue" : "grey"} size="small">
                Kits Distributed: {kitsAvailable ?? "N/A"}
              </Label>
            </div>

            <div>
              <label style={labelStyle}>Reactive — Age greater than 15</label>
              <input
                type="number"
                min="0"
                step="1"
                value={reactiveGt15}
                disabled={effectiveReadOnly}
                onChange={handleReactiveChange(setReactiveGt15)}
                onPaste={handleReactivePaste(setReactiveGt15)}
                onKeyDown={handleKeyDown}
                style={effectiveReadOnly ? disabledInputStyle : inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Reactive — Age 15 and below</label>
              <input
                type="number"
                min="0"
                step="1"
                value={reactiveLe15}
                disabled={effectiveReadOnly}
                onChange={handleReactiveChange(setReactiveLe15)}
                onPaste={handleReactivePaste(setReactiveLe15)}
                onKeyDown={handleKeyDown}
                style={effectiveReadOnly ? disabledInputStyle : inputStyle}
              />
            </div>

            {!effectiveReadOnly && exceedsKits && (
              <div style={{ color: "#f85032", fontSize: "12.8px" }}>
                Total reactive results ({totalReactive}) cannot exceed kits distributed ({kitsAvailable}).
              </div>
            )}

            <div style={footerStyle}>
              <div>
                {!isCreate && effectiveReadOnly && (
                  <Button basic color="orange" onClick={() => setForceEdit(true)}>
                    Edit
                  </Button>
                )}
                {!isCreate && (
                  <Button basic color="red" onClick={() => setConfirmingDelete(true)}>
                    Delete
                  </Button>
                )}
              </div>
              <div style={btnGroupStyle}>
                <Button basic onClick={onClose} disabled={saving}>
                  {effectiveReadOnly ? "Close" : "Cancel"}
                </Button>
                {!effectiveReadOnly && (
                  <Button
                    primary
                    style={{ backgroundColor: "rgb(153,46,98)" }}
                    loading={saving}
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {isCreate ? "Save Result" : "Update Result"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HivstResultModal;