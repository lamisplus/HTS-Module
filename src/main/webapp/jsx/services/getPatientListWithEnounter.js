// src/services/patientSummaries.js
import axios from "axios";
import { url as baseUrl, token } from "../../api";

/**
 * Fetch paginated list of patients with HTS encounter counts.
 * @param {string} search         - Search term (name or hospital number). Use '*' for no filter.
 * @param {number} page           - Zero-based page number.
 * @param {number} size           - Page size.
 * @param {string} sort           - Sort field and direction, e.g., "surname,asc".
 * @returns {Promise<Object>}     - Normalised page object:
 *   { records, totalRecords, pageNumber, pageSize, totalPages }
 */
export const getPatientSummaries = async (
  search = "*",
  page = 0,
  size = 20,
  sort = "surname,asc"
) => {
  try {
    const response = await axios.get(`${baseUrl}hts-encounter/patients`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search, page, size, sort },
    });

    // The backend returns:
    // { totalRecords, pageNumber, pageSize, totalPages, records: [...] }
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching patient summaries:",
      error.response?.data || error.message
    );
    throw error;
  }
};