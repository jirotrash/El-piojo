import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Sustainability from "@/components/Sustainability";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background transition-colors relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <Sustainability />
        <CTABanner />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
