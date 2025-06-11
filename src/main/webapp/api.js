export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
    process.env.NODE_ENV === "development"
        ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ5NjUzNjY0fQ.gF2BdtdE5bkIEeXhlKeBRZ7vWTCCLj2-5gqYqtLXRsdEq7cBzSYlsW0QKQaEyf6sRd-GxmsUBekvz6kziQxLRQ"
        : new URLSearchParams(window.location.search).get("jwt");

