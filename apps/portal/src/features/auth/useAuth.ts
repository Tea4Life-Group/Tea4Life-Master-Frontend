import { useAppSelector } from "../store";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    isAdmin: auth.role === "ADMIN",
    isDriver: auth.role === "DRIVER",
    isStore: auth.role === "STORE",
    isLoading: auth.isLoading || !auth.initialized,
  };
};
