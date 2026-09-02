import Navbar from "@/components/layout/Navbar";
import HelperLayoutClient from "./HelperLayoutClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F5F8FC]">
        {children}
      </main>
      <HelperLayoutClient />
    </>
  );
}
