import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { useAppSelector } from "@/features/store";
import OnboardingPage from "@/pages/customer-route-pages/onboarding";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const { isAuthenticated, onboarded } = useAppSelector((state) => state.auth);

  if (isAuthenticated && !onboarded) {
    return (
      <>
        <Toaster richColors position="bottom-right" duration={2500} />
        <OnboardingPage />
      </>
    );
  }

  return (
    <>
      <Toaster richColors position="bottom-right" duration={2500} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
