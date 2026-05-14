export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODc3NzQxMiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.TnNVuNuu3SF5jIhRBolOvsuWPbCt_12W8-LOrQ0_f80MPyY-aZF2kd32kKVN1KJpp7R_iIt9x_4ZkfUJk11znw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
