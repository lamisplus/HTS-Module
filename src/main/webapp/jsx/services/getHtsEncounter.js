import axios from "axios";
import { token, url } from "../../api";

export async function getHtsEcounter(encounterId) {
    try {
        const response = await axios.get(
            `${url}hts-encounter/${encounterId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching HTS encounter:", error.response?.data || error.message);
        throw error;
    }
}