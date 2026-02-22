import axios from "axios";
import { token, url } from "../../api";

export const createEncounter = async (payload) => {
  try {
    const response = await axios.post(
      `${url}hts-encounter`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating encounter:', error.response?.data || error.message);
    throw error;
  }
};