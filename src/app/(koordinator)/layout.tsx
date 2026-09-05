import Navbar from "@/components/layout/Navbar";

import { RoleSidebar } from "@/components/layout/RoleSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <RoleSidebar role="koordinator" />
      <main className="min-h-screen bg-background pt-[var(--header-height)] lg:pl-64">
        {children}
      </main>
    </>
  );
}
