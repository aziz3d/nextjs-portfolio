export interface Skill {
  id: string;
  name: string;
  icon?: string; // Can be a predefined icon name or a path to an uploaded SVG
  iconType?: 'predefined' | 'custom'; // Indicates if the icon is a predefined name or a custom SVG
  level: number; // 1-5
  category: string; // Now a free-form string instead of enum
  description?: string;
}

export const skills: Skill[] = [
  {
    id: "skill-1",
    name: "React",
    icon: "react",
    level: 5,
    category: "development"
  },
  {
    id: "skill-2",
    name: "Three.js",
    icon: "threejs",
    level: 4,
    category: "3d"
  },
  {
    id: "skill-3",
    name: "TypeScript",
    icon: "typescript",
    level: 5,
    category: "development"
  },
  {
    id: "skill-4",
    name: "Tailwind CSS",
    icon: "tailwind",
    level: 4,
    category: "development"
  },
  {
    id: "skill-5",
    name: "Blender",
    icon: "blender",
    level: 3,
    category: "3d"
  },
  {
    id: "skill-6",
    name: "Figma",
    icon: "figma",
    level: 4,
    category: "design"
  },
  {
    id: "skill-7",
    name: "TensorFlow",
    icon: "tensorflow",
    level: 3,
    category: "ai"
  },
  {
    id: "skill-8",
    name: "Next.js",
    icon: "nextjs",
    level: 5,
    category: "development"
  }
];
