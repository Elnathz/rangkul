export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Navbar, no Footer — auth pages are standalone
  return <main className="flex-1">{children}</main>;
}
