import KoordinatorLayoutClient from "./KoordinatorLayoutClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <KoordinatorLayoutClient>{children}</KoordinatorLayoutClient>;
}
