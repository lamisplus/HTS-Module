export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NzA3MDQwNiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.-lxaz3FcsRhH-mE9oCdISFiPFE-FY2JXc3XTTsD-AvagvzOpBlqVKvE1o9jzooZt0-tB1Yo31L7LUgiWV-35zw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
