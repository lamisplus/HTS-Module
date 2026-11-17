export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFJERSIsImV4cCI6MTc5Mzk4NjcyNywibmFtZSI6Ikd1ZXN0IEd1ZXN0In0.oqIBENEdEDdVRRBklH29j_sOYhLH-vIA_VCrIQwTuUN0DDn58dt6XFk__Jba27Y3xBr5UPwOkcOvRokr1gBHRg"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
