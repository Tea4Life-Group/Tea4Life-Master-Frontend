import { Outlet } from "react-router-dom";
import Header from "@/components/custom/Header";
import Footer from "@/components/custom/Footer";
import ScrollToTopButton from "@/components/custom/ScrollToTopButton";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col relative w-full">
      <Header />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
