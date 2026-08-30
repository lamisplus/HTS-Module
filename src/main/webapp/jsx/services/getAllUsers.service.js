import axios from "axios";
import { url as baseUrl, token } from "../../api";



export const getAllUsers = async () => {
    const response = await axios
        .get(`${baseUrl}users`, {
            headers: { Authorization: `Bearer ${token}` },
        })

    return response.data
}
