export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODY4NzI5MywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.bL-lH0sher6FTQG0bZNy4dzKzPOVps3iHe8oGG1NvZ3F7L6ufdbekjxq0nWEQdaZTUszbM8mkUXnj-jp5X5Ttw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
