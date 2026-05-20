export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3OTExOTA3MCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.FFsTPmC0jV5RTfi0S5SNJPX1ZUoGJn1TNWMZgwspOKs88AG740EJI5DfcuOlTJshoVCk3gqiGvFqk3bpSVm8Qw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
