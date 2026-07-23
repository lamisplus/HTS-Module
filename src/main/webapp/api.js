export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NDgxOTgwMywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.EQvz3OVEzcWLyjtgpYWca5no5qSP7amxZZLxC_0lAzWjTswwsgF5x_yZ8KbNM-3dsAm8oRyhxzp5t05LDCRVVg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
