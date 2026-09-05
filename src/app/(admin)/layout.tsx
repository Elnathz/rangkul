import Navbar from "@/components/layout/Navbar";
import { RoleSidebar } from "@/components/layout/RoleSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <RoleSidebar role="admin" />
      <main className="min-h-screen bg-background pt-[var(--header-height)] lg:pl-64">
        <div className="px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:pb-8">{children}</div>
      </main>
    </>
  );
}
