import { SkillsSection } from '@/components/sections/skills-section'
import { Navigation } from '@/components/navigation'

export default function SkillsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-24">
        <SkillsSection />
      </div>
    </main>
  )
}
