import Navbar from "@/components/layout/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-[calc(var(--bottom-navigation-height)+env(safe-area-inset-bottom))] pt-[var(--header-height)] md:pb-0">
        {children}
      </main>
    </>
  );
}
