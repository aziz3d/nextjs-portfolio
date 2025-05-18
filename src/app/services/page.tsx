import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { ServicesSection } from '@/components/sections/services-section'

export const metadata: Metadata = {
  title: 'Services | Portfolio',
  description: 'Professional services offered including web development, design, and consulting.'
}

export default function ServicesPage() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16 services-page">
        <ServicesSection showHeading={true} />
      </main>
    </>
  )
}
