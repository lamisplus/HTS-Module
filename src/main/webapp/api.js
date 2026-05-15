export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODg4NTc4NiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.nl0G0DzZ2-9EsXXo74m9f6TKKZvpUIfIGHOsJQzqGiYiSubVb97EusIPTqD9R3FA1c91EDh6Y_Ip-mUKupYDKA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
