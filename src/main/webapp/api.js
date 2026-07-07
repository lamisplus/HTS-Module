export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4MzQ0MTYyMiwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.d83Md48yYYqSWH4Tr6RzXUF3dkPbXjiCxhUgoSIv33XDe7nzuTBYqlgyjJoLwkhMQ6rhVhMbS6ZfNn84W3fGeQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
