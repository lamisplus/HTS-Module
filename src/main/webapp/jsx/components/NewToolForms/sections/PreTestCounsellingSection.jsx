import React from "react";
import { FormSelect, SectionSubheading, ScoreDisplay } from "./FormFields";
import { COLORS } from "../constants";
import {
  YES_NO_OPTIONS,
  TIME_LAST_NEGATIVE_TEST_OPTIONS,
} from "../constants";

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
  color: COLORS.primary,
  marginBottom: "12px",
  marginTop: "4px",
};

const KNOWLEDGE_FIELDS = [
  "clientInformedTransmissionRoutes",
  "clientInformedRiskFactors",
  "clientInformedPreventionMethods",
  "clientInformedPossibleResults",
  "informedConsentGiven",
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
];

const TB_FIELDS = ["currentCough", "weightLoss", "fever", "nightSweats"];

const calcScore = (fields, values) =>
  fields.reduce((sum, f) => sum + (values[f] === "Yes" ? 1 : 0), 0);

const PreTestCounsellingSection = ({ formik, readOnly }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

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
    if (e.target.value !== "Yes") setFieldValue("timeOfLastNegativeTest", "");
  };

  const handleEverHadSexChange = (e) => {
    const val = e.target.value;
    setFieldValue("everHadSexualIntercourse", val);
    if (val !== "Yes") {
      ["moreThanOneSexPartner", "unprotectedVaginalSex", "unprotectedAnalSex", "sexUnderInfluence", "historyOfSTI"].forEach(
        (f) => setFieldValue(f, "")
      );
    }
  };

  const skipSection =
    values.modality === "PMTCT" || (values.age && Number(values.age) <= 15);

  const showTimeSinceNegative = values.previouslyTestedNegative === "Yes";
  const showSexDependent = values.everHadSexualIntercourse === "Yes";
  const showSexPartnerRisk = values.everHadSexualIntercourse === "Yes";
  const isFemale = values.sex === "Female";
  const isMale = values.sex === "Male";

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

  return (
    <div style={{ width: "100%" }}>
      <SectionSubheading>(A) Knowledge Assessment</SectionSubheading>

      {skipSection ? (
        <div style={skippedNoticeStyle}>
          Knowledge Assessment is not applicable for PMTCT modality or clients aged 15 and below.
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-6">
              <FormSelect
                label="Previously Tested HIV Negative?"
                {...sp("previouslyTestedNegative", YES_NO_OPTIONS)}
                onChange={readOnly ? undefined : handlePreviouslyTestedChange}
              />
            </div>
            {showTimeSinceNegative && (
              <div className="col-md-6">
                <FormSelect
                  label="Time of Last HIV Negative Test Result"
                  {...sp("timeOfLastNegativeTest", TIME_LAST_NEGATIVE_TEST_OPTIONS)}
                />
              </div>
            )}
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About HIV Transmission Routes"
                {...sp("clientInformedTransmissionRoutes", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About Risk Factors for HIV Transmission"
                {...sp("clientInformedRiskFactors", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed on Preventing HIV Transmission Methods"
                {...sp("clientInformedPreventionMethods", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Client Informed About Possible Test Results"
                {...sp("clientInformedPossibleResults", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Informed Consent for HIV Testing Given"
                {...sp("informedConsentGiven", YES_NO_OPTIONS)}
              />
            </div>
          </div>
          <ScoreDisplay label="Knowledge Assessment Score:" score={knowledgeScore} />
        </>
      )}

      <SectionSubheading>(B) Personal HIV Risk Assessment (Last 3 months)</SectionSubheading>

      {skipSection ? (
        <div style={skippedNoticeStyle}>
          Personal HIV Risk Assessment is not applicable for this client.
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-6">
              <FormSelect
                label="Ever Had Sexual Intercourse"
                {...sp("everHadSexualIntercourse", YES_NO_OPTIONS)}
                onChange={readOnly ? undefined : handleEverHadSexChange}
                required
              />
            </div>
            {showSexDependent && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="More Than One Sex Partner"
                    {...sp("moreThanOneSexPartner", YES_NO_OPTIONS)}
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Unprotected Vaginal Sex"
                    {...sp("unprotectedVaginalSex", YES_NO_OPTIONS)}
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="Unprotected Anal Sex"
                    {...sp("unprotectedAnalSex", YES_NO_OPTIONS)}
                  />
                </div>
              </>
            )}
            <div className="col-md-6">
              <FormSelect
                label="Blood Transfusion in Last 3 Months"
                {...sp("bloodTransfusionLast3Months", YES_NO_OPTIONS)}
                required
              />
            </div>
            {showSexDependent && (
              <>
                <div className="col-md-6">
                  <FormSelect
                    label="Sex Under the Influence of Drugs or Alcohol"
                    {...sp("sexUnderInfluence", YES_NO_OPTIONS)}
                  />
                </div>
                <div className="col-md-6">
                  <FormSelect
                    label="History of STI"
                    {...sp("historyOfSTI", YES_NO_OPTIONS)}
                  />
                </div>
              </>
            )}
          </div>
          <ScoreDisplay label="Personal HIV Risk Assessment Score:" score={personalRiskScore} />
        </>
      )}

      <SectionSubheading>(C) TB and Syndromic STI Screening</SectionSubheading>

      <p style={subsectionLabelStyle}>Clinical TB Screening</p>
      <div className="row">
        <div className="col-md-6">
          <FormSelect label="Current Cough" {...sp("currentCough", YES_NO_OPTIONS)} />
        </div>
        <div className="col-md-6">
          <FormSelect label="Weight Loss" {...sp("weightLoss", YES_NO_OPTIONS)} />
        </div>
        <div className="col-md-6">
          <FormSelect label="Fever" {...sp("fever", YES_NO_OPTIONS)} />
        </div>
        <div className="col-md-6">
          <FormSelect label="Night Sweats" {...sp("nightSweats", YES_NO_OPTIONS)} />
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
                {...sp("complaintsVaginalDischarge", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Female: Complaints of Lower Abdominal Pains with or without Vaginal Discharge?"
                {...sp("complaintsLowerAbdominalPain", YES_NO_OPTIONS)}
              />
            </div>
          </>
        )}
        {isMale && (
          <>
            <div className="col-md-6">
              <FormSelect
                label="Male: Complaints of Urethral Discharge or Burning When Urinating?"
                {...sp("complaintsUrethralDischarge", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Male: Complaints of Scrotal Swelling or Pain?"
                {...sp("complaintsScroralSwelling", YES_NO_OPTIONS)}
              />
            </div>
          </>
        )}
        <div className="col-md-6">
          <FormSelect
            label="Complaints of Genital Sore(s)"
            {...sp("complaintsGenitalSores", YES_NO_OPTIONS)}
          />
        </div>
        <div className="col-md-6">
          <FormSelect
            label="Complaints of Swollen Inguinal Lymph Nodes with or without Pains?"
            {...sp("complaintsSwollenLymphNodes", YES_NO_OPTIONS)}
          />
        </div>
      </div>
      <ScoreDisplay label="STI Screening Score:" score={stiScore} />

      <SectionSubheading>Sex Partner Risk Assessment (Last 3 months)</SectionSubheading>

      {values.everHadSexualIntercourse === "No" ? (
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
                {...sp("partnerNewlyDiagnosed", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Partner Pregnant and Currently Receiving ARV for PMTCT?"
                {...sp("partnerPregnantOnArv", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Adolescent (10-19 yrs) Known to be HIV Infected (on ARV or NOT)"
                {...sp("adolescentHivPositive", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Known HIV Positive Partner Not Regularly Taking Drugs"
                {...sp("partnerNotRegularlyOnDrugs", YES_NO_OPTIONS)}
              />
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Known HIV Positive Recently Returned to Treatment After LTFU"
                {...sp("partnerRecentlyReturnedToTreatment", YES_NO_OPTIONS)}
              />
            </div>
          </div>
          <ScoreDisplay label="Sex Partner Risk Assessment Score:" score={sexPartnerRiskScore} />
        </>
      )}
    </div>
  );
};

export default PreTestCounsellingSection;