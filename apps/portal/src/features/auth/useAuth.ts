import { useAppSelector } from "../store";

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

function normalizeRole(role: string | null | undefined): string {
  const normalized = (role ?? "")
    .replace(/^ROLE_/, "")
    .trim()
    .toUpperCase();

  const knownRoles = ["ADMIN", "DRIVER", "STORE", "MEMBER"];
  return knownRoles.find((knownRole) => knownRole === normalized) ?? "";
}
