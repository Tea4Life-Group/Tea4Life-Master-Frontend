import { useAppSelector } from "../store";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const normalizedRole = auth.role.replace(/^ROLE_/, "").toUpperCase();
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
