import { useState, useEffect } from "react";
import axios from "axios";

const useFacilityId = (baseUrl, token,) => {
  const [facilityId, setFacilityId] = useState(null);

  const userAccountData = localStorage.getItem('user_account');
  if (userAccountData) {
    try {
      const storedValues = JSON.parse(userAccountData);
      setFacilityId(storedValues?.currentOrganisationUnitId)
      return facilityId
    } catch (error) {
    
      return null; // Return null if parsing fails
    }
  }
};

export default useFacilityId;
