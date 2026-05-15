import axios from "axios";
import { url, token } from "../../api";

export const updateHtsEncounter = async (id, payload) => {
    try {
        const response = await axios.put(
            `${url}hts-encounter/${id}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Error updating encounter:",
            error.response?.data || error.message
        );
        throw error;
    }
};


