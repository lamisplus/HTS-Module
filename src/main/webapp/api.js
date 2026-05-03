export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3NzczMzgxNCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.pPhijvkccr_1z-nAA1tMRqILuttzcu9ibM9z4hDaJ6VdmqnlXOykUBaeYjMJ3kJOwnJT5T9ouCDuMmX-5k09Kw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
