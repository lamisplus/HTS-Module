export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0MTA2Mzk5fQ.jeSyzglJcQPp614tzwlUwIyVGlBBHE2NzR3g5Qg20vAVzT0mJSuYLOzwzXFAKZJ_ZVBaYtxO-ubO_vvQpziAbA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8383/websocket"
  : "/websocket";


