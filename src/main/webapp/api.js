export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0NjQxODgwfQ.fImR1EZwrxfKOA-_rr5jWOTRHVOZvbZpipioOxDPrAz9wIKxYil05elCok5mho6csSdhnTp_M9_guA8ntSw2ZQ"
    : new URLSearchParams(window.location.search).get("jwt");


