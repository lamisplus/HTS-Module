import { useState, useEffect, useMemo } from "react";
import { getRoles } from "../utils/localstorage";


export const useRoles = () => {
  const [roles, setRoles] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(new Set(Array.isArray(rolesData) ? rolesData : []));
      } catch (error) {
      
        setRoles(new Set());
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  const checkRoles = useMemo(
    () => ({
      hasRole: (role) => roles.has(role),
      hasAnyRole: (...rolesToCheck) => rolesToCheck.some((r) => roles.has(r)),
    }),
    [roles]
  );

  return { ...checkRoles, loading };
};