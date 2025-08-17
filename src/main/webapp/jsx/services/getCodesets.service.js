import axios from "axios";
import { url as baseUrl, token } from "../../api";
export const getCodesets = async (...codes) => {
    const queryParams = codes.map(code => `codes=${encodeURIComponent(code)}`).join('&');
    const response = await axios
        .get(`${baseUrl}application-codesets/v2/codeSets?${queryParams}`, {
            headers: { Authorization: `Bearer ${token}` },
        })

    return response.data
}
