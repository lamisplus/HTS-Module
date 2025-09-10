export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development" ?
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU3MzUwMzY3fQ.7pjVjDtuX3cxfa6lw6YxLALoeVNf5F8-BW3ykMdEkvCW9qak_zyLq5OfVi4b5Gu4y1S5Id8m75tr9krh5jZirQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8383/websocket"
  : "/websocket";

