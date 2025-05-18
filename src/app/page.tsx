import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/sections/hero-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { TimelineSection } from "@/components/sections/timeline-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ContactSection } from "@/components/sections/contact-section";
import { HighlightsSection } from "@/components/sections/highlights-section";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />    
        <SkillsSection />
        <ProjectsSection />
        <TimelineSection />
        <TestimonialsSection />
        <HighlightsSection />      
        <ContactSection />
      </main>
    </>
  );
}
