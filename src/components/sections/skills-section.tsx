"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Skill } from '@/data/skills'
import { SectionSettings, defaultSectionSettings } from '@/data/section-settings'
import PredefinedIcon from '@/components/icons/PredefinedIcon'

// Default skills as fallback
const defaultSkills = [
  {
    category: "Design",
    items: [
      { name: "Graphic Design", level: 90 },
      { name: "3D Modeling", level: 85 },
      { name: "UI/UX Design", level: 88 },
      { name: "Animation", level: 82 },
      { name: "Illustration", level: 75 },
    ]
  },
  {
    category: "Development",
    items: [
      { name: "JavaScript/TypeScript", level: 92 },
      { name: "React/Next.js", level: 90 },
      { name: "Three.js/WebGL", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "Python", level: 75 },
    ]
  },
  {
    category: "Tools & Technologies",
    items: [
      { name: "Adobe Creative Suite", level: 88 },
      { name: "Blender", level: 82 },
      { name: "Figma", level: 90 },
      { name: "AI/ML Integration", level: 78 },
      { name: "Git/Version Control", level: 85 },
    ]
  }
]

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Helper function to convert skill level (1-5) to percentage (0-100)
const levelToPercentage = (level: number): number => {
  return Math.min(Math.max(level, 1), 5) * 20; // 1 = 20%, 2 = 40%, ..., 5 = 100%
}

// Interface for grouped skills
interface GroupedSkills {
  category: string;
  items: {
    id: string;
    name: string;
    level: number;
    icon?: string;
    iconType?: 'predefined' | 'custom';
    category: string;
  }[];
}

export function SkillsSection() {
  const [skillGroups, setSkillGroups] = useState<GroupedSkills[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>(defaultSectionSettings.skills)
  
  useEffect(() => {
    // Load section settings
    try {
      const storedSectionSettings = localStorage.getItem('sectionSettings')
      if (storedSectionSettings) {
        const allSettings = JSON.parse(storedSectionSettings)
        if (allSettings.skills) {
          setSectionSettings(allSettings.skills)
        }
      }
    } catch (error) {
      console.error('Error loading section settings:', error)
    }
    
    const loadSkills = () => {
      console.log('Loading skills for frontend display...')
      try {
        setIsLoading(true)
        
        // Try to get skills from localStorage
        const storedSkills = localStorage.getItem('skills')
        let skillsData: Skill[] = []
        
        if (storedSkills) {
          try {
            skillsData = JSON.parse(storedSkills)
            console.log('Loaded skills from localStorage:', skillsData)
          } catch (error) {
            console.error('Error parsing skills from localStorage:', error)
          }
        }
        
        if (!skillsData || !Array.isArray(skillsData) || skillsData.length === 0) {
          // If no skills in localStorage, use default skills layout
          setSkillGroups(defaultSkills as GroupedSkills[])
          setIsLoading(false)
          return
        }
        
        console.log('Skills data loaded:', skillsData)
        
        // Group skills by category
        const groupedSkills: Record<string, Skill[]> = {}
        console.log('Grouping skills by category...')
        
        skillsData.forEach(skill => {
          if (!skill || !skill.category) {
            console.warn('Invalid skill data:', skill)
            return
          }
          
          // Capitalize first letter of category
          const category = skill.category.charAt(0).toUpperCase() + skill.category.slice(1)
          
          if (!groupedSkills[category]) {
            groupedSkills[category] = []
          }
          
          groupedSkills[category].push({
            id: skill.id,
            name: skill.name,
            level: levelToPercentage(skill.level),
            icon: skill.icon,
            iconType: skill.iconType,
            category: skill.category
          })
        })
        
        console.log('Grouped skills:', groupedSkills)
        
        // Convert to array format
        const skillGroupsArray = Object.keys(groupedSkills).map(category => ({
          category,
          items: groupedSkills[category]
        }))
        
        console.log('Final skill groups array:', skillGroupsArray)
        setSkillGroups(skillGroupsArray)
      } catch (error) {
        console.error('Error loading skills:', error)
        // Fallback to default skills
        setSkillGroups(defaultSkills as GroupedSkills[])
      } finally {
        setIsLoading(false)
      }
    }
    
    // Load skills initially
    loadSkills()
    
    // Set up event listeners for storage changes
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      // Check if it's a CustomEvent with detail
      if ('detail' in e && e.detail && e.detail.key === 'sectionSettings') {
        // Reload section settings
        try {
          const storedSectionSettings = localStorage.getItem('sectionSettings')
          if (storedSectionSettings) {
            const allSettings = JSON.parse(storedSectionSettings)
            if (allSettings.skills) {
              setSectionSettings(allSettings.skills)
            }
          }
        } catch (error) {
          console.error('Error loading section settings:', error)
        }
      }
      
      // Always reload skills data
      loadSkills()
    }
    
    window.addEventListener('storage', handleStorageChange as EventListener)
    document.addEventListener('custom-storage-event', handleStorageChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener)
      document.removeEventListener('custom-storage-event', handleStorageChange as EventListener)
    }
  }, [])
  return (
    <section id="skills" className="py-20 bg-background dark:bg-primary relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-4">{sectionSettings.title}</h2>
          <p className="body-lg text-text/70 dark:text-background/70 max-w-2xl mx-auto">
            {sectionSettings.description}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {skillGroups.map((skillGroup: GroupedSkills, groupIndex: number) => (
              <motion.div 
                key={`${skillGroup.category}-${groupIndex}`}
                variants={item}
                className="bg-white dark:bg-primary/40 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="heading-md mb-6 text-secondary">{skillGroup.category}</h3>
                <div className="space-y-6">
                  {skillGroup.items.map((skill: Skill, index: number) => (
                    <div key={skill.id || `${skill.name}-${index}`} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {/* Display custom or predefined icon */}
                          <div className="w-6 h-6 mr-2 flex-shrink-0">
                            {skill.icon ? (
                              skill.iconType === 'custom' ? (
                                <Image 
                                  src={skill.icon} 
                                  alt={`${skill.name} icon`} 
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <PredefinedIcon name={skill.icon} className="w-6 h-6 text-secondary" />
                              )
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">
                                {skill.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <span className="mono text-secondary">{skill.level}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-secondary/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl"></div>
    </section>
  )
}
