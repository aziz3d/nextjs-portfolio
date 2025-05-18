export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "project-1",
    title: "Interactive 3D Visualization",
    description: "A web-based 3D data visualization platform built with Three.js and React, allowing users to explore complex datasets in an immersive environment.",
    technologies: ["React", "Three.js", "TypeScript", "WebGL"],
    imageUrl: "/images/project1.svg",
    demoUrl: "https://example.com/demo1",
    githubUrl: "https://github.com/example/project1",
    featured: true
  },
  {
    id: "project-2",
    title: "AI-Powered Design Assistant",
    description: "A machine learning application that helps designers generate creative concepts and iterate on designs using computer vision and natural language processing.",
    technologies: ["Python", "TensorFlow", "React", "Flask"],
    imageUrl: "/images/project2.svg",
    demoUrl: "https://example.com/demo2",
    githubUrl: "https://github.com/example/project2",
    featured: true
  },
  {
    id: "project-3",
    title: "Responsive E-Commerce Platform",
    description: "A full-featured e-commerce solution with responsive design, animation effects, and seamless payment integration.",
    technologies: ["Next.js", "Tailwind CSS", "Stripe", "Framer Motion"],
    imageUrl: "/images/project3.svg",
    demoUrl: "https://example.com/demo3",
    githubUrl: "https://github.com/example/project3",
    featured: false
  }
];
