import { Metadata } from 'next'
import { BlogSection } from '@/components/sections/blog-section'
import { Navigation } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Blog | Portfolio',
  description: 'Read the latest articles about web development, design, and technology.'
}

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-24">
        <BlogSection showHeading={true} />
      </div>
    </main>
  )
}
