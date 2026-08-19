export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NzE2MTk4MywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.1OLoaf5nmxPMSsBGW7aB42VYhMwmzxfmX6-KE3hL5nn3-z83cyUKgKOCBdnVpa_IRVOTZ0DkpdgI2n11H_ancg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
