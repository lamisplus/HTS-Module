import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import NewPatientHtsForm from "../NewToolForms/NewPatientHtsForm";
import ExistingPatientHtsForm from "../NewToolForms/ExistingPatientHtsForm";
import IctForm from "../IctForm/IctForm";
import { COLORS } from "../NewToolForms/constants";
import { getHtsEcounter } from "../../services/getHtsEncounter";
import { useHistory } from "react-router-dom";

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

const isIctEligible = (htsValues) => {
  if (!htsValues) return false;
  // const sessionMatch = htsValues.typeOfSession.toLowerCase() === "index";
  const positiveResult =
    htsValues.confirmatoryHivTest?.toLowerCase() === "positive"
    // || htsValues.initialHivTest?.toLowerCase() === "positive";
    // return sessionMatch && positiveResult;
    // return true
  return positiveResult
};

const HtsIctOrchestrator = ({
  patientId,
  onDone,
  isExisting = false,
  htsInitial,
  ictInitial,
  isOnArt = false,
  fullRecord,
  existingIctId,    // ID of an existing ICT record to view or edit
  ictReadOnly = false, // When true, ICT form opens in view-only mode
}) => {
  const classes = useStyles();

  const [activeView, setActiveView] = useState(VIEWS.HTS);
  const [ictEligible, setIctEligible] = useState(false);
  const [htsSubmitted, setHtsSubmitted] = useState(false);
  const [htsValues, setHtsValues] = useState(null);   // HTS formik values snapshot
  const [htsRecord, setHtsRecord] = useState(null);   // API response after HTS submit
  const history = useHistory()
  const eligibilityToastFiredRef = useRef(false);

  const [resolvedHtsInitial, setResolvedHtsInitial] = useState(
    htsInitial && Object.keys(htsInitial).length > 0 ? htsInitial : null
  );
  const [isFetchingHts, setIsFetchingHts] = useState(false);

  useEffect(() => {
    // Only run when: viewing an existing record, htsInitial is empty,
    // and the ICT record carries an htsEncounterId to fetch from.
    const htsInitialIsEmpty = !htsInitial || Object.keys(htsInitial).length === 0;
    const htsEncounterId = ictInitial?.htsEncounterId;

    if (isExisting && htsInitialIsEmpty && htsEncounterId) {
      setIsFetchingHts(true);
      getHtsEcounter(htsEncounterId)
        .then((response) => {
          // getHtsEcounter returns response.data (already unwrapped)
          const data = response?.data ?? response;
          if (data) setResolvedHtsInitial(data);
        })
        .catch((err) => {
          console.error("HtsIctOrchestrator: failed to fetch linked HTS record", err?.message);
        })
        .finally(() => setIsFetchingHts(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleHtsSubmitSuccess = (record, formValues) => {
    setHtsRecord(record);
    setHtsValues(formValues);
    setHtsSubmitted(true);

    if (isIctEligible(formValues)) {
      setIctEligible(true);
      setTimeout(() => setActiveView(VIEWS.ICT), 600);
      toast.success("HTS record saved. Opening ICT form…", { autoClose: 3000 });
    }
    else {
      history.push("/")
    }

    // setIctEligible(true);
    // setTimeout(() => setActiveView(VIEWS.ICT), 600);
    // toast.success("HTS record saved. Opening ICT form…", { autoClose: 3000 });
  };

  
  const [ictSubmitted, setIctSubmitted] = useState(false);

  const handleIctSubmitSuccess = (ictResponse) => {
    setIctSubmitted(true);
    onDone?.(ictResponse);
  };


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
          ? htsSubmitted
            ? "Ready to fill"
            : "Eligible — complete HTS first"
          : "Not yet eligible",
      locked: !ictEligible,
      done: ictSubmitted,
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

        {activeView === VIEWS.HTS && isExisting && isFetchingHts && (
          <div style={{ padding: 40, textAlign: "center", color: "#57606a", fontSize: 14 }}>
            Loading HTS record…
          </div>
        )}

        {activeView === VIEWS.HTS && isExisting && !isFetchingHts && (
          <ExistingPatientHtsForm
            fullRecord={fullRecord || { id: ictInitial?.htsEncounterId }}
            initialValues={resolvedHtsInitial}
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
            readOnly={ictReadOnly}
            initialValues={ictInitial}
            existingId={existingIctId}
          />
        )}
      </div>
    </div>
  );
};

// ── Thin wrapper around NewPatientHtsForm to intercept formik values ─────────
/**
 * NewPatientHtsFormWithWatcher
 *
 * Wraps NewPatientHtsForm and forwards every formik value change
 * to the orchestrator via onValuesChange. It does this by monkey-patching
 * the onSubmit so that after the API call succeeds it notifies the parent.
 * For real-time changes we pass a renderProp / callback down via a custom prop.
 *
 * NOTE: The cleanest way to do this is to accept an onValuesChange prop
 * directly inside NewPatientHtsForm and call it inside a useEffect watching
 * formik.values. The snippet below shows the change that needs to be made
 * to NewPatientHtsForm — see the comment block at the bottom of this file.
 */
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

