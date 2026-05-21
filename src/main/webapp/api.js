export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3OTM1NDgwOCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.lZxkH5wnXaHNCXFCwkd_CQ1jd0Xx66XeC87-Z3kLuoqzFm3yGiGddHAHAqhGYfv7gMEblD6JDc0rKyQtcAwPQA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
