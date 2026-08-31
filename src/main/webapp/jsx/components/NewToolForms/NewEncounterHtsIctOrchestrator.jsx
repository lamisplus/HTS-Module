import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { toast } from "react-toastify";
import NewEncounterHtsForm from "./NewEncounterHtsForm";
import IctForm from "../IctForm/IctForm";
import { COLORS } from "./constants";
import { useLocation, useHistory } from 'react-router-dom';

const VIEWS = { HTS: "HTS", ICT: "ICT" };

const useStyles = makeStyles(() => ({
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f6f8fa",
  },
  sidebar: {
    width: 220,
    minWidth: 220,
    backgroundColor: "#fff",
    borderRight: "1px solid #d0d7de",
    padding: "24px 0",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#57606a",
    padding: "0 20px 12px",
    borderBottom: "1px solid #d0d7de",
    marginBottom: 8,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    cursor: "pointer",
    borderLeft: "3px solid transparent",
    transition: "all 0.15s ease",
    userSelect: "none",
  },
  navItemActive: {
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  navItemLocked: {
    cursor: "not-allowed",
    opacity: 0.45,
  },
  navBadge: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "12px",
    flexShrink: 0,
  },
  navLabel: {
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  navSub: {
    fontSize: "11px",
    color: "#57606a",
    marginTop: 2,
  },
  eligiblePulse: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2e7d32",
    marginLeft: "auto",
    flexShrink: 0,
    animation: "$pulse 1.5s infinite",
  },
  "@keyframes pulse": {
    "0%": { opacity: 1, transform: "scale(1)" },
    "50%": { opacity: 0.4, transform: "scale(1.4)" },
    "100%": { opacity: 1, transform: "scale(1)" },
  },
  content: {
    flex: 1,
    minWidth: 0,
    overflow: "auto",
  },
}));

const isIctEligible = (htsValues) => {
  if (!htsValues) return false;
  return htsValues.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive";
};


const NewEncounterHtsIctOrchestrator = ({
  person,
  onDone,
  isOnArt = false,
  onEncounterMutated
}) => {
  const classes = useStyles();

  const [activeView, setActiveView] = useState(VIEWS.HTS);
  const [ictEligible, setIctEligible] = useState(false);
  const [htsSubmitted, setHtsSubmitted] = useState(false);
  const [ictSubmitted, setIctSubmitted] = useState(false);
  const [htsValues, setHtsValues] = useState(null); // live formik snapshot
  const [htsRecord, setHtsRecord] = useState(null); // API response after HTS save
  const [showIctPrompt, setShowIctPrompt] = useState(false);
  const eligibilityToastFiredRef = useRef(false);

  const location = useLocation();
  const history = useHistory();
  const skipEligibility = location?.state?.skipEligibility ?? false;

  const updateSkipEligibility = (newValue) => {
    history.replace({
      pathname: location.pathname,
      state: { ...location.state, skipEligibility: newValue },
    });
  };
  // ── Real-time eligibility - fired on every HTS formik change ─────────────
  const handleHtsValuesChange = (values) => {
    setHtsValues(values);
    const eligible = isIctEligible(values);

    if (eligible && !ictEligible) {
      setIctEligible(true);
      if (!eligibilityToastFiredRef.current) {
        eligibilityToastFiredRef.current = true;
        toast.info(
          "This client is eligible for Index Contact Testing (ICT), the ICT form is now enabled.",
          { autoClose: 6000, position: "top-right" }
        );
      }
    } else if (!eligible && ictEligible) {
      setIctEligible(false);
      eligibilityToastFiredRef.current = false;
    }
  };

  // ── HTS submit success ────────────────────────────────────────────────────
  // NewEncounterHtsForm calls onSubmitSuccess(htsRecord, formValues) after a
  // successful API call - same contract as NewPatientHtsForm.
  const handleHtsSubmitSuccess = (record, formValues) => {
    setHtsRecord(record);
    setHtsValues(formValues);
    setHtsSubmitted(true);

    if (isIctEligible(formValues)) {
      setIctEligible(true);
      onEncounterMutated?.()
      // Don't auto-navigate into ICT - ask the user first.
      setShowIctPrompt(true);
    }
    else {
      updateSkipEligibility(false)
      onDone?.()
    }
    // If not eligible, HTS is done and the user can navigate back via onDone.
  };

  // ── ICT skip-confirmation prompt ──────────────────────────────────────────
  const handleProceedToIct = () => {
    setShowIctPrompt(false);
    setActiveView(VIEWS.ICT);
  };

  const handleSkipIct = () => {
    setShowIctPrompt(false);
    updateSkipEligibility(false);
    onDone?.();
  };

  // ── ICT submit success ────────────────────────────────────────────────────
  const handleIctSubmitSuccess = (ictResponse) => {
    setIctSubmitted(true);
    updateSkipEligibility(false)
    onDone?.(ictResponse);
  };

  // ── Sidebar nav config ────────────────────────────────────────────────────
  const navItems = [
    {
      key: VIEWS.HTS,
      step: 1,
      label: "HIV Testing (HTS)",
      sub: htsSubmitted ? "Completed" : "In progress",
      locked: false,
      done: htsSubmitted,
    },
    {
      key: VIEWS.ICT,
      step: 2,
      label: "Index Contact Testing",
      sub: ictSubmitted
        ? "Completed"
        : ictEligible
          ? htsSubmitted ? "Ready to fill" : "Eligible - complete HTS first"
          : "Not yet eligible",
      locked: !ictEligible,
      done: ictSubmitted,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={classes.wrapper}>

      {/* ── Sidebar ── */}
      <aside className={classes.sidebar}>
        <div className={classes.sidebarTitle}>Form Navigation</div>

        {navItems.map((item) => {
          const isActive = activeView === item.key;
          const isLocked = item.locked;

          const badgeBg =
            item.done ? "#2e7d32" :
              isActive ? COLORS.primary :
                isLocked ? "#d0d7de" :
                  COLORS.primaryLight;

          const badgeColor =
            item.done || isActive ? "#fff" :
              isLocked ? "#8c959f" :
                COLORS.primary;

          return (
            <div
              key={item.key}
              className={[
                classes.navItem,
                isActive ? classes.navItemActive : "",
                isLocked ? classes.navItemLocked : "",
              ].join(" ")}
              // onClick={() => { if (!isLocked) setActiveView(item.key); }}
              title={isLocked ? "Complete the HTS form first to unlock ICT" : undefined}
            >
              <span
                className={classes.navBadge}
                style={{ background: badgeBg, color: badgeColor }}
              >
                {item.done ? "✓" : item.step}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  className={classes.navLabel}
                  style={{ color: isLocked ? "#8c959f" : isActive ? COLORS.primary : "#24292f" }}
                >
                  {item.label}
                </div>
                <div className={classes.navSub}>{item.sub}</div>
              </div>
              {item.key === VIEWS.ICT && ictEligible && !isActive && (
                <span className={classes.eligiblePulse} />
              )}
            </div>
          );
        })}
      </aside>

      {/* ── Main content ── */}
      <div className={classes.content}>

        {activeView === VIEWS.HTS && (
          <NewEncounterHtsForm
            person={person}
            backButtonAction={onDone}
            onValuesChange={handleHtsValuesChange}
            onSubmitSuccess={handleHtsSubmitSuccess}
          />
        )}

        {activeView === VIEWS.ICT && (
          <IctForm
            // htsValues feeds Section A index client fields (name, sex, DOB, etc.)
            htsValues={htsValues}
            // htsRecord.id is attached to the ICT payload as htsEncounterId
            htsRecord={htsRecord}
            isOnArt={isOnArt}
            onSubmitSuccess={handleIctSubmitSuccess}
            onBack={() => setActiveView(VIEWS.HTS)}
            readOnly={false}
          />
        )}

      </div>

      {/* ── ICT skip-confirmation modal ── */}
      <Dialog
        open={showIctPrompt}
        onClose={handleSkipIct}
        aria-labelledby="ict-prompt-title"
      >
        <DialogTitle id="ict-prompt-title">Client eligible for Index Contact Testing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The HTS record was saved successfully, and this client is eligible for
            Index Contact Testing (ICT). Do you want to continue and fill the ICT
            form now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkipIct} color="default">
            No, go to HTS history
          </Button>
          <Button
            onClick={handleProceedToIct}
            style={{ backgroundColor: COLORS.primary, color: "#fff" }}
            autoFocus
          >
            Yes, fill ICT form
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewEncounterHtsIctOrchestrator;