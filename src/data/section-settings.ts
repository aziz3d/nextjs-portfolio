export interface SectionSettings {
  title: string;
  description: string;
}

export interface AllSectionSettings {
  skills: SectionSettings;
  // Add other sections as needed
  projects?: SectionSettings;
  about?: SectionSettings;
  contact?: SectionSettings;
}

// Default section settings
export const defaultSectionSettings: AllSectionSettings = {
  skills: {
    title: "Skills Overview",
    description: "A comprehensive breakdown of my technical and creative abilities across design, development, and specialized tools."
  },
  projects: {
    title: "Featured Projects",
    description: "A selection of my most recent and notable work across various domains and technologies."
  },
  about: {
    title: "About Me",
    description: "Learn more about my background, experience, and what drives me as a creative developer."
  },
  contact: {
    title: "Get In Touch",
    description: "Interested in working together? Reach out through any of these channels."
  }
};
