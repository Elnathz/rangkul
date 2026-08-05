import React from "react";

export const RangkulIconOptionsShowcase: React.FC = () => {
  const options = [
    {
      id: "option-1",
      title: "Opsi 1: Pelukan Kehangatan & Perlindungan",
      subtitle: "The Embrace of Care & Trust",
      svgPath: "/rangkul-option1-embrace.svg",
      tag: "Rekomendasi Utama (TDD Default)",
      philosophy: [
        "Lengan Merangkul: Pendampingan tulus dan kehadiran fisik Helper untuk lansia di lapangan.",
        "Simbol Hati di Tengah: Menjaga ikatan batin & kasih sayang antara anak merantau dan orang tua.",
        "Lingkaran Komunitas: Payung perlindungan berbasis struktur RT/RW lokal yang terpercaya."
      ]
    },
    {
      id: "option-2",
      title: "Opsi 2: Rumah Komunitas & Jembatan Kasih",
      subtitle: "The Community Haven & Bridge",
      svgPath: "/rangkul-option2-haven.svg",
      tag: "Fokus Komunitas & Aging in Place",
      philosophy: [
        "Atap & Haven: Lansia dapat tinggal dengan nyaman & aman di rumahnya sendiri (Aging in Place).",
        "Dua Figur Bergandengan: Kemitraan harmonis antara Helper terverifikasi dan Lansia.",
        "Jembatan Pelindung: Menghubungkan jarak fisik antara anak di perantauan dengan kampung halaman."
      ]
    },
    {
      id: "option-3",
      title: "Opsi 3: Simpul Keberlanjutan & Kehidupan",
      subtitle: "Continuous Care Infinity Loop",
      svgPath: "/rangkul-option3-infinity.svg",
      tag: "Fokus Riwayat & Rekam Jejak",
      philosophy: [
        "Simpul Infinity: Perhatian & pemantauan kondisi lansia yang berkelanjutan (Riwayat Rangkul).",
        "Node Hati Terpusat: Fokus utama seluruh ekosistem (Keluarga, Helper, Koordinator) berorientasi pada lansia.",
        "Transisi Biru Terang-Gelap: Simbolisme lintas generasi yang saling menopang dan menguatkan."
      ]
    },
    {
      id: "option-4",
      title: "Opsi 4: Dua Tangan Berpagut & Bintang Harapan",
      subtitle: "Holding Hands & Hope Star",
      svgPath: "/rangkul-option4-hands.svg",
      tag: "Fokus Empati & Harapan",
      philosophy: [
        "Tangan Bergandengan: Kontak fisik & kehangatan emosional antara Helper dan Lansia.",
        "Bintang Harapan: Masa tua yang bermartabat, sejahtera, dan tidak merasa sendirian.",
        "Siluet Hati: Landasan rasa percaya keluarga mempercayakan orang tua kepada Helper."
      ]
    },
    {
      id: "option-5",
      title: "Opsi 5: Perisai Kepercayaan Komunitas",
      subtitle: "Trust Shield & Verification",
      svgPath: "/rangkul-option5-shield.svg",
      tag: "Fokus Keamanan & Legalitas",
      philosophy: [
        "Perisai Utama: Keamanan penuh bagi lansia dan keluarga dari potensi penipuan/bahaya.",
        "Tanda Centang Verifikasi: Peran Koordinator RT/RW yang memverifikasi identitas & integritas Helper.",
        "Emblem Hati: Keamanan yang ditegakkan dengan rasa empati, bukan intimidasi."
      ]
    },
    {
      id: "option-6",
      title: "Opsi 6: Lentera Penjaga & Jejak Kasih",
      subtitle: "Beacon of Care & Compassion",
      svgPath: "/rangkul-option6-beacon.svg",
      tag: "Fokus Ketenangan Perantau",
      philosophy: [
        "Pancaran Lentera: Ketenangan pikiran bagi keluarga di perantauan bahwa orang tua mereka terpantau.",
        "Sinar Terang Komunitas: Menyinari lansia yang tinggal sendirian agar tidak terlupakan.",
        "Pilar Utama: Fondasi platform yang kokoh dan dapat diandalkan 24/7."
      ]
    },
    {
      id: "option-7",
      title: "Opsi 7: Pohon Kehidupan & Pertautan Akar",
      subtitle: "Tree of Generational Life",
      svgPath: "/rangkul-option7-tree.svg",
      tag: "Fokus Keberlanjutan & Akar",
      philosophy: [
        "Akar & Batang Pohon: Lansia adalah akar kebijaksanaan keluarga yang wajib dihormati dan dijaga.",
        "Rindang Dedaunan: Komunitas RT/RW yang memberikan perlindungan dan keteduhan.",
        "Buah Kasih (Hati): Hasil nyata dari pendampingan berkala berupa laporan kesehatan & keceriaan."
      ]
    },
    {
      id: "option-8",
      title: "Opsi 8: Merpati Pembawa Kabar & Ikatan Batin",
      subtitle: "Messenger Dove & Care Note",
      svgPath: "/rangkul-option8-dove.svg",
      tag: "Fokus Laporan & Komunikasi",
      philosophy: [
        "Kepak Sayap Merpati: Pengiriman laporan kunjungan (Health Snapshot + Foto) yang cepat & jujur.",
        "Pesan Kedamaian: Menghilangkan rasa cemas anak rantau terhadap kondisi orang tua.",
        "Lengkung Pelukan: Menjaga ikatan batin keluarga tetap erat meskipun terpisah jarak geografis."
      ]
    },
    {
      id: "option-9",
      title: "Opsi 9: Jam Pasir Keberadaan & Waktu Berharga",
      subtitle: "Precious Moments & Presence",
      svgPath: "/rangkul-option9-moments.svg",
      tag: "Fokus Kunjungan & Menemani",
      philosophy: [
        "Aliran Jam Pasir: Menghargai setiap detik waktu kebersamaan dengan lansia di usia senjanya.",
        "Kunjungan Terjadwal: Kepastian jadwal kunjungan dari Helper lokal.",
        "Dua Ruang Hati: Waktu yang dihabiskan bersama membawa kebahagiaan bagi lansia dan kedamaian bagi anak."
      ]
    },
    {
      id: "option-10",
      title: "Opsi 10: Bunga Teratai Keselarasan 4 Peran",
      subtitle: "Harmonious Lotus & 4 Roles",
      svgPath: "/rangkul-option10-lotus.svg",
      tag: "Fokus Ekosistem 4 Peran",
      philosophy: [
        "4 Kelopak Teratai: 4 peran utama Rangkul (Keluarga, Helper, Koordinator, Lansia) yang berkembang bersama.",
        "Pusat Permata Hati: Nilai kebaikan dan integritas sebagai inti dari seluruh interaksi.",
        "Simetris & Harmonis: Keseimbangan antara teknologi digital dan kearifan lokal masyarakat Indonesia."
      ]
    },
    {
      id: "option-11",
      title: "Opsi 11: Light Background & Deep Blue Focus",
      subtitle: "Solid Light Slate Background",
      svgPath: "/rangkul-option11-light.svg",
      tag: "Varian Latar Terang",
      philosophy: [
        "Latar Cerah (#F8FAFC): Kesan modern, terbuka, dan lapang yang kontras dengan ikon utama yang solid.",
        "Ikon Biru Gelap (#0D47A1): Memperkuat kesan serius, profesionalisme, dan kepercayaan (Trust) yang dalam.",
        "Aksen Bayangan (Drop Shadow): Kedalaman visual yang mengangkat ikon agar tampil lebih menonjol dan hidup."
      ]
    },
    {
      id: "option-12",
      title: "Opsi 12: Pure Outline & Minimalist Clarity",
      subtitle: "White Background, Gradient Strokes",
      svgPath: "/rangkul-option12-outline.svg",
      tag: "Varian Outline Minimalis",
      philosophy: [
        "Garis Tepi (Outline): Transparansi penuh dan kesederhanaan, cocok untuk aplikasi modern dan ringan.",
        "Latar Putih Bersih (#FFFFFF): Kemurnian niat dalam mengasuh lansia tanpa pamrih tersembunyi.",
        "Hati Solid di Tengah: Satu-satunya elemen padat yang menjadi pusat bobot (center of gravity) dari rasa empati."
      ]
    },
    {
      id: "option-13",
      title: "Opsi 13: Warm Soft Blue Horizon",
      subtitle: "Soft Accent Background",
      svgPath: "/rangkul-option13-soft.svg",
      tag: "Varian Latar Lembut",
      philosophy: [
        "Latar Biru Lembut (#E3F2FD): Suasana hangat, tenang, dan bersahabat, menghilangkan kesan kaku/korporat.",
        "Gelombang Belakang: Menyimbolkan jangkauan kasih sayang keluarga yang menyebar dan meluas.",
        "Pusat Kokoh: Penjagaan kokoh (#0D47A1) yang membingkai cahaya putih (kebaikan) di dalamnya."
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0D47A1] tracking-tight">
          13 Opsi Desain Icon & Branding Rangkul
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Didesain berbasis token warna TDD (#0D47A1 & #90CAF9) dengan filosofi mendalam untuk kompetisi ITechno Cup 2026. Termasuk 3 opsi latar berbeda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Header / Badge */}
            <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D47A1] bg-[#90CAF9]/30 px-3 py-1 rounded-full truncate">
                {opt.tag}
              </span>
            </div>

            {/* Icon Preview */}
            <div className="p-6 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
              <img
                src={opt.svgPath}
                alt={opt.title}
                className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-md transition-transform hover:scale-105"
              />
            </div>

            {/* Content & Philosophy */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {opt.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-3">
                  {opt.subtitle}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Filosofi Desain:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                    {opt.philosophy.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
