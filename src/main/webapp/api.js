export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4NDUxMzM4MywibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.mLGWEKGTmAVuxuWCw9dzx4ajFZbzLhwRSsG7Br7QDQ5HgJmVzzIDWtt6odLRHz_rgXrowEPZMO4EbqZA3U1f0Q"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
