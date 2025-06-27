export const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8789/api/v1/"
        : "/api/v1/";
export const token =
    process.env.NODE_ENV === "development"
        ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUxMDgyNDE4fQ.JX6yzqJRw8dpFQFunH7UEFpf9L-wOf4eTFao5etWaO41-7IM--uN1q6tNebYAPMa2j7SV1ewySBXVxMlUuZAhQ"
        : new URLSearchParams(window.location.search).get("jwt");


        
