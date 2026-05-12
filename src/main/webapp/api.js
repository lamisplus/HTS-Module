export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODYwMzcxNywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.MKg1m4sRfKOy6go29X--OkgUQ3778bKkpa4dJ2Sx00vUdzO_XOXtkx_tGYt0EHsUDVs3VDTjgJimkoWbGM8EzQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
