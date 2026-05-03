export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3Nzg1MTIzMSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.1TVDpIthBInAoT25n2bIZYMzKZ_kjf2Wtx8sw74klreH83wY4I8Jv8-rOhJDQSxchCBFOEzoKMuUlRkdzMpbig"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
