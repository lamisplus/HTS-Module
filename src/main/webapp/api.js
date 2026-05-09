export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc3ODM2NDAyMSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.P_r3dt-mz--64t245ZkhgWgQbMKlYBE194U-YSNq0I4PP9mmaMEH81n-SiYww6_OowbxG39nmTE3LBdo3cCGgg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
