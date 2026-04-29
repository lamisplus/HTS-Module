import React, { useState } from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import {
  PREVIOUSLY_TESTED_OPTIONS,
} from "../constants";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";

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
  const [codesets, setCodesets] = useState(null);

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

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: item.display?.toLowerCase() === "yes" || item.display?.toLowerCase() === "no" ? capitalizeFirstLetter(item.display) : capitalizeFirstLetter(item.display),
      // value: item?.code || item?.display
      value: item?.display
    }));
  };


  const loadCodesets = (data) => {
    setCodesets(data);
  };

  useGetCodesets({
    codesetsKeys: [
      "YES_NO",
      "TARGET_GROUP"
    ],
    patientId: "PostTestCounselling",
    onSuccess: loadCodesets,
  });

  const showCategoryOfClient = values?.hivTestKitsProvided?.toLowerCase() === "yes"
  const showAcceptedIndexTesting = values?.confirmatoryHivTest?.toLowerCase() === "positive"

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
            {...sp("clientReceivedTestResult", transformOptions(codesets?.["YES_NO"]))}
            required
          />
        </div>

        <div className="col-md-6">
          <FormSelect
            label="HIV self Test Kits Provided to Client"
            {...sp("hivTestKitsProvided", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>

        {
          showCategoryOfClient && (
            <div className="col-md-6">
              <FormSelect
                label="Category of clients receiving HIV self test kit"
                {...sp("categoryOfClients", transformOptions(codesets?.["TARGET_GROUP"]))}
              />
            </div>
          )
        }


        {
          showAcceptedIndexTesting && (
            <div className="col-md-6">
              <FormSelect
                label="Accepted Index Testing"
                {...sp("acceptedIndexTesting", transformOptions(codesets?.["YES_NO"]))}
              />
            </div>
          )
        }

        <div className="col-md-6">
          <FormSelect
            label="Provided with Information on FP and Dual Contraception"
            {...sp("providedFpInfo", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client/Partner Use FP Methods (Other Than Condom)"
            {...sp("clientPartnerUseFpMethods", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client/Partner Use Condoms as (one) FP Method"
            {...sp("clientPartnerUseCondoms", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Correct Condom Use Demonstrated"
            {...sp("correctCondomUseDemonstrated", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Condoms Provided to Client"
            {...sp("condomsProvided", transformOptions(codesets?.["YES_NO"]))}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client Referred to Other Services"
            {...sp("clientReferredToOtherServices", transformOptions(codesets?.["YES_NO"]))}
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