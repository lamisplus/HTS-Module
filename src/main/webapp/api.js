export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
    process.env.NODE_ENV === "development"
        ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ4OTQzNDkwfQ.8Gw1gNpp4pEsZcnNBVpr3C_TTmJDGtDG1sXEo3L9zYtZ3lYM3_OLFdttLdXbCJj46gT5ksv8Z5OAb8orM2H3Fw"
        : new URLSearchParams(window.location.search).get("jwt");

