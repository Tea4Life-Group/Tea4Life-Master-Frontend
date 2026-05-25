import { useAppSelector } from "../store";
import { normalizeRole } from "./roleUtils";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const normalizedRole = normalizeRole(auth.role);
  const storeRoles = ["STORE"];
  const driverRoles = ["DRIVER"];
  const isAdmin = normalizedRole === "ADMIN";

  return {
    ...auth,
    normalizedRole,
    isAdmin,
    isDriver: isAdmin || driverRoles.includes(normalizedRole),
    isStore: isAdmin || storeRoles.includes(normalizedRole),
    isLoading: auth.isLoading || !auth.initialized,
  };
};
