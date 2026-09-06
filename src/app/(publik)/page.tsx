import CTABannerSection from "@/components/landing/CTABannerSection";
import AboutRangkulSection from "@/components/landing/AboutRangkulSection";
import CommunityTrustSection from "@/components/landing/CommunityTrustSection";
import HeroSection from "@/components/landing/HeroSection";
import RiwayatRangkulPreview from "@/components/landing/RiwayatRangkulPreview";
import RolesSection from "@/components/landing/RolesSection";
import ServicesSection from "@/components/landing/ServicesSection";
import StepsSection from "@/components/landing/StepsSection";

export default function LandingPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <HeroSection />
      <AboutRangkulSection />
      <StepsSection />
      <ServicesSection />
      <RiwayatRangkulPreview />
      <CommunityTrustSection />
      <RolesSection />
      <CTABannerSection />
    </main>
  );
}
