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

export const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const SETTING_OPTIONS = [
  { label: "Facility", value: "Facility" },
  { label: "Community", value: "Community" },
];

export const MODALITY_OPTIONS = [
  { label: "HTS", value: "HTS" },
  { label: "PMTCT", value: "PMTCT" },
  { label: "Index Testing", value: "INDEX" },
  { label: "SNS", value: "SNS" },
  { label: "OVC", value: "OVC" },
  { label: "PrEP", value: "PREP" },
];

export const FACILITY_SETTING_OPTIONS = [
  { label: "CT", value: "CT" },
  { label: "TB", value: "TB" },
  { label: "STI", value: "STI" },
  { label: "ANC", value: "ANC" },
  { label: "Blood Bank", value: "BLOOD_BANK" },
  { label: "Emergency", value: "EMERGENCY" },
  { label: "Index", value: "INDEX" },
  { label: "L&D", value: "LD" },
  { label: "Malnutrition", value: "MALNUTRITION" },
  { label: "Others", value: "OTHERS" },
  { label: "Pediatric", value: "PEDIATRIC" },
  { label: "Post Natal Ward/Breastfeeding", value: "POST_NATAL" },
  { label: "PrEP Testing", value: "PREP_TESTING" },
  { label: "Retesting", value: "RETESTING" },
  { label: "SNS", value: "SNS" },
  { label: "Spoke Health Facility", value: "SPOKE" },
  { label: "Standalone HTS", value: "STANDALONE_HTS" },
];

export const COMMUNITY_ENTRY_POINT_OPTIONS = [
  { label: "CT Setting", value: "CT_SETTING" },
  { label: "Congregational Setting", value: "CONGREGATIONAL" },
  { label: "Delivery Homes", value: "DELIVERY_HOMES" },
  { label: "Index", value: "INDEX" },
  { label: "OVC", value: "OVC" },
  { label: "Others", value: "OTHERS" },
  { label: "Outreach", value: "OUTREACH" },
  { label: "SNS", value: "SNS" },
  { label: "Standalone HTS", value: "STANDALONE_HTS" },
  { label: "TBA Orthodox", value: "TBA_ORTHODOX" },
  { label: "TBA rt-HCW", value: "TBA_RT_HCW" },
];

export const MARITAL_STATUS_OPTIONS = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Widowed", value: "Widowed" },
  { label: "Separated", value: "Separated" },
  { label: "Divorced", value: "Divorced" },
];

export const SEX_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

export const TYPE_OF_SESSION_OPTIONS = [
  { label: "Individual", value: "Individual" },
  { label: "Couple", value: "Couple" },
  { label: "Group", value: "Group" },
  { label: "Index Testing", value: "Index Testing" },
  { label: "Previously Self-Tested", value: "Previously Self-Tested" },
];

export const PREGNANCY_STATUS_OPTIONS = [
  { label: "Not Pregnant", value: "Not Pregnant" },
  { label: "Pregnant", value: "Pregnant" },
  { label: "Post Partum", value: "Post Partum" },
  { label: "Breastfeeding", value: "Breastfeeding" },
];

export const BREASTFEEDING_DURATION_OPTIONS = [
  { label: "< 6 months", value: "<6months" },
  { label: ">= 6 months", value: ">=6months" },
];

export const INDEX_RELATIONSHIP_OPTIONS = [
  { label: "Biological", value: "Biological" },
  { label: "Sexual", value: "Sexual" },
  { label: "Social", value: "Social" },
];

export const TIME_LAST_NEGATIVE_TEST_OPTIONS = [
  { label: "< 1 month", value: "<1month" },
  { label: "< 3 months", value: "<3months" },
  { label: "> 6 months", value: ">6months" },
];

export const HIV_TEST_RESULT_OPTIONS = [
  { label: "Negative", value: "Negative" },
  { label: "Positive", value: "Positive" },
];

export const CONFIRMATORY_TEST_OPTIONS = [
  { label: "Negative", value: "Negative" },
  { label: "Positive", value: "Positive" },
];

export const SYPHILIS_TEST_OPTIONS = [
  { label: "Reactive", value: "Reactive" },
  { label: "Non-reactive", value: "Non-reactive" },
];

export const RECENCY_TEST_OPTIONS = [
  { label: "Recent", value: "Recent" },
  { label: "Long Term", value: "Long Term" },
  { label: "Negative", value: "Negative" },
];

export const HIV_EARLY_DETECT_OPTIONS = [
  { label: "Negative", value: "Negative" },
  { label: "Positive", value: "Positive" },
  { label: "Invalid", value: "Invalid" },
];

export const PREVIOUSLY_TESTED_OPTIONS = [
  { label: "Not previously tested", value: "Not previously tested" },
  { label: "Previously tested negative", value: "Previously tested negative" },
  { label: "Previously tested positive in HIV care", value: "Previously tested positive in HIV care" },
  { label: "Previously tested positive not in HIV care", value: "Previously tested positive not in HIV care" },
];

export const CATEGORY_OF_CLIENTS_OPTIONS = [
  { label: "General Population", value: "General Population" },
  { label: "Key Population", value: "Key Population" },
  { label: "Priority Population", value: "Priority Population" },
  { label: "OVC", value: "OVC" },
  { label: "AGYW", value: "AGYW" },
];

export const DUMMY_STATES = [
  { label: "Lagos", value: "Lagos" },
  { label: "Abuja (FCT)", value: "FCT" },
  { label: "Kano", value: "Kano" },
  { label: "Rivers", value: "Rivers" },
  { label: "Oyo", value: "Oyo" },
];

export const DUMMY_LGAS = {
  Lagos: [
    { label: "Ikeja", value: "Ikeja" },
    { label: "Alimosho", value: "Alimosho" },
    { label: "Surulere", value: "Surulere" },
  ],
  FCT: [
    { label: "Abuja Municipal", value: "Abuja Municipal" },
    { label: "Gwagwalada", value: "Gwagwalada" },
    { label: "Kuje", value: "Kuje" },
  ],
  Kano: [
    { label: "Kano Municipal", value: "Kano Municipal" },
    { label: "Fagge", value: "Fagge" },
  ],
  Rivers: [
    { label: "Port Harcourt", value: "Port Harcourt" },
    { label: "Obio/Akpor", value: "Obio/Akpor" },
  ],
  Oyo: [
    { label: "Ibadan North", value: "Ibadan North" },
    { label: "Ogbomosho North", value: "Ogbomosho North" },
  ],
};