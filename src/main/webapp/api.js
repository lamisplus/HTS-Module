export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsIm5hbWUiOiJyZGUtdXNlciBsYXN0bmFtZSIsImV4cCI6MTc3Mzc1ODY2MH0.ng2jRid7mGMBHms4mWUrfEzzhnQiOzbBdgi95kmK1Tw2MPFXf8Q17FSofR3qMo44_hwK_AtpcVMhFJCgbUtAxA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
