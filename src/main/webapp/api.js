export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development" ?
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huIiwiYXV0aCI6IlJERSxVc2VyIiwibmFtZSI6IkpvaG4gVXNlciIsImV4cCI6MTc1NTgxMjU0NX0.25TjeXMDHdQdFVR5MPpzedJQ-py814Tz3i3rdi1kjybhDYnLklxoZT-3G4GrbN1nkyJCw9Iyf1VEcfV-gNhxXg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8383/websocket"
  : "/websocket";

