import HeroSection from "@/components/landing/HeroSection";
import ServicesSection from "@/components/landing/ServicesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TopHelpersSection from "@/components/landing/TopHelpersSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTABannerSection from "@/components/landing/CTABannerSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <TopHelpersSection />
      <TestimonialsSection />
      <CTABannerSection />
    </>
  );
}
