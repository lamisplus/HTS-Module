export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4ODMwNTI4NiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.KlTesmRR6gZEP7xSUB6DxuVSLb5IKDLiLkvJD27O2y7RUFzRU-n-5GVH_nM_7l9f-YYsEUhlqDHCVgyxp3-oSw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
