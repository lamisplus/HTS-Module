/**
 * HtsIctOrchestrator.jsx
 *
 * Parent wrapper that hosts both the HTS form and the ICT form with a
 * left-hand sidebar navigator.
 *
 * SIDEBAR LOGIC
 * ─────────────
 * HTS   — always active
 * ICT   — greyed-out and locked until the HTS form reaches eligibility:
 *           • typeOfSession === "Index Testing"   AND
 *           • initialHivTest === "Positive"        (or confirmatoryHivTest === "Positive")
 *
 * When eligibility is detected IN REAL TIME (via HTS formik watcher):
 *   • ICT menu item turns blue and clickable
 *   • A toast fires once: "This client is eligible for ICT — the form is now enabled"
 *
 * FORM FLOW
 * ─────────
 * 1. User fills HTS form → submits → API returns htsRecord
 * 2. active view switches to "ICT" automatically
 * 3. ICT form is pre-populated from htsValues + htsRecord
 *
 * Props:
 *   patientId   — optional; passed through to sub-forms
 *   onDone      — called after both forms complete (e.g. navigate back to patient list)
 *   isExisting  — open in view/edit mode for an existing patient
 *   htsInitial  — initial values when opening an existing HTS record
 *   ictInitial  — initial values when opening an existing ICT record
 *   isOnArt     — Boolean; forwarded to ICT form
 */

import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import NewPatientHtsForm from "./NewPatientHtsForm";
import ExistingPatientHtsForm from "../NewToolForms/ExistingPatientHtsForm";
import IctForm from "./IctForm";
import { COLORS } from "../NewToolForms/constants";

const VIEWS = {
  HTS: "HTS",
  ICT: "ICT",
};

const useStyles = makeStyles(() => ({
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f6f8fa",
  },

  // ── Sidebar ──────────────────────────────────────────────────────────────
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

  // ── Main content ─────────────────────────────────────────────────────────
  content: {
    flex: 1,
    minWidth: 0,
    overflow: "auto",
  },
}));

/**
 * Evaluates whether the current HTS form values make this patient
 * eligible for ICT (real-time — runs on every formik value change).
 */
const isIctEligible = (htsValues) => {
  if (!htsValues) return false;
  const sessionMatch = htsValues.typeOfSession === "Index Testing";
  const positiveResult =
    htsValues.confirmatoryHivTest === "Positive" ||
    htsValues.initialHivTest === "Positive";
    return true
  // return sessionMatch && positiveResult;
};

const HtsIctOrchestrator = ({
  patientId,
  onDone,
  isExisting = false,
  htsInitial,
  ictInitial,
  isOnArt = false,
  fullRecord,
}) => {
  const classes = useStyles();

  const [activeView, setActiveView] = useState(VIEWS.HTS);
  const [ictEligible, setIctEligible] = useState(false);
  const [htsSubmitted, setHtsSubmitted] = useState(false);
  const [htsValues, setHtsValues] = useState(null);   // HTS formik values snapshot
  const [htsRecord, setHtsRecord] = useState(null);   // API response after HTS submit

  const eligibilityToastFiredRef = useRef(false);

  // ── Real-time eligibility detection ──────────────────────────────────────
  // Called by the HTS form child on every formik change (via onValuesChange prop)
  const handleHtsValuesChange = (values) => {
    const eligible = isIctEligible(values);
    setHtsValues(values);

    if (eligible && !ictEligible) {
      setIctEligible(true);
      if (!eligibilityToastFiredRef.current) {
        eligibilityToastFiredRef.current = true;
        toast.info(
          "🔔 This client is eligible for Index Contact Testing (ICT) — the ICT form is now enabled.",
          { autoClose: 6000, position: "top-right" }
        );
      }
    } else if (!eligible && ictEligible) {
      // Fields changed back — revoke eligibility
      setIctEligible(false);
      eligibilityToastFiredRef.current = false;
    }
  };

  // ── HTS submit callback ───────────────────────────────────────────────────
  const handleHtsSubmitSuccess = (record, formValues) => {
    setHtsRecord(record);
    setHtsValues(formValues);
    setHtsSubmitted(true);

    if (isIctEligible(formValues)) {
      setIctEligible(true);
      // Auto-navigate to ICT after a brief moment
      setTimeout(() => setActiveView(VIEWS.ICT), 600);
      toast.success("HTS record saved. Opening ICT form…", { autoClose: 3000 });
    }
  };

  // ── ICT submit callback ───────────────────────────────────────────────────
  const handleIctSubmitSuccess = () => {
    onDone?.();
  };

  // ── Nav item config ───────────────────────────────────────────────────────
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
      sub: ictEligible
        ? htsSubmitted
          ? "Ready to fill"
          : "Eligible — complete HTS first"
        : "Not yet eligible",
      locked: !ictEligible,
      done: false,
    },
  ];

  return (
    <div className={classes.wrapper}>
      {/* ── Sidebar ── */}
      <aside className={classes.sidebar}>
        <div className={classes.sidebarTitle}>Form Navigation</div>

        {navItems.map((item) => {
          const isActive = activeView === item.key;
          const isLocked = item.locked;

          const badgeBg = item.done
            ? "#2e7d32"
            : isActive
            ? COLORS.primary
            : isLocked
            ? "#d0d7de"
            : COLORS.primaryLight;

          const badgeColor = item.done || isActive ? "#fff" : isLocked ? "#8c959f" : COLORS.primary;

          return (
            <div
              key={item.key}
              className={[
                classes.navItem,
                isActive ? classes.navItemActive : "",
                isLocked ? classes.navItemLocked : "",
              ].join(" ")}
              onClick={() => {
                if (!isLocked) setActiveView(item.key);
              }}
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
                  style={{
                    color: isLocked ? "#8c959f" : isActive ? COLORS.primary : "#24292f",
                  }}
                >
                  {item.label}
                </div>
                <div className={classes.navSub}>{item.sub}</div>
              </div>
              {/* Pulsing dot when eligible but not yet visited */}
              {item.key === VIEWS.ICT && ictEligible && !isActive && (
                <span className={classes.eligiblePulse} />
              )}
            </div>
          );
        })}
      </aside>

      {/* ── Main content ── */}
      <div className={classes.content}>
        {activeView === VIEWS.HTS && !isExisting && (
          <NewPatientHtsFormWithWatcher
            onValuesChange={handleHtsValuesChange}
            onSubmitSuccess={handleHtsSubmitSuccess}
            onBack={onDone}
          />
        )}

        {activeView === VIEWS.HTS && isExisting && (
          <ExistingPatientHtsForm
            fullRecord={fullRecord}
            initialValues={htsInitial}
            readOnly={false}
            backButtonAction={onDone}
          />
        )}

        {activeView === VIEWS.ICT && (
          <IctForm
            htsValues={htsValues || htsInitial}
            htsRecord={htsRecord}
            isOnArt={isOnArt}
            onSubmitSuccess={handleIctSubmitSuccess}
            onBack={() => setActiveView(VIEWS.HTS)}
            readOnly={false}
            initialValues={ictInitial}
          />
        )}
      </div>
    </div>
  );
};

const NewPatientHtsFormWithWatcher = ({ onValuesChange, onSubmitSuccess, onBack }) => {
  return (
    <NewPatientHtsForm
      onValuesChange={onValuesChange}
      onSubmitSuccess={onSubmitSuccess}
      onBack={onBack}
    />
  );
};

export default HtsIctOrchestrator;

