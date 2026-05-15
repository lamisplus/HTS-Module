export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODg0MjcyNCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.aq-Iz4ERR9T5gqUhy1O0CJXPrXosXwWaYaWOJ99UjDAodoM64MPmE5G_5oMjbLmUqweiosKnfRHk8QS_EQtLpQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
