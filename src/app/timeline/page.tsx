import { TimelineSection } from '@/components/sections/timeline-section'
import { Navigation } from '@/components/navigation'

export default function TimelinePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-24">
        <TimelineSection />
      </div>
    </main>
  )
}
