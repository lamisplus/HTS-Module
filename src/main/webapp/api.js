export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUzMzE5NjQ3fQ.OPGbmIrXWAq0iYQmAipdQr4b7dLqe77EY_A3CuRJoAys6IUZCvau1QC76fgPyIzq1jbXMcILOJUECYraySQZIw"
    : new URLSearchParams(window.location.search).get("jwt");

