export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4MzM1Mjk0MywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.GM_4hREpICZZ7YTt6XzAkhwa93zYk1wzT9K3W-OZJqDsOksmcNhrsJqnoXu-C0QHBhFYeP2wYrCnVTBGL1L98A"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
