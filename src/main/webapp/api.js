export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NTg1Njc1MiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.ynXxqRcQoiXm8lAcYQ0t1jqOnlCAvUxbTxVY3ABhzf01wS7MMU727CIVfmQQqyz-JIdauX_fUGiDLGKD8soU9Q"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
