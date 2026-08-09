import { MapPin, ClipboardList, ShieldCheck } from "lucide-react";

// Langkah-langkah dipindahkan ke StepsSection.tsx

export default function HowItWorksSection() {
  return (
    <section id="apa-itu-rangkul" className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Penjelasan Rangkul */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-5">
            Apa itu Rangkul?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed mb-10">
            Rangkul menghubungkan keluarga dengan pendamping lokal yang diverifikasi langsung oleh Koordinator RT/RW setempat. Kami hadir untuk membantu Anda merawat dan memantau kondisi lansia dengan aman.
          </p>

          {/* Tiga pilar Rangkul */}
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-16">
            {[
              {
                icon: MapPin,
                title: "Dekat & Dikenal",
                desc: "Helper berdomisili di RT/RW yang sama. Mereka adalah tetangga yang diverifikasi oleh Ketua RT/RW setempat.",
                color: "bg-teal-50 border-teal-100",
                textColor: "text-teal-700",
              },
              {
                icon: ClipboardList,
                title: "Terstruktur",
                desc: "Setiap kunjungan akan menghasilkan laporan kondisi lansia yang dapat dipantau oleh Keluarga dari mana saja.",
                color: "bg-blue-50 border-blue-100",
                textColor: "text-blue-700",
              },
              {
                icon: ShieldCheck,
                title: "Terpercaya",
                desc: "Sistem harga pasti, verifikasi ketat, dan peran aktif Koordinator memastikan keamanan serta transparansi di setiap pemesanan.",
                color: "bg-indigo-50 border-indigo-100",
                textColor: "text-indigo-700",
              },
            ].map((p) => (
              <div
                key={p.title}
                className={`rounded-2xl border p-5 text-left ${p.color}`}
              >
                <div className={`mb-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 shadow-sm ${p.textColor}`}>
                   <p.icon className="w-5 h-5" />
                </div>
                <h3 className={`font-display font-bold text-sm mb-2 ${p.textColor}`}>
                  {p.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
        </div>
        </div>
      </div>
    </section>
  );
}
