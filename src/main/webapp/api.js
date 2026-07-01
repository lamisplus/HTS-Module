export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4MjkzNTEzOSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.GATZtMNDJPz2yxjBs74aXt7lqfaqDdR4RFw5KexNTnbGGSf9RH6P4UZ8ahhSm_gGUSmNlIONKNYbcVGL8yCR0g"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
