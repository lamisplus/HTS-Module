export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4ODQ2MDk5MSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.l68lt3t1soZeW3-nkd9t_erfD9zwneZmOtNyz2KcQvU6-SAaxOZU8ftjus_6nqQo9lEpv91Cgp5SA1grnDOfsA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
