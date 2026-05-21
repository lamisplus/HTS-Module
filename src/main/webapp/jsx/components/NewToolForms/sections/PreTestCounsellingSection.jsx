// src/NewToolForms/sections/PreTestCounsellingSection.jsx
import React, { useEffect, useState } from "react";
import { FormSelect, SectionSubheading, ScoreDisplay } from "./FormFields";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";
import { capitalizeFirstLetter } from "../../utils";

const skippedNoticeStyle = {
  padding: "12px 16px",
  background: "#fff8e1",
  border: "1px solid #ffe082",
  borderRadius: 4,
  fontSize: "14px",
  color: "#5d4037",
  marginBottom: "16px",
};

const subsectionLabelStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#014d87",
  marginBottom: "12px",
  marginTop: "4px",
};

const KNOWLEDGE_FIELDS = [
  "clientInformedTransmissionRoutes",
  "clientInformedRiskFactors",
  "clientInformedPreventionMethods",
  "clientInformedPossibleResults",
  "informedConsentGiven",
  "previouslyTestedNegative",
];

const PERSONAL_RISK_FIELDS = [
  "everHadSexualIntercourse",
  "moreThanOneSexPartner",
  "unprotectedVaginalSex",
  "unprotectedAnalSex",
  "bloodTransfusionLast3Months",
  "sexUnderInfluence",
  "historyOfSTI",
];

const SEX_PARTNER_RISK_FIELDS = [
  "partnerNewlyDiagnosed",
  "partnerPregnantOnArv",
  "adolescentHivPositive",
  "partnerNotRegularlyOnDrugs",
  "partnerRecentlyReturnedToTreatment",
  "hadSexWithHivPositivePartnerInRiskGroup",
];

const TB_FIELDS = ["currentCough", "weightLoss", "fever", "nightSweats"];

const calcScore = (fields, values) =>
  fields.reduce((sum, f) => sum + (values[f] === "YES_NO_YES" ? 1 : 0), 0);

const PreTestCounsellingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
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

  const handlePreviouslyTestedChange = (e) => {
    setFieldValue("previouslyTestedNegative", e.target.value);
    if (e.target.value !== "YES_NO_YES") setFieldValue("timeOfLastNegativeTest", "");
  };

  const handleEverHadSexChange = (e) => {
    const val = e.target.value;
    setFieldValue("everHadSexualIntercourse", val);
    if (val !== "YES_NO_YES") {
      ["moreThanOneSexPartner", "unprotectedVaginalSex", "unprotectedAnalSex",
       "adolescentHivPositive", "sexUnderInfluence", "historyOfSTI"].forEach(
        (f) => setFieldValue(f, "")
      );
    }
  };

  // skip if age <=15 or pregnancy status is pregnant or breastfeeding
  const skipSection =
    (values.age && Number(values.age) <= 15) ||
    values.pregnancyStatus === "PREGANACY_STATUS_PREGNANT" ||
    values.pregnancyStatus === "PREGANACY_STATUS_BREASTFEEDING";

  const showTimeSinceNegative = values.previouslyTestedNegative === "YES_NO_YES";
  const showSexDependent = values.everHadSexualIntercourse === "YES_NO_YES";
  const showSexPartnerRisk = values.everHadSexualIntercourse === "YES_NO_YES";
  const isFemale = values.sex === "SEX_FEMALE";
  const isMale = values.sex === "SEX_MALE";

  const knowledgeScore = calcScore(KNOWLEDGE_FIELDS, values);
  const personalRiskScore = calcScore(PERSONAL_RISK_FIELDS, values);
  const sexPartnerRiskScore = calcScore(SEX_PARTNER_RISK_FIELDS, values);
  const tbScore = calcScore(TB_FIELDS, values);

  const stiFields = [
    ...(isFemale ? ["complaintsVaginalDischarge", "complaintsLowerAbdominalPain"] : []),
    ...(isMale ? ["complaintsUrethralDischarge", "complaintsScroralSwelling"] : []),
    "complaintsGenitalSores",
    "complaintsSwollenLymphNodes",
  ];
  const stiScore = calcScore(stiFields, values);

  const transformOptions = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.id,
      label: item.display.toLowerCase() === 'yes' || item.display.toLowerCase() === 'no' ? capitalizeFirstLetter(item.display) : item.display,
      value: item.code,
    }));
  };

  const loadCodesets = (data) => {
    setCodesets(data);
  };

  useGetCodesets({
    codesetsKeys: ["YES_NO", "RECENT_HIV_TEST"],
    patientId: "pretestingcounselling",
    onSuccess: loadCodesets,
  });

  useEffect(() => {
    if (skipSection) {
      const resetFields = [
        "previouslyTestedNegative", "timeOfLastNegativeTest",
        "clientInformedTransmissionRoutes", "clientInformedRiskFactors",
        "clientInformedPreventionMethods", "clientInformedPossibleResults",
        "informedConsentGiven",
        "everHadSexualIntercourse", "moreThanOneSexPartner",
        "unprotectedVaginalSex", "unprotectedAnalSex",
        "bloodTransfusionLast3Months", "sexUnderInfluence", "historyOfSTI",
        "currentCough", "weightLoss", "fever", "nightSweats",
        "complaintsVaginalDischarge", "complaintsLowerAbdominalPain",
        "complaintsUrethralDischarge", "complaintsScroralSwelling",
        "complaintsGenitalSores", "complaintsSwollenLymphNodes",
        "partnerNewlyDiagnosed", "partnerPregnantOnArv", "adolescentHivPositive",
        "partnerNotRegularlyOnDrugs", "partnerRecentlyReturnedToTreatment",
        "hadSexWithHivPositivePartnerInRiskGroup"
      ];
      resetFields.forEach(field => setFieldValue(field, ""));
    }
  }, [skipSection, setFieldValue]);

  const getSkipMessage = () => {
    if (values.age && Number(values.age) <= 15) {
      return "Pre-test counselling is not applicable for clients aged 15 and below.";
    }
    if (values.pregnancyStatus === "PREGANACY_STATUS_PREGNANT") {
      return "Pre-test counselling is not applicable for pregnant clients.";
    }
    if (values.pregnancyStatus === "PREGANACY_STATUS_BREASTFEEDING") {
      return "Pre-test counselling is not applicable for breastfeeding clients.";
    }
    return "Pre-test counselling is not applicable.";
  };
  
  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>(A) Knowledge Assessment</SectionSubheading>

      {skipSection ? (
        <div style={skippedNoticeStyle}>
          {getSkipMessage()}
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-6">
              <FormSelect
                label="Previously Tested HIV Negative?"
                {...sp("previouslyTestedNegative", transformOptions(codesets?.["YES_NO"]))}
                onChange={readOnly ? undefined : handlePreviouslyTestedChange}
              />
            </div>
            {showTimeSinceNegative && (
              <div className="col-md-6">
                <FormSelect
                  label="Time of Last HIV Negative Test Result"
                  {...sp("timeOfLastNegativeTest", transformOptions(codesets?.["RECENT_HIV_TEST"]))}
                  required
                />
              </div>
            )}
            {/* remaining fields unchanged except the sp uses codesets */}
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About HIV Transmission Routes"
                {...sp("clientInformedTransmissionRoutes", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About Risk Factors for HIV Transmission"
                {...sp("clientInformedRiskFactors", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed on Preventing HIV Transmission Methods"
                {...sp("clientInformedPreventionMethods", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About Possible Test Results"
                {...sp("clientInformedPossibleResults", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Informed Consent for HIV Testing Given"
                {...sp("informedConsentGiven", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
          </div>
          <ScoreDisplay label="Knowledge Assessment Score:" score={knowledgeScore} />
        </>
      )}

      {/* (B) Personal Risk Assessment */}
      <SectionSubheading>(B) Personal HIV Risk Assessment (Last 3 months)</SectionSubheading>
      {skipSection ? (
        <div style={skippedNoticeStyle}>
          {getSkipMessage()}
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-6">
              <FormSelect
                label="Ever Had Sexual Intercourse"
                {...sp("everHadSexualIntercourse", transformOptions(codesets?.["YES_NO"]))}
                onChange={readOnly ? undefined : handleEverHadSexChange}
                required
              />
            </div>
            {showSexDependent && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="More Than One Sex Partner"
                    {...sp("moreThanOneSexPartner", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                {isFemale && (
                  <div className="col-md-6">
                    <FormSelect
                      label="Unprotected Vaginal Sex"
                      {...sp("unprotectedVaginalSex", transformOptions(codesets?.["YES_NO"]))}
                      required
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <FormSelect
                    label="Unprotected Anal Sex"
                    {...sp("unprotectedAnalSex", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
              </>
            )}
            <div className="col-md-6">
              <FormSelect
                label="Blood Transfusion in Last 3 Months"
                {...sp("bloodTransfusionLast3Months", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            {showSexDependent && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="Sex Under the Influence of Drugs or Alcohol"
                    {...sp("sexUnderInfluence", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="History of STI"
                    {...sp("historyOfSTI", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
              </>
            )}
          </div>
          <ScoreDisplay label="Personal HIV Risk Assessment Score:" score={personalRiskScore} />
        </>
      )}

      {/* (C) TB & STI */}
      <SectionSubheading>(C) TB and Syndromic STI Screening</SectionSubheading>
      {skipSection ? (
        <div style={skippedNoticeStyle}>
          {getSkipMessage()}
        </div>
      ) : (
        <div>
          <p style={subsectionLabelStyle}>Clinical TB Screening</p>
          <div className="row">
            <div className="col-md-6">
              <FormSelect label="Current Cough" {...sp("currentCough", transformOptions(codesets?.["YES_NO"]))} required />
            </div>
            <div className="col-md-6">
              <FormSelect label="Weight Loss" {...sp("weightLoss", transformOptions(codesets?.["YES_NO"]))} required />
            </div>
            <div className="col-md-6">
              <FormSelect label="Fever" {...sp("fever", transformOptions(codesets?.["YES_NO"]))} required />
            </div>
            <div className="col-md-6">
              <FormSelect label="Night Sweats" {...sp("nightSweats", transformOptions(codesets?.["YES_NO"]))} required />
            </div>
          </div>
          <ScoreDisplay label="TB Screening Score:" score={tbScore} />

          <p style={subsectionLabelStyle}>Syndromic STI Screening</p>
          <div className="row">
            {isFemale && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="Female: Complaints of Vaginal Discharge or Burning When Urinating?"
                    {...sp("complaintsVaginalDischarge", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Female: Complaints of Lower Abdominal Pains with or without Vaginal Discharge?"
                    {...sp("complaintsLowerAbdominalPain", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
              </>
            )}
            {isMale && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="Male: Complaints of Urethral Discharge or Burning When Urinating?"
                    {...sp("complaintsUrethralDischarge", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Male: Complaints of Scrotal Swelling or Pain?"
                    {...sp("complaintsScroralSwelling", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
              </>
            )}
            <div className="col-md-6">
              <FormSelect
                label="Complaints of Genital Sore(s)"
                {...sp("complaintsGenitalSores", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Complaints of Swollen Inguinal Lymph Nodes with or without Pains?"
                {...sp("complaintsSwollenLymphNodes", transformOptions(codesets?.["YES_NO"]))}
                required
              />
            </div>
          </div>
          <ScoreDisplay label="STI Screening Score:" score={stiScore} />

          <SectionSubheading>Sex Partner Risk Assessment (Last 3 months)</SectionSubheading>
          {values.everHadSexualIntercourse === "YES_NO_NO" ? (
            <div style={skippedNoticeStyle}>
              Sex Partner Risk Assessment is not applicable — client has not had sexual intercourse.
            </div>
          ) : (
            <>
              <p style={{ fontSize: "14px", color: "#57606a", marginBottom: "12px" }}>
                Have you had sex with a partner who is HIV positive and falls in any of the categories below?
              </p>
              <div className="row">
                <div className="col-md-6">
                  <FormSelect
                    label="Partner Newly Diagnosed and Started Treatment < 3-6 Months Ago?"
                    {...sp("partnerNewlyDiagnosed", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Partner Pregnant and Currently Receiving ARV for PMTCT?"
                    {...sp("partnerPregnantOnArv", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                {Number(values?.age) >= 10 && Number(values?.age) <= 19 && (
                  <div className="col-md-6">
                    <FormSelect
                      label="Adolescent (10-19 yrs) Known to be HIV Infected (on ARV or NOT)"
                      {...sp("adolescentHivPositive", transformOptions(codesets?.["YES_NO"]))}
                      required
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <FormSelect
                    label="Known HIV Positive Partner Not Regularly Taking Drugs"
                    {...sp("partnerNotRegularlyOnDrugs", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Known HIV Positive Recently Returned to Treatment After LTFU"
                    {...sp("partnerRecentlyReturnedToTreatment", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <FormSelect
                    label="Have you had sex with a partner who is HIV positive and falls in any of the categories above ?"
                    {...sp("hadSexWithHivPositivePartnerInRiskGroup", transformOptions(codesets?.["YES_NO"]))}
                    required
                  />
                </div>
              </div>
            </>
          )}
          <div className="row">
            <div className="col-md-6">
              <ScoreDisplay label="Sex Partner Risk Assessment Score:" score={sexPartnerRiskScore} />
            </div>
            <div className="col-md-6">
              <ScoreDisplay label="Total HTS Assessment Score:" score={knowledgeScore + personalRiskScore + tbScore + stiScore + sexPartnerRiskScore} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreTestCounsellingSection;