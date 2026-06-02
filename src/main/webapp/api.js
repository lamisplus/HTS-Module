export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUtdXNlciIsImF1dGgiOiJTdXBlciBBZG1pbixVc2VyLFJERSIsImV4cCI6MTc4MDMyMzU1OSwibmFtZSI6InJkZS11c2VyIGxhc3RuYW1lIn0.fx-s7kTrhGB0JSt0K6p8zyN4HwDTNRymKAYMU00PYKRaXjFIajNdGt4EEhHhwaWC_nxx2bX77A7sMcQpIf9v_A"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
