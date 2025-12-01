export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development" ?
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIsUkRFIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzYxMTU4MTk4fQ.MhcpA68COFX6t7V2i3-3OjOp-1Fli1b_E2enlkvI9HC8LNHCAa_y7FDW_nnmiiLCBMref0oBD4J4H3dsAKywDg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8789/websocket"
  : "/websocket";

