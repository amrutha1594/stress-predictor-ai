import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import AbstractSection from "@/components/sections/AbstractSection";
import MethodologySection from "@/components/sections/MethodologySection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import ToolsSection from "@/components/sections/ToolsSection";
import StressLevelsSection from "@/components/sections/StressLevelsSection";
import LimitationsSection from "@/components/sections/LimitationsSection";
import TeamSection from "@/components/sections/TeamSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <AbstractSection />
        <MethodologySection />
        <ArchitectureSection />
        <ToolsSection />
        <StressLevelsSection />
        <LimitationsSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
