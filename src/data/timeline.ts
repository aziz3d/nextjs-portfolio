export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  tags?: string[];
  link?: {
    url: string;
    text: string;
  };
}

export const timeline: TimelineItem[] = [
  {
    id: "timeline-1",
    date: "2025",
    title: "Senior Creative Developer",
    description: "Leading the development of interactive web experiences and 3D visualizations for major clients.",
    tags: ["Leadership", "Three.js", "WebGL"],
    link: {
      url: "https://example.com/company1",
      text: "View Company"
    }
  },
  {
    id: "timeline-2",
    date: "2023 - 2025",
    title: "UI/UX Designer & Developer",
    description: "Created responsive interfaces and interactive prototypes for web and mobile applications.",
    tags: ["UI/UX", "React", "Figma"]
  },
  {
    id: "timeline-3",
    date: "2022 - 2023",
    title: "3D Artist & Frontend Developer",
    description: "Developed 3D web experiences and animations for digital marketing campaigns.",
    tags: ["3D Modeling", "Animation", "Frontend"]
  },
  {
    id: "timeline-4",
    date: "2021",
    title: "Interactive Media Design Degree",
    description: "Graduated with honors, specializing in digital interfaces and interactive storytelling.",
    tags: ["Education", "Design", "Interactive Media"]
  }
];
