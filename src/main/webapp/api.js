export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsIm5hbWUiOiJyZGUtdXNlciBsYXN0bmFtZSIsImV4cCI6MTc3NTA1Nzk0MX0.S6QY3KTzT-19UngQ4wrWSNiD5-qGi_LKrRImccnC9xu0S1VGUcAedRNPA6DQc7KX8o2xvfkYfc7O1iZUsk-qUA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
