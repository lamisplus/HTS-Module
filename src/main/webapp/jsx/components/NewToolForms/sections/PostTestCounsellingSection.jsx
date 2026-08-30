import React, { useState, useEffect, useMemo } from "react";
import { FormSelect, SectionSubheading } from "./FormFields";
import {
  PREVIOUSLY_TESTED_OPTIONS,
} from "../constants";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";
import { getAllUsers } from "../../../services/getAllUsers.service";

const PostTestCounsellingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;
  const [codesets, setCodesets] = useState(null);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAllUsers = async () => {
      setIsLoadingAllUsers(true);
      try {
        const data = await getAllUsers();
        if (isMounted) {
          setAllUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        if (isMounted) {
          setAllUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAllUsers(false);
        }
      }
    };

    fetchAllUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // "Completed By" options: derived from firstname + lastname of each user
  const completedByOptions = useMemo(() => {
    if (!Array.isArray(allUsers)) return [];
    return allUsers
      .filter((user) => user?.firstName && user?.lastName)
      .map((user) => {
        const fullName = `${user.firstName} ${user.lastName}`;
        return { label: fullName, value: fullName };
      });
  }, [allUsers]);


  const designationOptions = useMemo(() => {
    if (!Array.isArray(allUsers)) return [];

    const toTitleCase = (str) =>
      str
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const seen = new Map(); // normalized key -> display label

    allUsers.forEach((user) => {
      const raw = user?.designation;
      if (!raw || typeof raw !== "string") return;

      const trimmed = raw.trim();
      if (!trimmed) return;

      const key = trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, toTitleCase(trimmed));
      }
    });

    return Array.from(seen.values())
      .sort()
      .map((designation) => ({ label: designation, value: designation }));
  }, [allUsers]);


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
      label: item.display.toLowerCase() === 'yes' || item.display.toLowerCase() === 'no' ? capitalizeFirstLetter(item.display) : item.display,
      value: item?.code
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




  const showCategoryOfClient = values.hivTestKitsProvided === "YES_NO_YES";
  const showAcceptedIndexTesting = values.confirmatoryHivTest?.toLowerCase() === "hiv_confirmatory_test_result_positive";

  return (
    <div style={{ width: "100%" }}>
      <div className="row">
        <div className="col-md-6">
          <FormSelect
            label="Have You Been Tested for HIV Before Within This Year?"
            {...sp("previouslyTestedThisYear", PREVIOUSLY_TESTED_OPTIONS)}
          // required
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Client Received Test Result?"
            {...sp("clientReceivedTestResult", transformOptions(codesets?.["YES_NO"]))}
          // required
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
                {...sp("categoryOfClients", (() => {
                  const rawOptions = transformOptions(codesets?.["TARGET_GROUP"]);
                  const sexValue = values.sex?.toLowerCase();
                  const isMale = sexValue === "sex_male" || sexValue === "male";
                  const isFemale = sexValue === "sex_female" || sexValue === "female";
                  const ageNum = values.age
                    ? parseInt(values.age, 10)
                    : values.dateOfBirth
                      ? (() => {
                        const birth = new Date(values.dateOfBirth);
                        if (isNaN(birth.getTime())) return null;
                        const now = new Date();
                        let y = now.getFullYear() - birth.getFullYear();
                        const m = now.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) y--;
                        return y;
                      })()
                      : null;
                  const isUnder15 = ageNum !== null && ageNum < 15;

                  return rawOptions.filter((opt) => {
                    const code = opt.value; // e.g. "TARGET_GROUP_FSW"
                    // FSW: disabled for males (handled below via disabled prop) — here we keep it visible but see note
                    // MSM: hidden for females
                    if (isFemale && code === "TARGET_GROUP_MSM") return false;
                    if (isMale && code === "TARGET_GROUP_FSW") return false;
                    // Children of KP: only show for clients < 15 years
                    if (code === "TARGET_GROUP_CHILDREN_OF_KP" && !isUnder15) return false;
                    return true;
                  }).map((opt) => {
                    // FSW: disable (not remove) for males
                    if (isMale && opt.value === "TARGET_GROUP_FSW") {
                      return { ...opt, disabled: true };
                    }
                    return opt;
                  });
                })())}
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
            {...sp("completedBy", completedByOptions)}
            disabled={readOnly || isLoadingAllUsers}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Designation"
            {...sp("designation", designationOptions)}
            disabled={readOnly || isLoadingAllUsers}
          />
        </div>
      </div>
    </div>
  );
};

export default PostTestCounsellingSection;