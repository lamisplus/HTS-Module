export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3NzQ0ODgyNywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.K7q4QiMs8n7i8H7ztj8EBSsAbLNXDeH0dr0FDs-vtEcDFowfUt3Xv7UIrQnseh_8lxzErmKf9CBubs_t7_zeNA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
