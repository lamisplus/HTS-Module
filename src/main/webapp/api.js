export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODg1NjA1NCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.jB1zfDb08pkmwIeogmiCQDS33f9jKZEosrA-JYnOyVm0y6X9Dx4XgtwUAY5qPWgJtiFKlfyE5hiLaqqjs0p_gw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
