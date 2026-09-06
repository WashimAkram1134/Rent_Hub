import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBarSection } from "@/components/landing/StatsBarSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { EarningsCalculatorSection } from "@/components/landing/EarningsCalculatorSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TrustAndSafetySection } from "@/components/landing/TrustAndSafetySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTABannerSection } from "@/components/landing/CTABannerSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07070F] text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <HeroSection />
      <StatsBarSection />
      <CategoriesSection />
      <EarningsCalculatorSection />
      <HowItWorksSection />
      <TrustAndSafetySection />
      <TestimonialsSection />
      <CTABannerSection />
      <Footer />
    </div>
  );
}
