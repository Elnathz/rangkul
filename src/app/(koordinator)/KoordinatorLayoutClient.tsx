"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { RoleSidebar } from "@/components/layout/RoleSidebar";

export default function KoordinatorLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFormPage = pathname === "/koordinator/pengajuan" || pathname === "/koordinator/profil/edit";

  if (isFormPage) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-[var(--header-height)] pb-28 px-4 py-5 sm:px-6 lg:pb-8">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <RoleSidebar role="koordinator" />
      <main className="min-h-screen bg-background pt-[var(--header-height)] pb-28 px-4 py-5 sm:px-6 lg:pl-64 lg:pb-8">
        {children}
      </main>
    </>
  );
}
