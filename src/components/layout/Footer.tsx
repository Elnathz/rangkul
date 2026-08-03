import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const links = {
  Layanan: [
    { label: "Cari Helper", href: "/cari-helper" },
    { label: "Kategori Jasa", href: "/#layanan" },
    { label: "Cara Booking", href: "/#cara-kerja" },
  ],
  Platform: [
    { label: "Tentang Rangkul", href: "/#tentang" },
    { label: "Jadi Helper", href: "/register?role=helper" },
    { label: "Koordinator RT/RW", href: "/register?role=koordinator" },
  ],
  Bantuan: [
    { label: "FAQ", href: "/help/faq" },
    { label: "Tutorial", href: "/help/tutorial" },
    { label: "Hubungi Admin", href: "/help/kontak-admin" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0D47A1] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image 
  src="/logo.png" 
  alt="Logo Rangkul" 
  width={40} 
  height={40} 
  className="w-auto h-auto object-contain" 
/>
              <span className="font-display font-bold text-xl">Rangkul</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Merangkul Jarak,<br />Menjaga yang Tersayang.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/25">
                🌆 SDG 11
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/25">
                💼 SDG 8
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                {title}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/75 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/15" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 Rangkul. ITechno Cup 2026 — Web Development.</p>
          <p>Dibuat dengan ❤️ untuk lansia Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
