import axios from "axios";
import { url, token } from "../../api";


/**
 * Fetches the paginated HTS patient summary list.
 *
 * @param {string}  search   - Free-text search (name / phone / hospital no). Pass "*" for all.
 * @param {number}  page     - Zero-based page index (MaterialTable convention).
 * @param {number}  pageSize - Number of rows per page.
 * @returns {Promise<{ records: Array, totalRecords: number, pageNumber: number, pageSize: number }>}
 */
export const getHtsPatients = async (search = "*", page = 0, pageSize = 20) => {
  const params = new URLSearchParams({
    search: search || "*",
    page,
    size: pageSize,
    // sort: "dateOfVisit,desc",
  });

  const response = await axios.get(`${url}hts-encounter/hts-patients?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // PaginationUtil wraps response as { records, totalRecords, pageNumber, pageSize, totalPages }
  return response.data;
};