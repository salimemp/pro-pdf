
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdPlaceholder } from "@/components/ad-placeholder";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      {/* Top Banner Ad */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <AdPlaceholder variant="banner" />
      </div>
      
      <main id="main-content" role="main">
        <HeroSection />
        
        {/* Mid-content Ad */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdPlaceholder variant="rectangle" />
        </div>
        
        <FeaturesSection />
        
        {/* Another Mid-content Ad */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdPlaceholder variant="banner" />
        </div>
        
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
