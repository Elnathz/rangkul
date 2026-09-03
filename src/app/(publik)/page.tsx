import CTABannerSection from "@/components/landing/CTABannerSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import RiwayatRangkulPreview from "@/components/landing/RiwayatRangkulPreview";
import RolesSection from "@/components/landing/RolesSection";
import ServicesSection from "@/components/landing/ServicesSection";
import StepsSection from "@/components/landing/StepsSection";

export default function LandingPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      {/* 1. Hero with Trust Strip */}
      <HeroSection />

      {/* 2. Cara Kerja (3 Langkah) */}
      <StepsSection />

      {/* 3. Layanan (Kategori Jasa & Harga Fix) */}
      <ServicesSection />

      {/* 4. Riwayat Rangkul WOW Section */}
      <RiwayatRangkulPreview />

      {/* 5. Verifikasi Komunitas (3 Pilar Kepercayaan RT/RW) */}
      <HowItWorksSection />

      {/* 6. Pilihan Peran (Keluarga, Helper, Koordinator) */}
      <RolesSection />

      {/* 7. Final Banner CTA */}
      <CTABannerSection />
    </main>
  );
}
