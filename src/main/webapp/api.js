export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODI1OTYzNSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.m0r2wSSE0j-OdidG-74Omcxb5_Q2Rwzlj-wa8GAHPObak_vyvg3-T3aEOd0IHNB853b_jtYK6nNj5u5hjCNA0w"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
