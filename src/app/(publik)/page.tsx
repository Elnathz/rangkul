import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StepsSection from "@/components/landing/StepsSection";
import ServicesSection from "@/components/landing/ServicesSection";
import RolesSection from "@/components/landing/RolesSection";
import JoinHelperSection from "@/components/landing/JoinHelperSection";
import JoinKoordinatorSection from "@/components/landing/JoinKoordinatorSection";
import TopHelpersSection from "@/components/landing/TopHelpersSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTABannerSection from "@/components/landing/CTABannerSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <RolesSection />
      <StepsSection />
      <ServicesSection />
      <JoinHelperSection />
      <TopHelpersSection />
      <JoinKoordinatorSection />
      <TestimonialsSection />
      <CTABannerSection />
    </>
  );
}
