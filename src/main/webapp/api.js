export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4ODM1NjUzNCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.3eh2aTWoQ8vkIR6Mg50x77KZDUs11YMksbzDeePm2D8sfWO_znHw4xYO7zi5f4_T1uwcppPQfb3nelU8Yw6EMQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
