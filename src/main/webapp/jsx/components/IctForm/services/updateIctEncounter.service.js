import axios from "axios";
import { url, token } from "../../../../api";

/**
 * Updates an existing ICT encounter.
 *
 * @param {number} id       — The ICT encounter ID to update.
 * @param {Object} payload  — Built by buildIctEncounterPayload() with htsEncounterId attached.
 * @returns {Promise<Object>} The updated IctEncounterResponse from the backend.
 */
export const updateIctEncounter = async (id, payload) => {
  const response = await axios.put(
    `${url}ict-encounter/${id}`,
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
