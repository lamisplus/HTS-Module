import { useCallback } from "react";
import axios from "axios";

export const useCheckedInPatientData = (baseUrl, token) => {
  const fetchPatients = useCallback(async (query) => {
    try {
      const response = await axios.get(`${baseUrl}opd-setting`, {
        headers: { Authorization: `Bearer ${token}` },

      });

      const data = response?.data;
      const htsCode = data?.find?.(
        (item) => item.moduleServiceName.toUpperCase() === "HTS"
      )?.moduleServiceCode;

      if (htsCode) {
        const patientResponse = await axios.get(
          `${baseUrl}patient/checked-in-by-service/${htsCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        return patientResponse?.data;
      }
    } catch (error) {
   
      return [];
    }
  }, [baseUrl, token]);

  return { fetchPatients };
};