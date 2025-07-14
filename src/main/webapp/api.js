export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUyNTA5OTEyfQ.35sPS-FPdfx02z04aCHU4qQuM0pSHxxSFiF0NfhBqXb7BMCe1QF7-4X4itl0eeO1OeXbj6s_28WgT2KGjbm_aQ"
    : new URLSearchParams(window.location.search).get("jwt");

