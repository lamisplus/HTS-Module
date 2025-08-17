export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8383/api/v1/"
        : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU1NDMzMDI4fQ.ALewU2tQeyMnTBwSrCx9qyFNFz00o2jJxtWqsV1yI3hqbkcUrPv4mo3noDBGaXrGV9HSP1ZOMBwYtI1nwDfU_w"
    : new URLSearchParams(window.location.search).get("jwt");

