export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3NzM1ODYxfQ.plq7o_nWGPrcZuLCL-4tYJgJv7MZNLsT_Vi1C0psRaR1WpT0BLv2cJZy428hu2ioxWVFt--UCEFqr3m1epxRqA"
    : new URLSearchParams(window.location.search).get("jwt");

