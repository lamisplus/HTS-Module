import axios from "axios";
import { token, url } from "../api";
import { getListOfPermission } from "../utility";

export const getStorageValues = (keys) => {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const values = keyArray.reduce((acc, key) => {
      const value = localStorage.getItem(key);
      try {
        acc[key] =
          value && (value.startsWith("[") || value.startsWith("{"))
            ? JSON.parse(value)
            : value;
      } catch {
        acc[key] = value;
      }
      return acc;
    }, {});
    return keyArray.length === 1 ? values[keys] : values;
  } catch (error) {
    return Array.isArray(keys) ? {} : null;
  }
};

export const fetchAndStoreAccountData = async () => {
  try {
    const response = await axios.get(`${url}account`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    

    const lowerCaseArrayUserAccount = response?.data;
    const lowerCaseArrayRoles = response?.data?.roles;
    const lowerCaseArrayPermissions = response?.data?.permissions?.map(str => str.toLowerCase());


    localStorage.setItem("user_account", JSON.stringify(lowerCaseArrayUserAccount));
    localStorage.setItem(
      "currentUser_Roles",
      JSON.stringify(lowerCaseArrayRoles)
    );
    localStorage.setItem(
      "currentUser_Permission",
      JSON.stringify(lowerCaseArrayPermissions)
    );

    const htsApprovedForms = getListOfPermission(lowerCaseArrayPermissions)
    localStorage.setItem("hts_permissions_forms", JSON.stringify(htsApprovedForms))
     
    return {
      user_account: lowerCaseArrayUserAccount,
      currentUser_Roles: lowerCaseArrayRoles,
      currentUser_Permission: lowerCaseArrayPermissions,
    };
  } catch (error) {
    return null;
  }
};

export const getFacilityId = () => {
  const userAccount = getStorageValues("user_account");
  return userAccount?.currentOrganisationUnitId || null;
};

export const getPermissions = async () => {
  try {
    const permissions = getStorageValues("currentUser_Permission");
    if (!permissions) {
      const data = await fetchAndStoreAccountData();
      return Array.isArray(data?.currentUser_Permission)
        ? data.currentUser_Permission
        : [];
    }
    return Array.isArray(permissions) ? permissions : [];
  } catch (error) {
    return [];
  }
};

export const getRoles = async () => {
  const roles = getStorageValues("currentUser_Roles");
  if (!roles) {
    const data = await fetchAndStoreAccountData();
    return data?.currentUser_Roles;
  }
  return roles;
};
