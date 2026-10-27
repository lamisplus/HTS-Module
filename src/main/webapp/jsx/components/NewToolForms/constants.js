export const COLORS = {
  primary: "#014d87",
  primaryLight: "#e8f0f7",
  primaryDark: "#013a65",
  border: "#d0d7de",
  text: "#24292f",
  textSecondary: "#57606a",
  background: "#f6f8fa",
  white: "#ffffff",
  error: "#d32f2f",
  success: "#2e7d32",
};


// not currently used but may be recalled
export const MODALITY_OPTIONS = [
  { label: "HTS", value: "HTS" },
  { label: "PMTCT", value: "PMTCT" },
  { label: "Index Contact Testing", value: "INDEX" },
  { label: "SNS", value: "SNS" },
  { label: "OVC", value: "OVC" },
  { label: "PrEP", value: "PREP" },
];

// no codeset yet
export const PREVIOUSLY_TESTED_OPTIONS = [
  { label: "Not previously tested", value: "Not previously tested" },
  { label: "Previously tested negative", value: "Previously tested negative" },
  { label: "Previously tested positive in HIV care", value: "Previously tested positive in HIV care" },
  { label: "Previously tested positive not in HIV care", value: "Previously tested positive not in HIV care" },
];

// Initial HIV Test (Rapid Antibody path) uses the HIV_TEST_RESULT codeset; all of its options are offered.
export const INITIAL_HIV_TEST_CODESET = "HIV_TEST_RESULT";
export const INITIAL_HIV_TEST_POSITIVE = "HIV_TEST_RESULT_POSITIVE";
export const INITIAL_HIV_TEST_NEGATIVE = "HIV_TEST_RESULT_NEGATIVE";

// Records saved before the codeset fix carry STI_HIV_RESULT codes in initialHivTest
// (and, for builds from May 2026, in confirmatoryHivTest). They are mapped to the
// current codes when a record is loaded so the form logic recognises them.
export const LEGACY_HIV_RESULT_CODE_MAP = {
  initialHivTest: {
    STI_HIV_RESULT_POSITIVE: INITIAL_HIV_TEST_POSITIVE,
    STI_HIV_RESULT_NEGATIVE: INITIAL_HIV_TEST_NEGATIVE,
  },
  confirmatoryHivTest: {
    STI_HIV_RESULT_POSITIVE: "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE",
    STI_HIV_RESULT_NEGATIVE: "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE",
  },
};

