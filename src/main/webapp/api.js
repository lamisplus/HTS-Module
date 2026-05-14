export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODgwNzA2MiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.JigtWFDJNTctEqKzFoI3UB-a8lSCJwWbCAzbmhftjTFCwrJ9i0Otej43bj_fGRUGO1x_o6uSt9mqNhyl3Lplug"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
