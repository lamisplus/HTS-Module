export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
    process.env.NODE_ENV === "development"
        ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ4OTcyNTUxfQ.ZqiR4BIMhdeMwZyBLuRNu3GdqXDDDMVXvdyLuS6ZvSSW7iGZnj3jT9Ov09APtYdAU3_8nOcYvIEjejwN5HBIZw"
        : new URLSearchParams(window.location.search).get("jwt");

