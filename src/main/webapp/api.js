export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3OTAzOTg0NCwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.XufLYvhXvNWPOKyWT9bXRNGVqeg6ZHZJSX0ZQd1UCgbYGuIkMuPBLzXH5Pc2xNLBgTB9z8TrqtpB_6ssJROC5Q"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
