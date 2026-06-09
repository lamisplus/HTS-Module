export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4MDUwMjcxNSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.JmZiXX_viGAUfgIt4iSgHucV558YNJ7LQ63yAh2RA6uETvIUpPwCHaGCBneqL-9BBRAm8sVA7C9PEnJb1-h0LA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
