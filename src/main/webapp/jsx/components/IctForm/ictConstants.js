/**
 * ictConstants.js
 * All hardcoded option lists for the ICT form.
 * Fields that come from API codesets are handled inside the components
 * via useGetCodesets — those are NOT listed here.
 */

// ── Section A ──────────────────────────────────────────────────────────────

export const CLIENT_CATEGORY_OPTIONS = [
  { label: "Newly Diagnosed", value: "Newly Diagnosed" },
  { label: "Virally Unsuppressed", value: "Virally Unsuppressed" },
  { label: "RTT (after IIT)", value: "RTT (after IIT)" },
  { label: "Other", value: "Other" },
];

export const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

// ── Section B ──────────────────────────────────────────────────────────────

export const RELATIONSHIP_TO_INDEX_OPTIONS = [
  { label: "1 - Mother", value: "Mother" },
  { label: "2 - Father", value: "Father" },
  { label: "3 - Biological Child", value: "Biological Child" },
  { label: "4 - Spouse", value: "Spouse" },
  { label: "5 - Live-in Partner", value: "Live-in Partner" },
  { label: "6 - Boyfriend/Girlfriend", value: "Boyfriend/Girlfriend" },
  { label: "7 - Casual Partner", value: "Casual Partner" },
  { label: "8 - Social Network/Sex Worker", value: "Social Network/Sex Worker" },
];

export const CONTACT_SEX_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

export const CONTACT_AGE_GROUP_OPTIONS = [
  { label: "< 15 years", value: "<15" },
  { label: "15+ years", value: "15+" },
];

export const NOTIFICATION_METHOD_OPTIONS = [
  { label: "A - Passive/Client Referral", value: "Passive/Client Referral" },
  { label: "B - Provider Assisted", value: "Provider Assisted" },
  { label: "C - Contract", value: "Contract" },
  { label: "D - Dual Referral", value: "Dual Referral" },
  { label: "E - No notification needed/Known HIV Positive", value: "No notification needed/Known HIV Positive" },
  { label: "F - Notification not recommended for safety", value: "Notification not recommended for safety" },
];

export const FOLLOW_UP_LOCATION_OPTIONS = [
  { label: "Facility", value: "Facility" },
  { label: "Workplace", value: "Workplace" },
  { label: "Home", value: "Home" },
  { label: "Others", value: "Others" },
];

export const HIV_TEST_RESULT_OPTIONS = [
  { label: "Negative", value: "Negative" },
  { label: "Positive", value: "Positive" },
];
