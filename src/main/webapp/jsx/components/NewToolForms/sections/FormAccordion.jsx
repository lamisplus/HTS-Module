import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Avatar,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { COLORS } from "../constants";

const useStyles = makeStyles(() => ({
  accordion: {
    border: `1px solid #d0d7de`,
    borderRadius: "6px !important",
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    "&:before": { display: "none" },
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 6,
    minHeight: "64px !important",
    "&.Mui-expanded": {
      borderBottom: "1px solid #d0d7de",
    },
  },
  summaryContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    margin: "12px 0 !important",
  },
  avatar: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    fontSize: "1.05rem",
    fontWeight: 700,
  },
  title: {
    fontWeight: 700,
    fontSize: "18px",
    color: "#24292f",
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: "13px",
    color: "#57606a",
    marginTop: 2,
  },
  details: {
    padding: "24px 28px 28px",
    backgroundColor: "#fff",
  },
}));

const FormAccordion = ({ step, title, subtitle, children, defaultExpanded }) => {
  const classes = useStyles();
  return (
    <Accordion className={classes.accordion} defaultExpanded={!!defaultExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon style={{ color: COLORS.primary }} />}
        className={classes.summary}
        classes={{ content: classes.summaryContent }}
      >
        <Avatar className={classes.avatar}>{step}</Avatar>
        <div>
          <Typography className={classes.title}>{title}</Typography>
          <Typography className={classes.subtitle}>{subtitle}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default FormAccordion;