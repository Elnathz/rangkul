import Image from "next/image";
import Link from "next/link";

const links = [
  {
    title: "Mulai dari sini",
    items: [
      { label: "Buat kunjungan", href: "/booking/new" },
      { label: "Layanan", href: "/#layanan" },
      { label: "Cara kerja", href: "/#cara-kerja" },
    ],
  },
  {
    title: "Bergabung",
    items: [
      { label: "Daftar sebagai Helper", href: "/register?role=helper" },
      { label: "Daftar sebagai Koordinator", href: "/register?role=koordinator" },
      { label: "Masuk", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#083578] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#083578]">
              <Image src="/logo.png" alt="" aria-hidden="true" width={44} height={44} className="h-10 w-10 object-contain" />
              <span className="font-heading text-xl font-bold">Rangkul</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-blue-100">Pendampingan lokal yang membantu keluarga tetap dekat dengan orang tersayang melalui kunjungan dan catatan yang terstruktur.</p>
          </div>

          {links.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-white">{group.title}</h2>
              <ul className="mt-4 space-y-1">
                {group.items.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-11 items-center text-sm text-blue-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#083578]">{item.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-white/15 pt-5 text-xs text-blue-200">© 2026 Rangkul. ITechno Cup Web Development.</div>
      </div>
    </footer>
  );
}
