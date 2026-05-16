import { useAppSelector } from "../store";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    isAdmin: auth.role.includes("ROLE_ADMIN"),
    isDriver: auth.role.includes("ROLE_DRIVER"),
    isLoading: auth.isLoading || !auth.initialized,
  };
};
