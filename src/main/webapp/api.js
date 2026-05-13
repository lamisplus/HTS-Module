export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODcwOTYzOSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.myvPb-xEjBFSO6ZyZsrRMiMrs6diZ8NOh13J4Fufh5deY2IkFEzckyyMddlxqQfgRi-Qvh3R1bhyLMHtZiUl_w"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
