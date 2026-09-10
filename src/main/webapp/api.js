export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4ODk3MjQzNywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.GFW5eCy5MPFP8z2iCa5vE7-aaHlH055SH3Lf4zzblTbEjZfxGzEvFVfgEHfNU_IkibrC9TCDvu6OZddx4nMQdQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
