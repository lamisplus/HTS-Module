export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ2NTQ5NzA5fQ.hKxWfmY2EJOPAIPMUDC4xFv_K2oElY-IbGbk3yN2SUzVl08DsglyjWyANDr4iVJtfPCTy1zM9T6Y6uKqqHu0dA"
    : new URLSearchParams(window.location.search).get("jwt");

