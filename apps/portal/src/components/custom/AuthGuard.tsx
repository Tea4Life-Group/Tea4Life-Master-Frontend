import { useAuth } from "@/features/auth/useAuth";
import { Navigate } from "react-router-dom";
import LoginPage from "@/pages/login";
import LoadingScreen from "@/components/custom/LoadingScreen";
import { canAccessRole } from "@/features/auth/roleUtils";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, initialized, role } = useAuth();

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (allowedRoles?.length && !canAccessRole(role, allowedRoles)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
