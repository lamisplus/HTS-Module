export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzIyMjc4MzU4fQ.-qY3WPGHyrwZP4593p4isv7-DUfV2zIu391UTDdiX0q46MAsCXN3VhIJkmK90iw1wwtNwjzVUHl137yIkcoDzg"
    : new URLSearchParams(window.location.search).get("jwt");
