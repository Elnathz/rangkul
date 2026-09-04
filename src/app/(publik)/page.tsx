import CTABannerSection from "@/components/landing/CTABannerSection";
import DemoScenariosSection from "@/components/landing/DemoScenariosSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import RiwayatRangkulPreview from "@/components/landing/RiwayatRangkulPreview";
import RolesSection from "@/components/landing/RolesSection";
import ServicesSection from "@/components/landing/ServicesSection";
import StepsSection from "@/components/landing/StepsSection";

export default function LandingPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <HeroSection />
      <StepsSection />
      <ServicesSection />
      <RiwayatRangkulPreview />
      <HowItWorksSection />
      <RolesSection />
      <DemoScenariosSection />
      <CTABannerSection />
    </main>
  );
}
