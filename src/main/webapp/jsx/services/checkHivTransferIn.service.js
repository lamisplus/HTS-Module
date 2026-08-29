// checkHivTransferIn.service.js
// Deliberately bypasses the shared axios instance and any interceptors it may carry
// (auth-refresh retries, response interceptors, etc). Uses plain fetch with a hard
// timeout and NO retry logic, so this call can fail exactly once and stop - it cannot
// loop, regardless of what api.js's axios instance is configured to do.
import { token, url } from "../../api";

const TIMEOUT_MS = 5000;

export async function checkActiveHivTransferIn(personId, personUuid) {
  if (!personId && !personUuid) return false;

  const params = new URLSearchParams();
  if (personId) params.set("personId", personId);
  if (personUuid) params.set("personUuid", personUuid);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${url}hts-encounter/transfer-in-check?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error(`Transfer-in check failed: HTTP ${response.status}`);
      return false;
    }

    return await response.json();
  } catch (error) {
    // Covers network errors and the abort/timeout case - always resolves, never retries.
    console.error("Transfer-in check errored or timed out:", error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}