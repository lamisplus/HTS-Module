import React from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import {
  YES_NO_OPTIONS,
  PREVIOUSLY_TESTED_OPTIONS,
  CATEGORY_OF_CLIENTS_OPTIONS,
} from "../constants";

const COMPLETED_BY_OPTIONS = [
  { label: "Counsellor", value: "Counsellor" },
  { label: "Nurse", value: "Nurse" },
  { label: "Doctor", value: "Doctor" },
  { label: "Lab Technician", value: "Lab Technician" },
];

const DESIGNATION_OPTIONS = [
  { label: "HTS Provider", value: "HTS Provider" },
  { label: "Nurse", value: "Nurse" },
  { label: "Doctor", value: "Doctor" },
  { label: "Community Health Worker", value: "Community Health Worker" },
];

const PostTestCounsellingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  const fp = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name],
    disabled: readOnly,
  });

  const sp = (name, options) => ({ ...fp(name), options });

  return (
    <div style={{ width: "100%" }}>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Have You Been Tested for HIV Before Within This Year?"
            {...sp("previouslyTestedThisYear", PREVIOUSLY_TESTED_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client Received Test Result?"
            {...sp("clientReceivedTestResult", YES_NO_OPTIONS)}
            required
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="HIV Test Kits Provided to Client"
            {...sp("hivTestKitsProvided", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Category of Clients"
            {...sp("categoryOfClients", CATEGORY_OF_CLIENTS_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Accepted Index Testing"
            {...sp("acceptedIndexTesting", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Provided with Information on FP and Dual Contraception"
            {...sp("providedFpInfo", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client/Partner Use FP Methods (Other Than Condom)"
            {...sp("clientPartnerUseFpMethods", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client/Partner Use Condoms as (one) FP Method"
            {...sp("clientPartnerUseCondoms", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Correct Condom Use Demonstrated"
            {...sp("correctCondomUseDemonstrated", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Condoms Provided to Client"
            {...sp("condomsProvided", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client Referred to Other Services"
            {...sp("clientReferredToOtherServices", YES_NO_OPTIONS)}
          />
        </div>
      </div>

      <SectionSubheading>Sign-off</SectionSubheading>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Completed By"
            {...sp("completedBy", COMPLETED_BY_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Designation"
            {...sp("designation", DESIGNATION_OPTIONS)}
          />
        </div>
      </div>
    </div>
  );
};

export default PostTestCounsellingSection;