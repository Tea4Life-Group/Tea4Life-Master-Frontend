import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Toaster richColors position="bottom-right" duration={2500} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
