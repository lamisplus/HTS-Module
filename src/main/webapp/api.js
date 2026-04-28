export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3NzQxNjUyNCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.5p7Sbf5HuMWdMR86ep-o7nsxKjBOTgXsHSyBhPlCjmHmxLFIHDSJT8ypnoFNPs5ZQCXoQUaEEmm3xPkCQNOOpA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
