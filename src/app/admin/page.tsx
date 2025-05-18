'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    timeline: 0,
    testimonials: 0,
    pages: 0
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    
    const fetchStats = async () => {
      try {
        // For API endpoints
        const [projectsRes, skillsRes, timelineRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/skills'),
          fetch('/api/timeline')
        ])
        
        const projectsData = await projectsRes.json()
        const skillsData = await skillsRes.json()
        const timelineData = await timelineRes.json()
        
        // For localStorage items
        const storedTestimonials = localStorage.getItem('testimonials')
        const testimonials = storedTestimonials ? JSON.parse(storedTestimonials) : []
        
        const storedNavItems = localStorage.getItem('navItems')
        const navItems = storedNavItems ? JSON.parse(storedNavItems) : []
        const pages = navItems.filter((item: { type: string }) => item.type === 'page')
        
        setStats({
          projects: projectsData.projects.length,
          skills: skillsData.skills.length,
          timeline: timelineData.timeline.length,
          testimonials: testimonials.length,
          pages: pages.length
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])
  
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="heading-lg mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard
          title="Projects"
          count={stats.projects}
          icon="📁"
          href="/admin/projects"
        />
        <DashboardCard
          title="Skills"
          count={stats.skills}
          icon="🔧"
          href="/admin/skills"
        />
        <DashboardCard
          title="Timeline"
          count={stats.timeline}
          icon="📅"
          href="/admin/timeline"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard
          title="Testimonials"
          count={stats.testimonials}
          icon="💬"
          href="/admin/testimonials"
        />
        <DashboardCard
          title="Pages"
          count={stats.pages}
          icon="📄"
          href="/admin/pages"
        />
        <DashboardCard
          title="Services"
          count={0}
          icon="🛠️"
          href="/admin/services"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard
          title="Navigation"
          count={0}
          icon="🧭"
          href="/admin/navigation"
        />
        <DashboardCard
          title="Footer"
          count={0}
          icon="🔗"
          href="/admin/footer"
        />
        <DashboardCard
          title="3D Models"
          count={3}
          icon="💾"
          href="/admin/3d-models"
        />
      </div>
      
      <div className="bg-white dark:bg-primary/40 p-6 rounded-xl shadow-lg">
        <h2 className="heading-md mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/projects/new')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span>Add New Project</span>
          </button>
          <button
            onClick={() => router.push('/admin/skills/new')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span>Add New Skill</span>
          </button>
          <button
            onClick={() => router.push('/admin/timeline/new')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span>Add Timeline Entry</span>
          </button>
          <button
            onClick={() => router.push('/admin/testimonials/new')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span>Add Testimonial</span>
          </button>
          <button
            onClick={() => router.push('/admin/pages/new')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span>Add New Page</span>
          </button>
          <button
            onClick={() => router.push('/admin/navigation')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">🧭</span>
            <span>Manage Navigation</span>
          </button>
          <button
            onClick={() => router.push('/admin/footer')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">🔗</span>
            <span>Manage Footer</span>
          </button>
          <button
            onClick={() => router.push('/admin/3d-models')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">💾</span>
            <span>Manage 3D Models</span>
          </button>
          <button
            onClick={() => router.push('/admin/profile')}
            className="p-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">👤</span>
            <span>Profile Settings</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">🌐</span>
            <span>View Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, count, icon, href }: { title: string, count: number, icon: string, href: string }) {
  const router = useRouter()
  
  return (
    <div 
      className="bg-white dark:bg-primary/40 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all"
      onClick={() => router.push(href)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-secondary">{count}</p>
      <p className="text-sm text-text/70 dark:text-background/70 mt-2">Total {title.toLowerCase()}</p>
    </div>
  )
}
