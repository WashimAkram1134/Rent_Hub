import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBarSection } from "@/components/landing/StatsBarSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TrustAndSafetySection } from "@/components/landing/TrustAndSafetySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTABannerSection } from "@/components/landing/CTABannerSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsBarSection />
      <CategoriesSection />
      <HowItWorksSection />
      <TrustAndSafetySection />
      <TestimonialsSection />
      <CTABannerSection />
      <Footer />
    </div>
  );
}
