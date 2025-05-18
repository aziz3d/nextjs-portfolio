'use client'

import React from 'react'
import { 
  FaReact, FaJs, FaHtml5, FaCss3Alt, FaNode, FaPython, 
  FaFigma, FaGithub, FaDatabase, FaCode, FaLaptopCode
} from 'react-icons/fa'
import { 
  SiTypescript, SiNextdotjs, SiThreedotjs, SiTailwindcss, 
  SiAdobecreativecloud, SiBlender, SiUnity, SiAdobephotoshop, 
  SiAdobeillustrator, SiAdobexd, SiAdobeaftereffects
} from 'react-icons/si'



// Map of icon names to their components
const iconMap = {
  // Development icons
  react: FaReact,
  javascript: FaJs,
  typescript: SiTypescript,
  html: FaHtml5,
  css: FaCss3Alt,
  nextjs: SiNextdotjs,
  threejs: SiThreedotjs,
  nodejs: FaNode,
  python: FaPython,
  tailwind: SiTailwindcss,
  
  // Design icons
  figma: FaFigma,
  adobe: SiAdobecreativecloud,
  photoshop: SiAdobephotoshop,
  illustrator: SiAdobeillustrator,
  xd: SiAdobexd,
  aftereffects: SiAdobeaftereffects,
  blender: SiBlender,
  
  // Other icons
  github: FaGithub,
  database: FaDatabase,
  code: FaCode,
  unity: SiUnity,
  development: FaLaptopCode
}

interface PredefinedIconProps {
  name: string
  className?: string
}

export default function PredefinedIcon({ name, className = 'w-6 h-6' }: PredefinedIconProps) {
  // Convert name to lowercase and remove spaces
  const normalizedName = name.toLowerCase().replace(/\s+/g, '')
  
  // Get the icon component
  const IconComponent = iconMap[normalizedName as keyof typeof iconMap]
  
  if (IconComponent) {
    return <IconComponent className={className} />
  }
  
  // Fallback for icons that don't exist
  return (
    <div className={`${className} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs`}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  )
}
