export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4Nzk3NzEyOSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.xfxDKmD82v5S1R2kY2YZufuGuU4AgcPUNEcaHg6OEf7HvxBZCdvJXORf94UvUGGXd9FEZANj_8vSiUJUHJAyOA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
