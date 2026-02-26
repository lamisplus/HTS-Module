import axios from "axios";
import { token, url } from "../../api";

export async function getHtsEcounterForAPatient(patientId) {
    try {
        const response = await axios.get(
            `${url}hts-encounter/patient/${patientId}`,
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