import axios from "axios";
import { url as baseUrl, token } from "../../api";

export const getAllHtsEncounter = async (
  search = "*",
  page = 0,
  size = 20,
  sort = "dateOfVisit,desc"
) => {
  try {
    const response = await axios.get(`${baseUrl}hts-encounter`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search, page, size, sort },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching HTS encounters:",
      error.response?.data || error.message
    );
    throw error;
  }
};