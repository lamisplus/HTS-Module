import axios from "axios";
import { url, token } from "../../../../api";

/**
 * Creates a new ICT encounter.
 *
 * @param {Object} payload  — Built by buildIctEncounterPayload() with htsEncounterId attached.
 * @returns {Promise<Object>} The created IctEncounterResponse from the backend.
 */
export const createIctEncounter = async (payload) => {
  const response = await axios.post(
    `${url}ict-encounter`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
