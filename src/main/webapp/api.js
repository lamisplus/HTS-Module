export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODA4NTk3NSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.KNGRTJ2cAnd279tBnM3tOidDCTebG8vHcXqXA7rq3hFehYxNlafm6pH0iFG0aEXmeg4n6h6oN55T_Cp7tQ6-YQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
