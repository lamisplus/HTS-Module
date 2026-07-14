export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NDA0OTExMCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.4dtsqr_Qc_dOhQBkKNoSO7BYPRWxQ7H6ykcA-NBf8xm40u_ytZxXC1RpTJmewjAqSr-Hu-0i3J8UpppAnrrPFg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
