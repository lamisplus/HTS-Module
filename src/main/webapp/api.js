export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
    process.env.NODE_ENV === "development"
        ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUxNjQwNDI5fQ.QKwAQUv5Jvq_lBLHYV4WM7nzf5sBUgqMKoFHmoP5MZKP1Ih8RIgebFVzm1JfiVMK2RBTev-huUH8mA9eQk6ndA"
        : new URLSearchParams(window.location.search).get("jwt");


        
