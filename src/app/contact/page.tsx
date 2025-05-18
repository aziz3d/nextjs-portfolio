import { ContactSection } from '@/components/sections/contact-section'
import { Navigation } from '@/components/navigation'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-24">
        <ContactSection />
      </div>
    </main>
  )
}
