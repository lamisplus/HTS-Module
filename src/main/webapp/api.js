export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ1MzUyMTk0fQ.AHO3N4dN4jqvO-ssyQVTO_g1CoaGYb_u78IuLYhVvTsRifudWMalJmGIN8Ka-MtGITCw6gkL8uJDeBqFdqlEYg"
    : new URLSearchParams(window.location.search).get("jwt");

