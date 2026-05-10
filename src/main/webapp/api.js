export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODQyNzMwMywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.cbRWs80KolcpdFADrTs6pMriFisTiCOKuyY9fn565DtZX5n9TvweI58bih3sdTud2gqD6_EKgetGt5IVUQ9qAg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
