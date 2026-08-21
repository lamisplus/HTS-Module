export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NzMyODc0NiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.Zh0eallI4POrQhzd_IxQOKREiWcF1YyNqublU9_y86ujRTqr5ArhPYpL2hwBKCpTKnV_ehB4znONn9THcfp-oA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
