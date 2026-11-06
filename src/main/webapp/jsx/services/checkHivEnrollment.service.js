
import { token, url } from "../../api";

const TIMEOUT_MS = 500000;

export async function checkActiveHivEnrollment(personId, personUuid) {
  if (!personId && !personUuid) return false;

  const params = new URLSearchParams();
  if (personId) params.set("personId", personId);
  if (personUuid) params.set("personUuid", personUuid);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${url}hts-encounter/hiv-enrollment-check?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error(`HIV enrollment check failed: HTTP ${response.status}`);
      return false;
    }

    return await response.json();
  } catch (error) {
    // Covers network errors and the abort/timeout case - always resolves, never retries.
    console.error("HIV enrollment check errored or timed out:", error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
