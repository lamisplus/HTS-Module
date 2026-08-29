export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4ODAxNjAwMywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.X5x2rpymFZSuuKwh9h6YTw4XtGr0uWFU7YaZZ-FHyKK4sVHcRJMj7nFxlItWOdKQEHKgq7kD7SY5k2LyUtHAnQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
