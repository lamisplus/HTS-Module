export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4Njk5MTcwOCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.Lh8IW3Pnaqq_hn2ShKlYTdoHydnO4x0Ch5dNEchzV880_89eyN5LaJsEoPg0UkuxInD6lwTkSUl7ZQ6vKO7xuQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
